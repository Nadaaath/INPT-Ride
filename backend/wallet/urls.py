from django.urls import path
from .views import MyWalletTransactionsAPIView, WalletTopUpAPIView

urlpatterns = [
    path("transactions/", MyWalletTransactionsAPIView.as_view(), name="my-wallet-transactions"),
    path("top-up/", WalletTopUpAPIView.as_view(), name="wallet-top-up"),
]