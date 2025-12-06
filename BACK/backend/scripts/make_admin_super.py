"""
Script para hacer al usuario admin un superusuario con rol
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'avicolatrack.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from apps.users.models import Role

User = get_user_model()

def make_admin_super():
    username = "admin"
    
    try:
        user = User.objects.get(username=username)
        
        # Hacer superuser y staff
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        
        # Asignar rol de administrador
        admin_role, created = Role.objects.get_or_create(
            name='Administrador Sistema',
            defaults={'description': 'Administrador del sistema con acceso total'}
        )
        user.role = admin_role
        
        user.save()
        
        print(f"✅ Usuario '{username}' actualizado exitosamente")
        print(f"   - Is Staff: {user.is_staff}")
        print(f"   - Is Superuser: {user.is_superuser}")
        print(f"   - Is Active: {user.is_active}")
        print(f"   - Rol: {user.role.name if user.role else 'Sin rol'}")
        
    except User.DoesNotExist:
        print(f"❌ Usuario '{username}' NO existe")

if __name__ == '__main__':
    print("=" * 60)
    print("🔧 Configurando usuario admin como superusuario...")
    print("=" * 60)
    make_admin_super()
    print("=" * 60)
