from django.conf import settings
from django.contrib.auth import get_user_model
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token

from .models import AuthorizedStudent, UserProfile
from .permissions import IsAdminUserCustom
from .serializers import ( AuthorizedStudentSerializer, 
                          EmailPasswordLoginSerializer, SetPasswordSerializer, UserProfileSerializer,
                          SetPasswordSerializer,
                          EmailPasswordLoginSerializer,)

User = get_user_model()


class GoogleLoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("id_token")
        if not token:
            return Response(
                {"error": "id_token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                settings.GOOGLE_WEB_CLIENT_ID,
            )
        except Exception:
            return Response(
                {"error": "Invalid Google token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = idinfo.get("email")
        full_name = idinfo.get("name", "")
        email_verified = idinfo.get("email_verified", False)

        if not email or not email_verified:
            return Response(
                {"error": "Google email is missing or not verified."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            authorized_student = AuthorizedStudent.objects.get(email=email, is_active=True)
        except AuthorizedStudent.DoesNotExist:
            return Response(
                {"error": "This email is not authorized to use INPT Ride."},
                status=status.HTTP_403_FORBIDDEN,
            )

        username = email

        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": email,
                "first_name": full_name.split(" ")[0] if full_name else "",
                "last_name": " ".join(full_name.split(" ")[1:]) if len(full_name.split(" ")) > 1 else "",
            },
        )

        if created:
            user.email = email
            user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        token, _ = Token.objects.get_or_create(user=user)

        
        return Response(
    {
        "message": "Google login successful.",
        "token": token.key,
        "has_password": user.has_usable_password(),
        "is_new_user": created,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": full_name,
        },
        "profile": {
            "wallet_balance": str(profile.wallet_balance),
            "warning_count": profile.warning_count,
            "is_banned": profile.is_banned,
        },
        "authorized_student": {
            "id": authorized_student.id,
            "full_name": authorized_student.full_name,
            "email": authorized_student.email,
        },
    },
    status=status.HTTP_200_OK,
)

class SetPasswordAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.set_password(serializer.validated_data["password"])
        user.save()

        return Response(
            {"message": "Password set successfully."},
            status=status.HTTP_200_OK,
        )


class EmailPasswordLoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = EmailPasswordLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        profile, _ = UserProfile.objects.get_or_create(user=user)
        token, _ = Token.objects.get_or_create(user=user)

        full_name = f"{user.first_name} {user.last_name}".strip()

        return Response(
            {
                "message": "Login successful.",
                "token": token.key,
                "has_password": user.has_usable_password(),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "full_name": full_name,
                },
                "profile": {
                    "wallet_balance": str(profile.wallet_balance),
                    "warning_count": profile.warning_count,
                    "is_banned": profile.is_banned,
                },
            },
            status=status.HTTP_200_OK,
        )

class AdminAuthorizedStudentListCreateAPIView(generics.ListCreateAPIView):
    queryset = AuthorizedStudent.objects.all()
    serializer_class = AuthorizedStudentSerializer
    permission_classes = [IsAuthenticated, IsAdminUserCustom]


class AdminAuthorizedStudentDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AuthorizedStudent.objects.all()
    serializer_class = AuthorizedStudentSerializer
    permission_classes = [IsAuthenticated, IsAdminUserCustom]


class AdminUserProfileListAPIView(generics.ListAPIView):
    queryset = UserProfile.objects.select_related("user").all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminUserCustom]


class AdminUserProfileDetailAPIView(generics.RetrieveUpdateAPIView):
    queryset = UserProfile.objects.select_related("user").all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminUserCustom]