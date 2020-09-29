export default {
    namespaced: true,
    state: {
        details: {},
        preferences: {},
    },
    mutations: {
        setDetails(state, payload) {
            state.details = {
                ...state.details,
                ...payload,
            };
        },
        setPreferences(state, payload) {
            state.preferences = {
                ...state.preferences,
                ...payload,
            };
        }
    }
};
