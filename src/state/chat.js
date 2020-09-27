export default {
    namespaced: true,
    state: {
        open: false,
        log: [],
        history: [],
    },
    mutations: {
        push({ log }, message) {
            log.push(message);
        },
        begin(state) {
            state.log = [];
            state.open = true;
        },
        end( state ) {
            const { log, history } = state;
            if (log.length >= 0) {
                history.push(log);
            }
            state.open = false;
        }
    },
};
