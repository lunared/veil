import os

AMQP_URL = os.environ.get("AMQP_URL", "amqp://guest:guest@127.0.0.1/")
REDIS_URL = os.environ.get("REDIS_URL", ('localhost', 6379))
GEOIP_PATH = './GeoLite2-City.mmdb'

CORS_SUPPORTS_CREDENTIALS = True
