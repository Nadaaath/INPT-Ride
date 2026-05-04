import uuid

from config.redis_client import get_redis_client


LOCK_EXPIRE_SECONDS = 15


def build_reservation_lock_key(vehicle_id, reserved_date, start_hour, end_hour):
    return f"reservation_lock:vehicle:{vehicle_id}:date:{reserved_date}:start:{start_hour}:end:{end_hour}"


def acquire_reservation_lock(vehicle_id, reserved_date, start_hour, end_hour):
    client = get_redis_client()
    lock_key = build_reservation_lock_key(
        vehicle_id=vehicle_id,
        reserved_date=reserved_date,
        start_hour=start_hour,
        end_hour=end_hour,
    )
    lock_value = str(uuid.uuid4())

    acquired = client.set(
        lock_key,
        lock_value,
        nx=True,
        ex=LOCK_EXPIRE_SECONDS,
    )

    return acquired, lock_key, lock_value


def release_reservation_lock(lock_key, lock_value):
    client = get_redis_client()

    release_script = """
    if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
    else
        return 0
    end
    """

    client.eval(release_script, 1, lock_key, lock_value)