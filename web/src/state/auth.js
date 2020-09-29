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
            if (token) {
                localStorage.setItem('auth-token', token);
                document.cookie = `X-Authorization=${token}; path=/`;
            } else {
                localStorage.removeItem('auth-token');
                document.cookie = '';
            }
            state.token = token;
        },
    }
};
