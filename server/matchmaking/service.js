const { sample, isEmpty, isNil } = require('lodash');
const Queue = require('bull');

class MatchService {
    constructor(redis, redisUrl) {
        this.redis = redis;
        this.queue = new Queue('veil:match:queue', redisUrl);
    }

    async reap() {
        const now = +Date.now();
        const cutoff = now - 90000;
        const interests = await this.redis.smembers(
            `veil:interests`
        );

        await this.redis.zremrangebyscore(
            `veil:match:general`,
            '-inf',
            cutoff,
        );
        for (const interest of interests) {
            await this.redis.zremrangebyscore(
                `veil:match:interest:${interest}`,
                '-inf',
                cutoff,
            );
            const leftover = await this.redis.zcount(`veil:match:interest:${interest}`, '-inf', '+inf');
            if (leftover <= 0) {
                this.redis.srem(`veil:interests`, interest);
            }
        }
    }

    async addToDiscovery(user, profile, preferences) {
        console.log(`adding user to search queue, user: ${user}`);
        const now = +Date.now();
        await this.removeFromDiscovery(user);
        
        const multi = this.redis.multi();
        multi.del(`veil:matched:${user}`);
        multi.zadd(
            `veil:match:general`,
            now,
            user,
        );
        for (const interest of profile) {
            console.log(`adding user to interest, user: ${user} interest: ${interest}`);
            multi.zadd(
                `veil:match:interest:${interest}`,
                now,
                user,
            );
            multi.sadd(
                `veil:interests`,
                interest,
            );
        }
        multi.set(`veil:profile:${user}`, JSON.stringify(profile), 'EX', 180);
        await multi.exec();
        this.queue.add({ user, preferences }, {
            attempts: 5, 
            backoff: 3000,
            removeOnComplete: true,
            removeOnFail: true,
        });
    }

    async removeFromDiscovery(user) {
        const oldProfile = await this.redis.get(`veil:profile:${user}`);
        if (oldProfile) {
            const multi = this.redis.multi();
            multi.zrem(`veil:match:general`, user);
            for (const interest of JSON.parse(oldProfile)) {
                multi.zrem(`veil:match:interest:${interest}`, user);
            }
            multi.del(`veil:profile:${user}`);
            await multi.exec();
        }
    }

    async findUser(exclude, preferences) {
        console.log(`searching for match, user: ${exclude}`);
        const isMatched = await this.redis.exists(`veil:matched:${exclude}`);

        if (isMatched) {
            console.log(`user is already matched, user: ${exclude}`);
            return exclude;
        }


        const now = +Date.now();
        const usersByInterest = await Promise.all(
            preferences.map(
                async (interest) => {
                    console.log(`searching by interest, user: ${exclude} interest: ${interest}`);
                    const found = await this.redis.zrangebyscore(
                        `veil:match:interest:${interest}`, 
                        now - 60000,
                        '+inf',
                        'LIMIT', 0, 5
                    );
                    return {
                        interest,
                        found,
                    }
                }
            )
        );

        const users = {};
        for (const group of usersByInterest) {
            const {
                interest,
                found,
            } = group;

            for (const user of found) {
                const {
                    [user]: interests = new Set(),
                } = users;
                interests.add(interest);
                users[user] = interests;
            }
        }
        
        const {
            [exclude]: self,
            ...acceptable
        } = users;

        // if no one with shared interests if found, return a random user
        let match = null;
        let interests = [];
        if (isEmpty(acceptable)) {
            const random = await this.redis.zrangebyscore(
                `veil:match:general`, 
                now - 60000,
                '+inf',
                'LIMIT', 0, 5
            );
            console.log(`found ${random.length} possible matches, user: ${exclude}`);
            match = sample(random);
        } else {
            console.log(`found ${Object.keys(acceptable).length} possible matches with shared interests, user: ${exclude}`);
            match = sample(Object.keys(acceptable));
            interests = acceptable[match];        
        }

        // readd to queue
        if (isNil(match) || match === exclude) {
            throw new Error('no match found');
        } else {
            const multi = this.redis.multi();
            multi.set(`veil:matched:${exclude}`, match, 'EX', 300)
                .set(`veil:matched:${match}`, exclude, 'EX', 300)
                .publish(`veil:channel:${exclude}`, JSON.stringify({
                    event_type: 'match',
                    data: {
                        user: match,
                        interests,
                    }
                }))
                .publish(`veil:channel:${match}`, JSON.stringify({
                    event_type: 'match',
                    data: {
                        user: exclude,
                        interests,
                    }
                }));
            await multi.exec();
            console.log(`matched ${exclude} with ${match}`);

            await this.removeFromDiscovery(exclude);
            await this.removeFromDiscovery(match);
        }
    }
}

module.exports = MatchService;
