from decimal import Decimal
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import WalletTransaction

User = get_user_model()


class WalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletTransaction
        fields = [
            "id",
            "user",
            "type",
            "amount",
            "balance_after",
            "reference_type",
            "reference_id",
            "created_at",
        ]


class WalletTopUpSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)

    def validate_amount(self, value):
        if value <= Decimal("0.00"):
            raise serializers.ValidationError("Top-up amount must be greater than zero.")
        return value

    def validate_user_id(self, value):
        if not User.objects.filter(id=value).exists():
            raise serializers.ValidationError("Target user does not exist.")
        return value