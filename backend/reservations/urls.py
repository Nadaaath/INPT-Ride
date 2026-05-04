from django.urls import path
from .views import AdminCancelReservationAPIView, ReservationListCreateAPIView, ReservationCancelAPIView

urlpatterns = [
    path("", ReservationListCreateAPIView.as_view(), name="reservation-list-create"),
    path("<int:pk>/cancel/", ReservationCancelAPIView.as_view(), name="reservation-cancel"),
        path("<int:pk>/cancel/", AdminCancelReservationAPIView.as_view(), name="admin-reservation-cancel"),

]