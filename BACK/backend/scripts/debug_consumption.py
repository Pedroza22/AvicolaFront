"""
Debug consumption records
"""
import os
import sys
import django
from datetime import datetime, timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'avicolatrack.settings.development')
django.setup()

from apps.inventory.models import InventoryItem

item = InventoryItem.objects.first()
print(f"\nItem: {item.name}")
print(f"Current stock: {item.current_stock} {item.unit}")
print(f"Daily avg consumption (DB): {item.daily_avg_consumption}")

records = item.consumption_records.all()
print(f"\nTotal consumption records: {records.count()}")

if records.exists():
    first_record = records.order_by('date').first()
    last_record = records.order_by('date').last()
    print(f"First record: {first_record.date} ({first_record.quantity_consumed} {item.unit})")
    print(f"Last record: {last_record.date} ({last_record.quantity_consumed} {item.unit})")

end_date = datetime.now().date()
start_date = end_date - timedelta(days=30)
recent_records = item.consumption_records.filter(date__range=[start_date, end_date])
print(f"\nRecords in last 30 days ({start_date} to {end_date}): {recent_records.count()}")

if recent_records.exists():
    total = sum([float(r.quantity_consumed) for r in recent_records])
    avg = total / 30
    print(f"Total consumed (last 30 days): {total} {item.unit}")
    print(f"Calculated daily avg: {avg} {item.unit}/day")
    
print(f"\nManually calling update_consumption_metrics()...")
item.update_consumption_metrics()
item.refresh_from_db()

print(f"After update - Daily avg: {item.daily_avg_consumption}")
print(f"Status: {item.stock_status}")
