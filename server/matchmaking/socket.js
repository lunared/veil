module.exports = ({ matchService }, router) => {
    router['client:match'] = async (state, msg) => {
        const {
            profile,
            search: preferences,
        } = msg;

        await matchService.addToDiscovery(state.user, profile, preferences);
    };

    router['server:match'] = async (state, msg) => {
        const {
            user,
            interests
        } = msg;
        if (user) {
            state.channel = `veil:channel:${msg.user}`;
            state.socket.send(JSON.stringify({
                event_type: 'new-conversation',
                data: {
                    interests,
                },
            }));
        } else {
            state.socket.send(JSON.stringify({
                event_type: 'no-match',
                data: {},
            }));
        }
    };

    router['server:end-conversation'] = async (state) => {
        state.socket.send(
            JSON.stringify({
                event_type: 'end-conversation',
                data: {},
            }),
        );
    };
};
