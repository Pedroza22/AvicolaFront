from rest_framework.routers import DefaultRouter
from .views import (
    InventoryViewSet, FoodBatchViewSet, FoodConsumptionRecordViewSet,
    SupplierViewSet, OrderViewSet
)

router = DefaultRouter()
router.register(r'inventory', InventoryViewSet, basename='inventory')
router.register(r'food-batches', FoodBatchViewSet, basename='foodbatch')
router.register(r'food-consumption', FoodConsumptionRecordViewSet, basename='foodconsumption')
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = router.urls
