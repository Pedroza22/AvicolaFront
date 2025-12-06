"""
Script para verificar/crear usuario admin de prueba
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

def check_or_create_admin():
    username = "admin"
    password = "admin123"
    email = "admin@avicolatrack.com"
    
    try:
        user = User.objects.get(username=username)
        print(f"✅ Usuario '{username}' existe")
        print(f"   - ID: {user.id}")
        print(f"   - Email: {user.email}")
        print(f"   - Is Active: {user.is_active}")
        print(f"   - Is Staff: {user.is_staff}")
        print(f"   - Is Superuser: {user.is_superuser}")
        
        # Verificar contraseña
        if user.check_password(password):
            print(f"   - ✅ Contraseña '{password}' es CORRECTA")
        else:
            print(f"   - ❌ Contraseña '{password}' es INCORRECTA")
            print(f"   - Actualizando contraseña...")
            user.set_password(password)
            user.save()
            print(f"   - ✅ Contraseña actualizada")
        
        # Verificar rol
        if hasattr(user, 'role') and user.role:
            print(f"   - Rol: {user.role.name}")
        else:
            print(f"   - ⚠️ Sin rol asignado")
            
    except User.DoesNotExist:
        print(f"❌ Usuario '{username}' NO existe. Creando...")
        
        # Obtener o crear rol de administrador
        admin_role, _ = Role.objects.get_or_create(
            name='Administrador Sistema',
            defaults={'description': 'Administrador del sistema'}
        )
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name="Admin",
            last_name="System",
            identification="admin-001",
            is_staff=True,
            is_superuser=True,
            is_active=True,
        )
        user.role = admin_role
        user.save()
        
        print(f"✅ Usuario '{username}' creado exitosamente")
        print(f"   - Password: {password}")
        print(f"   - Email: {email}")
        print(f"   - Rol: {admin_role.name}")

if __name__ == '__main__':
    print("=" * 60)
    print("🔍 Verificando usuario admin...")
    print("=" * 60)
    check_or_create_admin()
    print("=" * 60)
