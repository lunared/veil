module.exports = ({ redis }, router) => {
    router['client:chat-message'] = async (state, msg) => {
        const {
            text,
        } = msg;

        console.log(`sending chat to ${state.channel} from user ${state.user}`);
        await redis.publish(
            state.channel,
            JSON.stringify({
                event_type: 'chat-message',
                data: {
                    text,
                }
            }),
        );
    };

    router['server:chat-message'] = async (state, msg) => {
        const {
            text,
        } = msg;
        console.log(`chat received, user: ${state.user}`);
        await state.socket.send(
            JSON.stringify({
                event_type: 'chat-message',
                data: {
                    text,
                },
            }),
        );
    }
};
