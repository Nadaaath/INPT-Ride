from unittest.mock import patch

from django.test import TestCase


class HealthCheckAPITest(TestCase):
    @patch("health.views.redis.Redis")
    def test_health_check_returns_ok_when_dependencies_are_available(self, mock_redis):
        mock_redis.return_value.ping.return_value = True

        response = self.client.get("/api/health/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")
        self.assertEqual(response.json()["checks"]["app"], "ok")
        self.assertEqual(response.json()["checks"]["database"], "ok")
        self.assertEqual(response.json()["checks"]["redis"], "ok")

    @patch("health.views.redis.Redis")
    def test_health_check_returns_degraded_when_redis_is_unavailable(self, mock_redis):
        mock_redis.return_value.ping.side_effect = Exception("Redis unavailable")

        response = self.client.get("/api/health/")

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json()["status"], "degraded")
        self.assertEqual(response.json()["checks"]["app"], "ok")
        self.assertEqual(response.json()["checks"]["database"], "ok")
        self.assertEqual(response.json()["checks"]["redis"], "error")