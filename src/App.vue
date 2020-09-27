<template>
  <div id="app">
    <h1 @click.prevent="toProfile">VEIL</h1>
    <ChatView v-if="view === 'chat'" @back="toProfile" />
    <ProfileForm v-else @proceed="toChat" />
  </div>
</template>

<script>
import ChatView from './components/chat/View';
import ProfileForm from './components/home/Form';

export default {
  name: 'App',
  components: {
    ChatView,
    ProfileForm,
  },
  data() {
    return {
      view: 'entry',
    };
  },
  created() {
    this.$store.commit('auth/setToken', localStorage.getItem('auth-token'));
  },
  computed: {
    token() {
      return this.$store.state.auth.token;
    },
  },
  methods: {
    toProfile() {
      this.view = 'entry';
    },
    toChat() {
      this.view = 'chat';
    }
  },
  watch: {
    token(newToken) {
      if (newToken === null) {
        this.view = 'entry';
      }
    }
  }
};
</script>

<style>
@import "./assets/yorha.css";

#app {
  max-width: 800px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
}

html, body {
  height: 100%;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: .5rem;
}
</style>

<style scoped>
h1:hover {
  cursor: pointer;
}
</style>