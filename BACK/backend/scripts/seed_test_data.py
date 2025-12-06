"""
Script para crear datos de prueba: granjas, galpones y lotes
"""
import os
import sys
import django
from datetime import date, timedelta

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'avicolatrack.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from apps.farms.models import Farm, Shed
from apps.flocks.models import Flock
from decimal import Decimal

User = get_user_model()

def create_test_data():
    print("🌱 Creando datos de prueba...")
    
    # Obtener admin user
    try:
        admin = User.objects.get(username='admin')
    except User.DoesNotExist:
        print("❌ Usuario admin no existe. Ejecuta check_admin.py primero")
        return
    
    # Crear Farm
    farm, created = Farm.objects.get_or_create(
        name='granja-1',
        defaults={
            'location': 'Zona Rural Norte',
            'farm_manager': admin,
        }
    )
    if created:
        print(f"✅ Granja creada: {farm.name}")
    else:
        print(f"ℹ️  Granja ya existe: {farm.name}")
    
    # Crear Shed
    shed, created = Shed.objects.get_or_create(
        name='galpon-1',
        farm=farm,
        defaults={
            'capacity': 5000,
            'assigned_worker': admin
        }
    )
    if created:
        print(f"✅ Galpón creado: {shed.name}")
    else:
        print(f"ℹ️  Galpón ya existe: {shed.name}")
    
    # Crear Flock (lote)
    today = date.today()
    start_date = today - timedelta(days=30)  # Lote de 30 días
    
    # Buscar si ya existe un lote con ID lote-09
    # Como no tiene campo name, buscaremos por ID directamente
    try:
        flock = Flock.objects.get(id=9)
        print(f"ℹ️  Lote ya existe: Lote {flock.id}")
        created = False
    except Flock.DoesNotExist:
        flock = Flock.objects.create(
            shed=shed,
            breed='Cobb 500',
            initial_quantity=4500,
            current_quantity=4350,
            initial_weight=Decimal('0.045'),  # 45 gramos
            arrival_date=start_date,
            gender='X',  # Mixto
            supplier='Incubadora Nacional',
            status='ACTIVE',
            created_by=admin
        )
        created = True
        print(f"✅ Lote creado: Lote {flock.id}")
        print(f"   - Población inicial: {flock.initial_quantity}")
        print(f"   - Población actual: {flock.current_quantity}")
        print(f"   - Edad: {(today - flock.arrival_date).days} días")
    
    # Crear más galpones y lotes para tener datos completos
    sheds_data = [
        ('galpon-2', 4000, 3800),
        ('galpon-3', 3000, 2900),
    ]
    
    for shed_name, capacity, occupancy in sheds_data:
        shed, created = Shed.objects.get_or_create(
            name=shed_name,
            farm=farm,
            defaults={
                'capacity': capacity,
                'assigned_worker': admin
            }
        )
        if created:
            print(f"✅ Galpón adicional creado: {shed.name}")
    
    print("\n" + "=" * 60)
    print("📊 Resumen de datos creados:")
    print("=" * 60)
    print(f"Granjas: {Farm.objects.count()}")
    print(f"Galpones: {Shed.objects.count()}")
    print(f"Lotes: {Flock.objects.count()}")
    print("=" * 60)
    
    # Mostrar IDs para debugging
    print("\n🔍 IDs para usar en el frontend:")
    print(f"   Farm ID: {farm.name}")
    print(f"   Shed ID: galpon-1")
    print(f"   Flock ID: {flock.id} (usar este número en lugar de 'lote-09')")

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Inicializando datos de prueba...")
    print("=" * 60)
    create_test_data()
    print("\n✅ Proceso completado")
