from django.contrib.auth import get_user_model,authenticate
from rest_framework import serializers
from .models import AuthorizedStudent, UserProfile


class AuthorizedStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthorizedStudent
        fields = [
            "id",
            "full_name",
            "email",
            "student_identifier",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["created_at"]


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "user",
            "username",
            "wallet_balance",
            "warning_count",
            "is_banned",
            "created_at",
        ]
        read_only_fields = ["created_at", "username"]
class SetPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError("Passwords do not match.")
        return attrs


User = get_user_model()

class EmailPasswordLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs["email"]
        password = attrs["password"]

        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password.")

        user = authenticate(username=user_obj.username, password=password)
        if not user:
            raise serializers.ValidationError("Invalid email or password.")

        attrs["user"] = user
        return attrs