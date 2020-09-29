module.exports = (dependencies, express) => {
    const router = {};

    require('./chat/socket')(dependencies, router);
    require('./matchmaking/socket')(dependencies, router);

    express.ws('/', async (ws, req) => {
        const state = {
            user: null,
            channel: null,
            socket: ws,
        };
        
        const {
            tokenProvider,
            redis,
            redisFactory,
            matchService,
        } = dependencies;

        const {
            cookies: {
                'X-Authorization': token,
            },
        } = req;

        // extract token from cookie
        try {
            const { user } = tokenProvider.verify(token);
            state.user = user;
        } catch (err) {
            console.error(`invalid-token ${token}`);
            ws.send(JSON.stringify({
                event_type: 'invalid-token',
                data: {
                    message: err.message,
                },
            }));
            ws.close();
            return;
        }

        // client events
        ws.on('message', async (msg) => {
            const envelope = JSON.parse(msg);

            const {
                event_type,
                data = {},
            } = envelope;

            const {
                [`client:${event_type}`]: route
            } = router;

            if (!route) {
                console.error(`can not process ${event_type}`);
            }

            try {
                route(state, data);
            } catch (err) {
                console.error(err.message, err.stack);
            }
        });

        const userRedis = redisFactory.create();

        ws.on('close', async () => {
            await redis.publish(
                state.channel,
                JSON.stringify({
                    event_type: 'end-conversation',
                }),
            );
            matchService.removeFromDiscovery(state.user);
            userRedis.disconnect();
        });

        // user channel redis events
        await userRedis.subscribe(`veil:channel:${state.user}`);
        userRedis.on('message', (channel, message) => {
            const envelope = JSON.parse(message);
            const {
                event_type,
                data,
            } = envelope;

            const {
                [`server:${event_type}`]: route
            } = router;

            if (!route) {
                console.error(`can not process ${event_type}`);
            }

            try {
                route(state, data);
            } catch (err) {
                console.error(err.message, err.stack);
            }
        });
    });
}