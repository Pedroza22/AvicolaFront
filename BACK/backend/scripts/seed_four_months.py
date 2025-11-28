"""Seed script to generate ~4 months of realistic data for development.

Usage:
  python manage.py shell -c "exec(open('BACK/backend/scripts/seed_four_months.py').read())"
or run interactively from project's root with the venv active:
  python BACK/backend/scripts/seed_four_months.py --help

The script will create farms, sheds, flocks, daily weights and mortality records.
It is safe to re-run; it will skip creating duplicate named entities.
"""
from __future__ import annotations
import argparse
import random
from datetime import datetime, timedelta
import os
import django

# Setup Django for standalone script
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'avicolatrack.settings')
django.setup()

from apps.farms.models import Farm, Shed
from apps.flocks.models import Flock, DailyWeightRecord, MortalityCause, MortalityRecord
from apps.inventory.models import InventoryItem
from apps.inventory.models import FoodBatch, FoodConsumptionRecord
from django.contrib.auth import get_user_model
from apps.users.models import Role
from django.contrib.auth import get_user_model

User = get_user_model()

parser = argparse.ArgumentParser(description='Seed 4 months of realistic data for development')
parser.add_argument('--start-date', type=str, default=None, help='ISO date for start (YYYY-MM-DD). Defaults to 120 days ago')
parser.add_argument('--farms', type=int, default=1, help='Number of farms to create')
parser.add_argument('--sheds-per-farm', type=int, default=2, help='Number of sheds per farm')
parser.add_argument('--flocks-per-shed', type=int, default=2, help='Number of flocks per shed')
parser.add_argument('--days', type=int, default=120, help='Days of history to generate (approx 4 months)')
parser.add_argument('--seed', type=int, default=42, help='Random seed for reproducibility')
args = parser.parse_args()

random.seed(args.seed)

# Counters for summary
users_created = 0
farms_created = 0
sheds_created = 0
flocks_created = 0
daily_weights_created = 0
mortality_records_created = 0
inventory_items_created = 0
food_batches_created = 0
consumption_records_created = 0

# Create application roles used by permissions
role_names = [
    'Administrador Sistema',
    'Administrador de Granja',
    'Galponero',
    'Veterinario',
]
for rn in role_names:
    Role.objects.get_or_create(name=rn)

# Helper to create users with role
User = get_user_model()

def create_user(username: str, identification: str, email: str, role_name: str, password: str = 'Passw0rd!'):
    role = Role.objects.filter(name=role_name).first()
    global users_created
    user, created = User.objects.get_or_create(username=username, defaults={
        'email': email,
        'identification': identification,
    })
    if created:
        try:
            user.set_password(password)
            user.role = role
            user.save()
            users_created += 1
        except Exception:
            # If user model requires more fields, ignore and return the instance
            pass
    else:
        if role and user.role != role:
            user.role = role
            user.save()
    return user

if args.start_date:
    start_date = datetime.fromisoformat(args.start_date)
else:
    start_date = datetime.utcnow() - timedelta(days=args.days)

print(f"Seeding from {start_date.date()} for {args.days} days")

# Helper creators (idempotent by name)

def get_or_create_farm(name: str):
    global farms_created
    farm, created = Farm.objects.get_or_create(name=name, defaults={
        'location': 'Desconocida',
    })
    if created:
        farms_created += 1
    return farm


def create_flc_name(farm, shed_index, flock_index):
    return f"{farm.name}-G{shed_index+1}-L{flock_index+1}"


def get_or_create_flock(name: str, shed=None, farm=None):
    defaults = {
        'breed': 'Ross',
        'start_date': start_date.date(),
        'initial_birds': 1000,
    }
    global flocks_created
    flock, created = Flock.objects.get_or_create(name=name, defaults=defaults)
    if shed and flock.shed_id != shed.id:
        flock.shed = shed
        flock.save()
    if created:
        flocks_created += 1
    return flock

# Ensure some standard mortality causes exist (idempotent)
mortality_causes = [
    ('Enfermedad', 'DISEASE'),
    ('Manejo', 'MANAGEMENT'),
    ('Otro', 'OTHER'),
]
for cname, ccat in mortality_causes:
    MortalityCause.objects.get_or_create(name=cname, defaults={'category': ccat})


# Populate
for f_idx in range(args.farms):
    farm_name = f"FincaDemo{f_idx+1}"
    farm = get_or_create_farm(farm_name)
    print(f"Using farm: {farm.name}")

    # Create a farm manager user and assign to farm
    fm_username = f"mgr_{farm.name}"
    fm_user = create_user(fm_username, identification=f"ID{f_idx+1:03d}", email=f"{fm_username}@example.com", role_name='Administrador de Granja')
    try:
        farm.farm_manager = fm_user
        farm.save()
    except Exception:
        pass

    # Create sheds (use simple sequential naming)
    for s_idx in range(args.sheds_per_farm):
        shed_name = f"{farm.name}-Galpon{s_idx+1}"
        shed, s_created = Shed.objects.get_or_create(name=shed_name, farm=farm, defaults={'capacity': 20000})
        if s_created:
            sheds_created += 1

        # Create a galponero (shed worker) and assign
        gal_username = f"gal_{farm.name}_{s_idx+1}"
        gal_user = create_user(gal_username, identification=f"G{f_idx+1}{s_idx+1}", email=f"{gal_username}@example.com", role_name='Galponero')
        try:
            shed.assigned_worker = gal_user
            shed.save()
        except Exception:
            pass

        for l_idx in range(args.flocks_per_shed):
            flock_name = create_flc_name(farm, s_idx, l_idx)
            # Create flock with fields matching model schema
            flock_defaults = {
                'arrival_date': start_date.date(),
                'initial_quantity': 1000,
                'current_quantity': 1000,
                'initial_weight': 40.0,
                'breed': 'Ross',
                'gender': 'X',
                'supplier': 'DemoSupplier',
                'shed': shed,
            }
            flock, f_created = Flock.objects.get_or_create(name=flock_name, defaults=flock_defaults)
            if f_created:
                flocks_created += 1

            # For each flock generate daily weights and mortality
            current_birds = flock.current_quantity or flock.initial_quantity or 1000
            weight = float(getattr(flock, 'initial_weight', 40.0))

            # Ensure we have a recorded_by user to assign records
            system_user = User.objects.filter(role__name='Administrador Sistema').first() or User.objects.filter(is_superuser=True).first() or User.objects.first()
            if not system_user:
                # create a minimal admin system user
                system_user = create_user('sys_admin', identification='SYS001', email='sys_admin@example.com', role_name='Administrador Sistema')
            if not system_user:
                # try to create a minimal user if none exist
                try:
                    system_user = User.objects.create(username='seed_user')
                except Exception:
                    system_user = None
            for d in range(args.days):
                dt = (start_date + timedelta(days=d)).date()
                # Simulate growth: small daily gain that increases with age then plateaus
                daily_gain = 2.0 + (d * 0.05) * (0.8 if d < 30 else 0.3)
                weight = max(20.0, weight + random.uniform(daily_gain * 0.8, daily_gain * 1.2))
                # Simulate mortality: base low rate with occasional spikes
                base_mortality = 0.01 + (0.0005 * max(0, d - 30))
                spike = 0
                if random.random() < 0.005:
                    spike = random.randint(1, 10)
                deaths = max(0, int((base_mortality * current_birds) + spike))
                current_birds = max(0, current_birds - deaths)

                # Create or update DailyWeightRecord
                dw_defaults = {
                    'average_weight': round(weight, 2),
                    'sample_size': min(20, max(5, int(current_birds * 0.01))),
                    'recorded_by': system_user,
                }
                try:
                    dw, dw_created = DailyWeightRecord.objects.update_or_create(
                        flock=flock,
                        date=dt,
                        defaults=dw_defaults,
                    )
                    if dw_created:
                        daily_weights_created += 1
                except Exception:
                    # If recorded_by is required and None, skip
                    pass

                # Create mortality record when deaths > 0
                if deaths > 0:
                    # Pick a mortality cause randomly from existing causes
                    cause = MortalityCause.objects.order_by('?').first()
                    mr_defaults = {
                        'deaths': deaths,
                        'cause': cause,
                        'recorded_by': system_user or (User.objects.first() if User.objects.exists() else None),
                        'notes': 'Generado por script',
                    }
                    try:
                        mr, mr_created = MortalityRecord.objects.update_or_create(
                            flock=flock,
                            date=dt,
                            defaults=mr_defaults,
                        )
                        if mr_created:
                            mortality_records_created += 1
                    except Exception:
                        pass

            # Create inventory items per farm (only once per farm)
            if s_idx == 0 and l_idx == 0:
                items = [
                    {'name': 'Alimento Starter 25%', 'unit': 'BAG', 'current_stock': 200, 'minimum_stock': 20},
                    {'name': 'Alimento Grower 20%', 'unit': 'BAG', 'current_stock': 500, 'minimum_stock': 50},
                    {'name': 'Vacuna ND', 'unit': 'KG', 'current_stock': 10, 'minimum_stock': 2},
                ]
                for it in items:
                    inv, inv_created = InventoryItem.objects.get_or_create(name=it['name'], farm=farm, defaults={
                        'description': it['name'],
                        'current_stock': it['current_stock'],
                        'unit': it['unit'],
                        'minimum_stock': it['minimum_stock'],
                    })
                    if inv_created:
                        inventory_items_created += 1
                    # Add a food batch for the item if method available
                    try:
                        inv.add_stock(it['current_stock'])
                    except Exception:
                        # fallback: create FoodBatch directly
                        try:
                            fb = FoodBatch.objects.create(inventory_item=inv, entry_date=start_date.date(), initial_quantity=it['current_stock'], current_quantity=it['current_stock'], supplier='DemoSupplier')
                            food_batches_created += 1
                        except Exception:
                            pass

            # Simulate daily consumption from inventory for this flock occasionally
            if random.random() < 0.4 and args.days > 0:
                try:
                    # pick a food item for the farm
                    inv_item = InventoryItem.objects.filter(farm=farm).first()
                    if inv_item:
                        # Estimate feed need: kg per bird per day (approx 0.08-0.12 kg)
                        feed_kg_per_bird = random.uniform(0.08, 0.12)
                        total_feed_kg = feed_kg_per_bird * max(1, current_birds)
                        # If inventory unit is BAG assume 25kg per bag, convert to bags
                        if getattr(inv_item, 'unit', '').upper() == 'BAG':
                            qty = round(total_feed_kg / 25.0, 2)
                        else:
                            # fallback: store kg amount directly
                            qty = round(total_feed_kg, 2)
                        # Attempt FIFO consume
                        try:
                            inv_item.consume_fifo(qty, flock=flock, user=system_user)
                            consumption_records_created += 1
                        except Exception:
                            # fallback: create FoodConsumptionRecord manually
                            try:
                                fcr = FoodConsumptionRecord.objects.create(flock=flock, inventory_item=inv_item, date=dt, quantity_consumed=qty, fifo_details={}, recorded_by=system_user)
                                consumption_records_created += 1
                            except Exception:
                                pass
                        # After consumption, check stock status and create restock if needed
                        try:
                            status = inv_item.stock_status.get('status') if hasattr(inv_item, 'stock_status') else None
                            if status in ('LOW', 'CRITICAL'):
                                # Compute restock quantity: aim for ~30 days of stock or at least some multiple of minimum
                                try:
                                    daily_avg = float(inv_item.daily_avg_consumption or 0)
                                except Exception:
                                    daily_avg = 0
                                # Fallback restock in same unit as the item
                                target = max(daily_avg * 30, float(inv_item.minimum_stock or 0) * 10, 5)
                                restock_qty = round(target, 2)
                                try:
                                    batch = inv_item.add_stock(restock_qty, entry_date=dt)
                                    food_batches_created += 1
                                    print(f"[restock] {inv_item.name} @ {farm.name}: +{restock_qty} {inv_item.unit} on {dt}")
                                except Exception:
                                    # If add_stock fails, try direct batch create
                                    try:
                                        fb = FoodBatch.objects.create(inventory_item=inv_item, entry_date=dt, initial_quantity=restock_qty, current_quantity=restock_qty, supplier='DemoSupplier')
                                        # Update inventory current_stock manually as fallback
                                        inv_item.current_stock = float(inv_item.current_stock or 0) + restock_qty
                                        inv_item.last_restock_date = dt
                                        inv_item.save(update_fields=['current_stock', 'last_restock_date'])
                                        food_batches_created += 1
                                        print(f"[restock-fallback] {inv_item.name} @ {farm.name}: +{restock_qty} {inv_item.unit} on {dt}")
                                    except Exception:
                                        pass
                        except Exception:
                            pass
                except Exception:
                    pass
print("Seeding complete.")

# Summary
print("--- Seed summary ---")
print(f"Users created: {users_created}")
print(f"Farms created: {farms_created}")
print(f"Sheds created: {sheds_created}")
print(f"Flocks created: {flocks_created}")
print(f"Daily weight records created: {daily_weights_created}")
print(f"Mortality records created: {mortality_records_created}")
print(f"Inventory items created: {inventory_items_created}")
print(f"Food batches created: {food_batches_created}")
print(f"Consumption records created: {consumption_records_created}")
