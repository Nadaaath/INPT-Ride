from django.urls import path
from .views import MyNotificationsAPIView, MarkNotificationReadAPIView

urlpatterns = [
    path("", MyNotificationsAPIView.as_view(), name="my-notifications"),
    path("<int:pk>/read/", MarkNotificationReadAPIView.as_view(), name="mark-notification-read"),
]