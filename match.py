"""
Parallel process to veil that performs the match making routines.
"""
from aioredis.pubsub import Receiver
import aioredis
import asyncio
import random
import settings
import aio_pika

async def main(loop):
    redis = await aioredis.create_redis(settings.REDIS_URL)
    await redis.flushall()
    
    ch, = await redis.subscribe('match')
    redis = await aioredis.create_redis(settings.REDIS_URL)
    
    while await ch.wait_message():
        whomstdve = await ch.get(encoding='utf-8') # get the next message in the queue
        # ignore if the person has been matched before their turn in the queue
        if redis.geohash('match', whomstdve) is None:
            continue

        while True:
            matches = await redis.georadiusbymember('match', whomstdve, 100, 'km')
            if len(matches) > 1:
                match = random.choice(matches) # ignore first entry, as it'll be myself
                match = match.decode('utf-8')
                if match == whomstdve:
                    continue

                print(f"{whomstdve} - {match}")
                await asyncio.gather(
                    redis.zrem('match', whomstdve),
                    redis.zrem('match', match)
                )
                break

        await asyncio.gather(
            redis.publish(whomstdve, match),
            redis.publish(match, whomstdve)
        )
        
if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main(loop))
    loop.close()