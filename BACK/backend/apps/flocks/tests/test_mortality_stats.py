import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from django.utils import timezone
from datetime import timedelta

from apps.farms.models import Farm, Shed
from apps.flocks.models import Flock, MortalityRecord


@pytest.mark.django_db
def test_mortality_stats_endpoint():
    User = get_user_model()
    user = User.objects.create_user(username='admin', password='pass', identification='1', is_staff=True, email='admin@example.com')

    farm = Farm.objects.create(name='Test Farm', location='Somewhere', farm_manager=user)
    shed = Shed.objects.create(name='Shed A', capacity=1000, farm=farm)

    arrival = timezone.now().date() - timedelta(days=10)
    flock = Flock.objects.create(
        arrival_date=arrival,
        initial_quantity=100,
        current_quantity=95,
        initial_weight=100.0,
        breed='TestBreed',
        gender='M',
        supplier='Supplier X',
        shed=shed,
        created_by=user
    )

    # Create mortality records within the last week
    MortalityRecord.objects.create(flock=flock, date=timezone.now().date(), deaths=2, recorded_by=user)
    MortalityRecord.objects.create(flock=flock, date=timezone.now().date() - timedelta(days=1), deaths=3, recorded_by=user)

    client = APIClient()
    client.force_authenticate(user=user)

    url = f"/api/flocks/{flock.id}/mortality-stats/?days=7"
    resp = client.get(url)

    assert resp.status_code == 200
    data = resp.json()
    assert data.get('total_deaths') == 5
    assert 'mortality_rate' in data
