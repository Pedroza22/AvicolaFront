"""Bootstrap development data: creates roles and a dev superuser if missing.

Run this from the backend folder inside the virtualenv:

    python scripts/bootstrap_dev.py

It will create a few roles and a superuser (username: dev_admin, password: DevPassw0rd!).
"""
import os
import sys
from pathlib import Path
import django


def main():
    # Ensure project root is on sys.path so Django imports work when running the
    # script directly from PowerShell or other shells.
    project_root = Path(__file__).resolve().parents[1]
    if str(project_root) not in sys.path:
        sys.path.insert(0, str(project_root))

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "avicolatrack.settings.development")
    django.setup()

    from django.contrib.auth import get_user_model
    from apps.users.models import Role

    User = get_user_model()

    roles = ["admin-system", "admin-granja", "galponero", "veterinario"]
    for r in roles:
        Role.objects.get_or_create(name=r)

    username = "dev_admin"
    email = "dev_admin@example.com"
    ident = "dev_admin_01"
    password = os.environ.get("DEV_ADMIN_PASSWORD", "DevPassw0rd!")

    if not User.objects.filter(username=username).exists():
        print("Creating dev superuser...")
        User.objects.create_superuser(username=username, email=email, password=password, identification=ident)
        print("Dev superuser created:", username)
    else:
        print("Dev superuser already exists")


if __name__ == "__main__":
    main()
