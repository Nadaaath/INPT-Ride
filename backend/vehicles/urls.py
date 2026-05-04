from django.urls import path
from .views import (
    VehicleListAPIView,
    VehicleDetailAPIView,
    AdminVehicleListCreateAPIView,
    AdminVehicleDetailAPIView,
)

urlpatterns = [
    path("", VehicleListAPIView.as_view(), name="vehicle-list"),
    path("<int:pk>/", VehicleDetailAPIView.as_view(), name="vehicle-detail"),

    path("admin/", AdminVehicleListCreateAPIView.as_view(), name="admin-vehicle-list-create"),
    path("admin/<int:pk>/", AdminVehicleDetailAPIView.as_view(), name="admin-vehicle-detail"),
]