"""
Seed inventory items for testing stock alerts - 3 farms with 4 months of realistic data
"""
import os
import sys
import django
from datetime import datetime, timedelta
from decimal import Decimal
import random

# Add backend to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'avicolatrack.settings.development')
django.setup()

from apps.inventory.models import InventoryItem, InventoryConsumptionRecord
from apps.farms.models import Farm, Shed

def seed_inventory():
    print("\n" + "="*60)
    print("SEEDING INVENTORY ITEMS - 3 FARMS, 4 MONTHS")
    print("="*60)
    
    # Get existing farms
    farms = Farm.objects.all()
    if not farms.exists():
        print("❌ No farms found. Please run seed_four_months.py first")
        return
    
    # Clear existing inventory to start fresh
    deleted_count = InventoryItem.objects.count()
    InventoryItem.objects.all().delete()
    print(f"\n🗑️  Cleared {deleted_count} existing inventory items\n")
    
    # Product categories with realistic parameters
    product_templates = [
        {
            'name': 'Alimento Concentrado Starter',
            'description': 'Alimento balanceado para pollos de 0-21 días',
            'unit': 'KG',
            'minimum_stock': 800,
            'alert_threshold_days': 7,
            'critical_threshold_days': 3,
            'avg_daily_consumption': 45,  # Base consumption
        },
        {
            'name': 'Alimento Concentrado Grower',
            'description': 'Alimento balanceado para pollos de 22-35 días',
            'unit': 'KG',
            'minimum_stock': 1200,
            'alert_threshold_days': 7,
            'critical_threshold_days': 3,
            'avg_daily_consumption': 85,
        },
        {
            'name': 'Alimento Concentrado Finisher',
            'description': 'Alimento balanceado para pollos de 36+ días',
            'unit': 'KG',
            'minimum_stock': 1500,
            'alert_threshold_days': 7,
            'critical_threshold_days': 3,
            'avg_daily_consumption': 120,
        },
        {
            'name': 'Vacuna Newcastle',
            'description': 'Vacuna contra Newcastle cepa La Sota',
            'unit': 'LB',
            'minimum_stock': 50,
            'alert_threshold_days': 14,
            'critical_threshold_days': 7,
            'avg_daily_consumption': 3,
        },
        {
            'name': 'Vacuna Gumboro',
            'description': 'Vacuna contra enfermedad de Gumboro',
            'unit': 'LB',
            'minimum_stock': 40,
            'alert_threshold_days': 14,
            'critical_threshold_days': 7,
            'avg_daily_consumption': 2.5,
        },
        {
            'name': 'Desinfectante Clorado',
            'description': 'Desinfectante de amplio espectro base cloro',
            'unit': 'LB',
            'minimum_stock': 100,
            'alert_threshold_days': 10,
            'critical_threshold_days': 4,
            'avg_daily_consumption': 8,
        },
        {
            'name': 'Desinfectante Yodado',
            'description': 'Desinfectante yodado para equipos',
            'unit': 'LB',
            'minimum_stock': 60,
            'alert_threshold_days': 10,
            'critical_threshold_days': 4,
            'avg_daily_consumption': 5,
        },
        {
            'name': 'Vitaminas Hidrosolubles',
            'description': 'Suplemento vitamínico hidrosoluble complejo',
            'unit': 'KG',
            'minimum_stock': 80,
            'alert_threshold_days': 8,
            'critical_threshold_days': 3,
            'avg_daily_consumption': 6,
        },
        {
            'name': 'Probióticos',
            'description': 'Probióticos para salud intestinal',
            'unit': 'KG',
            'minimum_stock': 50,
            'alert_threshold_days': 8,
            'critical_threshold_days': 3,
            'avg_daily_consumption': 4,
        },
        {
            'name': 'Antibiótico Respiratorio',
            'description': 'Antibiótico para tratamiento de enfermedades respiratorias',
            'unit': 'KG',
            'minimum_stock': 30,
            'alert_threshold_days': 15,
            'critical_threshold_days': 7,
            'avg_daily_consumption': 1.5,
        },
    ]
    
    created_items = 0
    total_records = 0
    
    # Process each farm
    for farm in farms[:3]:  # Limit to 3 farms
        print(f"\n{'='*60}")
        print(f"🏢 Farm: {farm.name}")
        print(f"{'='*60}")
        
        sheds = list(Shed.objects.filter(farm=farm))
        
        # Create inventory for each shed (or farm-level if no sheds)
        locations = sheds if sheds else [None]
        
        for location in locations:
            location_name = location.name if location else "General"
            print(f"\n  📍 Location: {location_name}")
            
            for template in product_templates:
                # Randomize stock levels for variety
                stock_variation = random.uniform(0.3, 2.5)
                
                # Determine stock status randomly but weighted
                status_roll = random.random()
                if status_roll < 0.15:  # 15% critical/out of stock
                    if random.random() < 0.5:
                        current_stock = 0  # Out of stock
                    else:
                        current_stock = template['avg_daily_consumption'] * random.uniform(0.5, 2.5)  # Critical
                elif status_roll < 0.35:  # 20% low stock
                    current_stock = template['avg_daily_consumption'] * random.uniform(3, 6)
                else:  # 65% normal/good stock
                    current_stock = template['avg_daily_consumption'] * random.uniform(8, 30)
                
                # Create consumption variation (±20%)
                daily_consumption = template['avg_daily_consumption'] * random.uniform(0.8, 1.2)
                
                item = InventoryItem.objects.create(
                    name=template['name'],
                    description=template['description'],
                    current_stock=Decimal(str(round(current_stock, 2))),
                    unit=template['unit'],
                    minimum_stock=Decimal(str(template['minimum_stock'])),
                    farm=farm,
                    shed=location,
                    daily_avg_consumption=Decimal(str(round(daily_consumption, 2))),
                    alert_threshold_days=template['alert_threshold_days'],
                    critical_threshold_days=template['critical_threshold_days'],
                    last_restock_date=datetime.now().date() - timedelta(days=random.randint(5, 30)),
                )
                
                created_items += 1
                status = item.stock_status
                
                # Status emoji
                emoji = "🔴" if status['status'] in ['OUT_OF_STOCK', 'CRITICAL'] else \
                        "🟠" if status['status'] == 'LOW' else \
                        "🟢" if status['status'] == 'NORMAL' else "⚪"
                
                print(f"    {emoji} {item.name}: {item.current_stock} {item.unit} - {status['status']}")
                
                # Generate 4 months of consumption history
                consumption_records = generate_consumption_history(
                    item, 
                    months=4, 
                    base_daily_consumption=daily_consumption
                )
                total_records += consumption_records
    
    print(f"\n{'='*60}")
    print(f"✅ SEEDING COMPLETE")
    print(f"{'='*60}")
    print(f"Created {created_items} inventory items")
    print(f"Generated {total_records} consumption records (4 months)")
    print(f"Total inventory items: {InventoryItem.objects.count()}")
    print("="*60 + "\n")
    
    # Summary statistics
    print_summary_statistics()


def generate_consumption_history(item, months=4, base_daily_consumption=None):
    """Generate realistic consumption history for an item"""
    if base_daily_consumption is None:
        base_daily_consumption = float(item.daily_avg_consumption)
    
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=months * 30)
    
    records_created = 0
    current_date = start_date
    
    # Temporarily disable auto-update to avoid resetting daily_avg during creation
    while current_date <= end_date:
        # Skip some days randomly (not every day has consumption)
        if random.random() < 0.85:  # 85% chance of consumption on any given day
            # Variation in daily consumption (±30%)
            # Use the BASE consumption value, not the item's current value
            quantity = base_daily_consumption * random.uniform(0.7, 1.3)
            
            InventoryConsumptionRecord.objects.create(
                inventory_item=item,
                date=current_date,
                quantity_consumed=Decimal(str(round(quantity, 2)))
            )
            records_created += 1
        
        current_date += timedelta(days=1)
    
    # Now update the item's metrics based on ALL the generated history
    # This will recalculate daily_avg_consumption from last 30 days
    item.update_consumption_metrics()
    
    # Force reload from database to get updated values
    item.refresh_from_db()
    
    return records_created


def print_summary_statistics():
    """Print summary of inventory status across all farms"""
    print("\n📊 INVENTORY SUMMARY BY STATUS")
    print("="*60)
    
    total = InventoryItem.objects.count()
    critical = 0
    low = 0
    normal = 0
    out_of_stock = 0
    unknown = 0
    
    # Just read current status, don't update metrics
    for item in InventoryItem.objects.all():
        status = item.stock_status['status']
        if status == 'OUT_OF_STOCK':
            out_of_stock += 1
        elif status == 'CRITICAL':
            critical += 1
        elif status == 'LOW':
            low += 1
        elif status == 'NORMAL':
            normal += 1
        else:
            unknown += 1
    
    print(f"🔴 Out of Stock:  {out_of_stock:3d} ({out_of_stock/total*100:5.1f}%)")
    print(f"🔴 Critical:      {critical:3d} ({critical/total*100:5.1f}%)")
    print(f"🟠 Low:           {low:3d} ({low/total*100:5.1f}%)")
    print(f"🟢 Normal:        {normal:3d} ({normal/total*100:5.1f}%)")
    if unknown > 0:
        print(f"⚪ Unknown:       {unknown:3d} ({unknown/total*100:5.1f}%)")
    print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"📦 Total Items:   {total:3d}")
    print("="*60 + "\n")

if __name__ == '__main__':
    seed_inventory()
