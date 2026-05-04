from django.urls import path
from .views import RideListAPIView, StartRideAPIView, EndRideAPIView

urlpatterns = [
    path("", RideListAPIView.as_view(), name="ride-list"),
    path("start/", StartRideAPIView.as_view(), name="ride-start"),
    path("end/", EndRideAPIView.as_view(), name="ride-end"),
]