"""
Check inventory items in database
"""
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'avicolatrack.settings.development')
django.setup()

from apps.inventory.models import InventoryItem

print("\n" + "="*60)
print("INVENTORY ITEMS IN DATABASE")
print("="*60 + "\n")

items = InventoryItem.objects.all()
print(f"Total items: {items.count()}\n")

for item in items:
    status = item.stock_status
    print(f"✓ {item.name}")
    print(f"  Stock: {item.current_stock} {item.unit}")
    print(f"  Daily consumption: {item.daily_avg_consumption} {item.unit}")
    print(f"  Status: {status['status']} - {status['message']}")
    if item.projected_stockout_date:
        print(f"  Projected stockout: {item.projected_stockout_date}")
    print()

print("="*60 + "\n")
