from rest_framework import serializers
from .models import Farm, Shed


class ShedSerializer(serializers.ModelSerializer):
    # Explicitly typed for OpenAPI
    occupancy_percentage = serializers.FloatField(read_only=True)
    current_occupancy = serializers.IntegerField(read_only=True)

    class Meta:
        model = Shed
        fields = ['id', 'name', 'capacity', 'farm', 'assigned_worker', 'current_occupancy', 'occupancy_percentage']
from rest_framework import serializers
from .models import Farm


class FarmSerializer(serializers.ModelSerializer):
    class Meta:
        model = Farm
        fields = ['id', 'name', 'location', 'farm_manager', 'total_capacity', 'active_sheds', 'created_at']
        read_only_fields = ['total_capacity', 'active_sheds', 'created_at']
