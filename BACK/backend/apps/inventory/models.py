from django.db import models
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from django.core.exceptions import ValidationError

from apps.farms.models import Farm, Shed


class InventoryItem(models.Model):
	"""Inventario inteligente por granja/galpón con métricas automáticas"""
	UNIT_CHOICES = [
		('KG', 'Kilogramos'),
		('TON', 'Toneladas'),
		('BAG', 'Sacos'),
		('LB', 'Libras')
	]

	name = models.CharField(max_length=100)
	description = models.TextField(blank=True)
	current_stock = models.DecimalField(max_digits=12, decimal_places=2, default=0)
	unit = models.CharField(max_length=30, choices=UNIT_CHOICES)
	minimum_stock = models.DecimalField(max_digits=10, decimal_places=2, default=0)

	farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='inventory')
	shed = models.ForeignKey(Shed, on_delete=models.CASCADE, null=True, blank=True, related_name='inventory')

	daily_avg_consumption = models.DecimalField(max_digits=8, decimal_places=2, default=0)
	last_restock_date = models.DateField(null=True, blank=True)
	last_consumption_date = models.DateField(null=True, blank=True)

	alert_threshold_days = models.PositiveIntegerField(default=5)
	critical_threshold_days = models.PositiveIntegerField(default=2)

	class Meta:
		unique_together = ['name', 'farm', 'shed']

	def __str__(self):
		return f"{self.name} - {self.location_display}"

	@property
	def location_display(self):
		if self.shed:
			return f"{self.shed.name} ({self.farm.name})"
		return f"General - {self.farm.name}"

	@property
	def projected_stockout_date(self):
		if self.daily_avg_consumption and self.daily_avg_consumption > 0:
			days_remaining = float(self.current_stock) / float(self.daily_avg_consumption)
			return timezone.now().date() + timedelta(days=int(days_remaining))
		return None

	@property
	def stock_status(self):
		if float(self.current_stock) <= 0:
			return {'status': 'OUT_OF_STOCK', 'color': 'red', 'message': 'Sin stock'}

		if float(self.daily_avg_consumption) <= 0:
			return {'status': 'UNKNOWN', 'color': 'gray', 'message': 'Sin histórico'}

		days_remaining = float(self.current_stock) / float(self.daily_avg_consumption)

		if days_remaining <= self.critical_threshold_days:
			return {'status': 'CRITICAL', 'color': 'red', 'message': f'{days_remaining:.1f} días'}
		elif days_remaining <= self.alert_threshold_days:
			return {'status': 'LOW', 'color': 'orange', 'message': f'{days_remaining:.1f} días'}
		else:
			return {'status': 'NORMAL', 'color': 'green', 'message': f'{days_remaining:.1f} días'}

	def update_consumption_metrics(self):
		end_date = timezone.now().date()
		start_date = end_date - timedelta(days=30)

		total = self.consumption_records.filter(date__range=[start_date, end_date]).aggregate(
			total=models.Sum('quantity_consumed')
		)['total'] or 0

		# Promedio por día
		self.daily_avg_consumption = float(total) / 30 if total else 0

		last = self.consumption_records.order_by('-date').first()
		if last:
			self.last_consumption_date = last.date

		self.save(update_fields=['daily_avg_consumption', 'last_consumption_date'])

	def add_stock(self, quantity, entry_date=None):
		"""Agregar stock creando un lote FIFO"""
		if entry_date is None:
			entry_date = timezone.now().date()
			
		# Crear lote FIFO
		batch = FoodBatch.objects.create(
			inventory_item=self,
			entry_date=entry_date,
			initial_quantity=quantity,
			current_quantity=quantity
		)
		
		# Actualizar stock total
		self.current_stock += quantity
		self.last_restock_date = entry_date
		self.save(update_fields=['current_stock', 'last_restock_date'])
		
		return batch

	def consume_fifo(self, quantity_to_consume, flock=None, user=None):
		"""Consumir usando FIFO estricto y retornar detalles de trazabilidad"""
		if quantity_to_consume <= 0:
			raise ValidationError("La cantidad a consumir debe ser mayor a 0")
			
		if float(self.current_stock) < float(quantity_to_consume):
			raise ValidationError(f"Stock insuficiente. Disponible: {self.current_stock}, Solicitado: {quantity_to_consume}")
		
		# Obtener lotes ordenados por fecha (FIFO)
		batches = self.food_batches.filter(current_quantity__gt=0).order_by('entry_date')
		
		remaining_to_consume = float(quantity_to_consume)
		fifo_details = []
		
		for batch in batches:
			if remaining_to_consume <= 0:
				break
				
			batch_available = float(batch.current_quantity)
			consume_from_batch = min(remaining_to_consume, batch_available)
			
			# Actualizar lote
			batch.current_quantity -= consume_from_batch
			batch.save()
			
			# Registrar detalle FIFO
			fifo_details.append({
				'batch_id': batch.id,
				'entry_date': batch.entry_date.isoformat(),
				'quantity_consumed': consume_from_batch,
				'batch_remaining': float(batch.current_quantity)
			})
			
			remaining_to_consume -= consume_from_batch
		
		# Actualizar stock total
		self.current_stock -= quantity_to_consume
		self.save(update_fields=['current_stock'])
		
		# Crear registro de consumo si se proporciona lote
		if flock:
			from apps.flocks.models import Flock
			if isinstance(flock, int):
				flock = Flock.objects.get(id=flock)
				
			consumption_record = FoodConsumptionRecord.objects.create(
				flock=flock,
				inventory_item=self,
				date=timezone.now().date(),
				quantity_consumed=quantity_to_consume,
				fifo_details=fifo_details,
				recorded_by=user or flock.created_by
			)
			
			return consumption_record, fifo_details
		
		return None, fifo_details


class FoodBatch(models.Model):
	"""Lote de alimento para implementar FIFO estricto"""
	inventory_item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name='food_batches')
	entry_date = models.DateField()
	initial_quantity = models.DecimalField(max_digits=12, decimal_places=2)
	current_quantity = models.DecimalField(max_digits=12, decimal_places=2)
	supplier = models.CharField(max_length=100, blank=True)
	lot_number = models.CharField(max_length=50, blank=True)
	expiry_date = models.DateField(null=True, blank=True)
	
	class Meta:
		ordering = ['entry_date']
		indexes = [
			models.Index(fields=['inventory_item', 'entry_date']),
			models.Index(fields=['current_quantity'])
		]
	
	def __str__(self):
		return f"Lote {self.inventory_item.name} - {self.entry_date}"
	
	@property
	def is_depleted(self):
		return float(self.current_quantity) <= 0
	
	@property
	def consumption_rate(self):
		"""Porcentaje consumido del lote"""
		if float(self.initial_quantity) == 0:
			return 0
		return ((float(self.initial_quantity) - float(self.current_quantity)) / float(self.initial_quantity)) * 100


class FoodConsumptionRecord(models.Model):
	"""Registro de consumo de alimento por lote con trazabilidad FIFO completa"""
	flock = models.ForeignKey('flocks.Flock', on_delete=models.CASCADE, related_name='food_consumption_records')
	inventory_item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name='flock_consumption_records')
	date = models.DateField()
	quantity_consumed = models.DecimalField(max_digits=12, decimal_places=2)
	fifo_details = models.JSONField(help_text="Detalles de qué lotes se consumieron")
	recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
	
	# Campos para sincronización offline
	client_id = models.CharField(max_length=50, null=True, blank=True)
	sync_status = models.CharField(max_length=20, default='SYNCED')
	created_by_device = models.CharField(max_length=100, null=True, blank=True)
	
	class Meta:
		unique_together = ['flock', 'inventory_item', 'date']
		indexes = [
			models.Index(fields=['date', 'flock']),
			models.Index(fields=['sync_status'])
		]
	
	def __str__(self):
		return f"Consumo {self.inventory_item.name} - {self.flock} - {self.date}"
	
	def save(self, *args, **kwargs):
		super().save(*args, **kwargs)
		# Actualizar métricas del item de inventario
		try:
			self.inventory_item.update_consumption_metrics()
		except Exception:
			pass


class InventoryConsumptionRecord(models.Model):
	"""Registro diario de consumo de un item de inventario (para métricas generales)"""
	inventory_item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name='consumption_records')
	date = models.DateField()
	quantity_consumed = models.DecimalField(max_digits=12, decimal_places=2)

	class Meta:
		unique_together = ['inventory_item', 'date']

	def save(self, *args, **kwargs):
		super().save(*args, **kwargs)
		# Después de guardar, actualizar métricas en el item
		try:
			self.inventory_item.update_consumption_metrics()
		except Exception:
			pass


class Supplier(models.Model):
	"""Proveedor de insumos para la granja"""
	name = models.CharField(max_length=200, verbose_name='Nombre')
	contact_name = models.CharField(max_length=200, verbose_name='Nombre de contacto')
	email = models.EmailField()
	phone = models.CharField(max_length=20, verbose_name='Teléfono')
	address = models.TextField(verbose_name='Dirección')
	products = models.JSONField(default=list, help_text='Lista de productos que ofrece')
	delivery_time_days = models.PositiveIntegerField(default=3, verbose_name='Tiempo de entrega (días)')
	rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.0, verbose_name='Calificación')
	is_active = models.BooleanField(default=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		verbose_name = 'Proveedor'
		verbose_name_plural = 'Proveedores'
		ordering = ['name']

	def __str__(self):
		return self.name


class Order(models.Model):
	"""Pedido de insumos a proveedores"""
	STATUS_CHOICES = [
		('pendiente', 'Pendiente'),
		('en-transito', 'En Tránsito'),
		('entregado', 'Entregado'),
		('cancelado', 'Cancelado'),
	]
	URGENCY_CHOICES = [
		('normal', 'Normal'),
		('urgente', 'Urgente'),
		('critica', 'Crítica'),
	]

	farm = models.ForeignKey('farms.Farm', on_delete=models.CASCADE, related_name='orders')
	supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT, related_name='orders')
	status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendiente')
	urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='normal')
	order_date = models.DateTimeField(auto_now_add=True)
	expected_delivery_date = models.DateField(verbose_name='Fecha esperada de entrega')
	actual_delivery_date = models.DateField(null=True, blank=True, verbose_name='Fecha real de entrega')
	total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
	notes = models.TextField(blank=True, verbose_name='Observaciones')
	created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_orders')

	class Meta:
		verbose_name = 'Pedido'
		verbose_name_plural = 'Pedidos'
		ordering = ['-order_date']

	def __str__(self):
		return f"Pedido #{self.id} - {self.supplier.name} ({self.get_status_display()})"

	def calculate_total(self):
		"""Calcular el total del pedido basado en items"""
		total = self.items.aggregate(total=models.Sum('subtotal'))['total'] or 0
		self.total = total
		self.save(update_fields=['total'])
		return total


class OrderItem(models.Model):
	"""Item individual dentro de un pedido"""
	order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
	product_name = models.CharField(max_length=200, verbose_name='Producto')
	quantity = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Cantidad')
	unit = models.CharField(max_length=30, verbose_name='Unidad')
	unit_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Precio unitario')
	subtotal = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='Subtotal')
	# Opcional: relación con item de inventario si aplica
	inventory_item = models.ForeignKey(InventoryItem, on_delete=models.SET_NULL, null=True, blank=True, related_name='order_items')

	class Meta:
		verbose_name = 'Item de pedido'
		verbose_name_plural = 'Items de pedido'

	def __str__(self):
		return f"{self.product_name} x{self.quantity}"

	def save(self, *args, **kwargs):
		# Auto-calcular subtotal
		self.subtotal = self.quantity * self.unit_price
		super().save(*args, **kwargs)
		# Actualizar total del pedido
		self.order.calculate_total()
