import auth from './state/auth';
import profile from './state/profile';
import chat from './state/chat';

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);
export default new Vuex.Store({
    modules: {
        auth,
        profile,
        chat,
    }
});
