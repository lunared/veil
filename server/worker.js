const throng = require('throng');

let workers = process.env.WEB_CONCURRENCY || 2;

function start() {
    const { matchService, redis } = require('./dependencies')();
    const matchQueue = matchService.queue;
    matchQueue.process((job) => {
        const {
            data: {
                user,
                preferences,
            }
        } = job;

        return matchService.findUser(user, preferences);
    });
    matchQueue.on('failed', (job) => {
        const {
            data: {
                user
            },
            opts: {
                attempts,
            },
            attemptsMade,
        } = job;
        if (attemptsMade >= attempts) {
            console.log(`no match found, attempts exhausted user: ${user}`);
            redis.publish(
                `veil:channel:${user}`,
                JSON.stringify({
                    event_type: 'match',
                    data: {
                        user: null,
                    },
                })
            );
            matchService.removeFromDiscovery(user);
        } else {
            console.log(`no match found, requeue user: ${user}, attempt: ${attemptsMade}/${attempts}`);
        }
    });

    setInterval(
        () => {
            matchService.reap();
        },
        300000,
    );
}

throng({ workers, start });
