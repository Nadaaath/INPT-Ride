from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.models import UserProfile
from .models import WalletTransaction
from .serializers import WalletTransactionSerializer, WalletTopUpSerializer


class MyWalletTransactionsAPIView(generics.ListAPIView):
    serializer_class = WalletTransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WalletTransaction.objects.filter(user=self.request.user).order_by("-created_at")


class WalletTopUpAPIView(generics.GenericAPIView):
    serializer_class = WalletTopUpSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {"error": "Only admin users can top up wallets."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user_id = serializer.validated_data["user_id"]
        amount = serializer.validated_data["amount"]

        profile = UserProfile.objects.select_related("user").get(user_id=user_id)
        current_balance = profile.wallet_balance
        new_balance = current_balance + amount

        profile.wallet_balance = new_balance
        profile.save()

        transaction = WalletTransaction.objects.create(
            user=profile.user,
            type="top_up",
            amount=amount,
            balance_after=new_balance,
            reference_type="admin_top_up",
            reference_id=request.user.id,
        )

        Notification.objects.create(
            recipient_user=profile.user,
            type="wallet_top_up",
            title="Wallet topped up",
            message=(
                f"Your wallet has been topped up by {amount}. "
                f"New balance: {new_balance}."
            ),
        )

        output_serializer = WalletTransactionSerializer(transaction)
        return Response(
            {
                "message": "Wallet topped up successfully.",
                "transaction": output_serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )
    serializer_class = WalletTopUpSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response(
                {"error": "Only admin users can top up wallets."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user_id = serializer.validated_data["user_id"]
        amount = serializer.validated_data["amount"]

        profile = UserProfile.objects.select_related("user").get(user_id=user_id)
        current_balance = profile.wallet_balance
        new_balance = current_balance + amount

        profile.wallet_balance = new_balance
        profile.save()

        transaction = WalletTransaction.objects.create(
            user=profile.user,
            type="top_up",
            amount=amount,
            balance_after=new_balance,
            reference_type="admin_top_up",
            reference_id=request.user.id,
        )

        output_serializer = WalletTransactionSerializer(transaction)
        return Response(
            {
                "message": "Wallet topped up successfully.",
                "transaction": output_serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )