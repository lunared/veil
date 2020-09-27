export default {
    namespaced: true,
    state: {
        token: null,
    },
    getters: {
        isVerified(state) {
            return state.token !== null;
        },
    },
    mutations: {
        setToken(state, token) {
            localStorage.setItem('auth-token', token);
            state.token = token;
            document.cookie = `X-Authorization=${token}; path=/`;
        },
    }
};
