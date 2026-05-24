from django.db import connections
from django.db.utils import OperationalError
from django.http import JsonResponse
from django.conf import settings

import redis


def health_check(request):
    checks = {
        "app": "ok",
        "database": "unknown",
        "redis": "unknown",
    }

    status_code = 200

    try:
        connections["default"].cursor()
        checks["database"] = "ok"
    except OperationalError:
        checks["database"] = "error"
        status_code = 503

    try:
        redis_host = getattr(settings, "REDIS_HOST", "redis")
        redis_port = int(getattr(settings, "REDIS_PORT", 6379))
        client = redis.Redis(host=redis_host, port=redis_port, socket_connect_timeout=1)
        client.ping()
        checks["redis"] = "ok"
    except Exception:
        checks["redis"] = "error"
        status_code = 503

    return JsonResponse(
        {
            "status": "ok" if status_code == 200 else "degraded",
            "checks": checks,
        },
        status=status_code,
    )