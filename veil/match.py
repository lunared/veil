import asyncio
import aioredis
from datetime import datetime

def now():
    return int(datetime.now().timestamp())

def signature(guid):
    return f"{guid}:{now()}"

def extract(key):
    data = key.split(":")
    timestamp = int(data[1])
    guid = data[0]
    return guid, timestamp

async def add_to_discovery(app, guid, latitude, longitude):
    """
    Adds a person's profile into redis to allow them to be discovered by other people for chatting
    """
    connection = await aioredis.create_connection(app.config['REDIS_URL'], loop=app.loop)
    redis = aioredis.Redis(connection)
    key = signature(guid)
    await redis.geoadd("match", latitude, longitude, key)
    await redis.publish("match", key)
    redis.close()

async def discover(app, guid):
    redis = await aioredis.create_redis(app.config['REDIS_URL'], timeout=300)
    ch, = await redis.subscribe(guid)
    while await ch.wait_message():
        chat_with = await ch.get(encoding='utf-8')
        return chat_with

async def remove_from_discovery(app, person):
    redis = await aioredis.create_connection(app.config['REDIS_URL'], loop=app.loop)
    await redis.zrem('match', person['uuid'])
    redis.close()
