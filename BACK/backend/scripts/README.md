Seed scripts

seed_four_months.py

Usage (from repository root with Python venv active):

# Run as standalone script (will configure Django settings automatically)
python BACK/backend/scripts/seed_four_months.py --help

# Example: seed 2 farms, 3 sheds per farm, 2 flocks per shed, 120 days starting 2025-07-01
python BACK/backend/scripts/seed_four_months.py --farms 2 --sheds-per-farm 3 --flocks-per-shed 2 --days 120 --start-date 2025-07-01

# Or run through manage.py shell (ensures Django env is configured):
python manage.py shell -c "exec(open('BACK/backend/scripts/seed_four_months.py').read())"

Notes
- The script is safe to re-run: it uses `get_or_create` and `update_or_create` to avoid duplicates.
- Adjust defaults to match your actual model field names if your project schema diverged.
