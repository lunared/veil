"""
Parallel process to veil that performs the match making routines.
"""
from aioredis.pubsub import Receiver
import aioredis
import asyncio
import random
import settings
import aio_pika
from veil.match import extract, now

async def main(loop):
    redis = await aioredis.create_redis(settings.REDIS_URL)
    await redis.flushall()

    ch, = await redis.subscribe('match')
    redis = await aioredis.create_redis(settings.REDIS_URL)
    
    while await ch.wait_message():
        from_who = await ch.get(encoding='utf-8') # get the next message in the queue
        # ignore if the person has been matched before their turn in the queue
        if redis.geohash('match', from_who) is None:
            continue
        from_guid, _ = extract(from_who)
        
        # find all users within a certain radius
        matches = await redis.georadiusbymember('match', from_who, 100, 'km', with_dist=True)
        if len(matches) > 1:  #excluding self
            # sort matches based on weighted priority
            # time waiting - distance * 4, grab highest value
            weighted_matches = sorted(
                matches,
                key=lambda x: (int(now()) - extract(x.member.decode('utf-8'))[1]) - (x.dist * 4),
                reverse=True
            )
            match = weighted_matches[0] # ignore first entry, as it'll be myself
            print(f"Found {match.member}")
            to_guid, _ = extract(match.member.decode('utf-8'))
            if to_guid == from_guid:
                continue

            print(f"{from_guid} - {to_guid}")
            await asyncio.gather(
                redis.zrem('match', from_who),
                redis.zrem('match', match.member),
                redis.publish(from_guid, to_guid),
                redis.publish(to_guid, from_guid)
            )
        
if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main(loop))
    loop.close()