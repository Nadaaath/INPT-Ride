from django.urls import path
from .views import (
    GoogleLoginAPIView,
    SetPasswordAPIView,
    EmailPasswordLoginAPIView,
    AdminAuthorizedStudentListCreateAPIView,
    AdminAuthorizedStudentDetailAPIView,
    AdminUserProfileListAPIView,
    AdminUserProfileDetailAPIView,
)

urlpatterns = [
    path("google-login/", GoogleLoginAPIView.as_view(), name="google-login"),
    path("set-password/", SetPasswordAPIView.as_view(), name="set-password"),
    path("login/", EmailPasswordLoginAPIView.as_view(), name="email-password-login"),

    path("authorized-students/", AdminAuthorizedStudentListCreateAPIView.as_view(), name="admin-authorized-student-list-create"),
    path("authorized-students/<int:pk>/", AdminAuthorizedStudentDetailAPIView.as_view(), name="admin-authorized-student-detail"),
    path("profiles/", AdminUserProfileListAPIView.as_view(), name="admin-user-profile-list"),
    path("profiles/<int:pk>/", AdminUserProfileDetailAPIView.as_view(), name="admin-user-profile-detail"),
]