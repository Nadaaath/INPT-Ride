from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", include("health.urls")),

    path("api/accounts/", include("accounts.urls")),
    path("api/vehicles/", include("vehicles.urls")),
    path("api/reservations/", include("reservations.urls")),
    path("api/rides/", include("rides.urls")),
    path("api/wallet/", include("wallet.urls")),
    path("api/billing/", include("billing.urls")),
    path("api/notifications/", include("notifications.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)