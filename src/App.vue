<template>
  <div id="app">
    <h1>VEIL</h1>
    <div v-if="state == 'entry'">
      <figure>
        <h3>Please verify your humanity</h3>
        <Captcha @success="setToken" />
      </figure>
    </div>
    <div v-else-if="state === 'profile'">
      <figure>
        <figcaption>Welcome</figcaption>
        <!-- <label style="word-wrap: anywhere;">Your access token is {{token}}</label><br> -->
        <fieldset>
          <legend>Identify your model type</legend>
          <label><input name="gender" type="radio" v-model="profileGender" value="m" checked>M</label>
          <label><input name="gender" type="radio" v-model="profileGender" value="f">F</label>
          <label><input name="gender" type="radio" v-model="profileGender" value="x">X</label>
        </fieldset>
        <br>
        <fieldset>
          <legend>Identify compatibility</legend>
          <label><input type="checkbox" v-model="searchGender" value="m">M</label>
          <label><input type="checkbox" v-model="searchGender" value="f" checked>F</label>
          <label><input type="checkbox" v-model="searchGender" value="x">X</label>
        </fieldset>
        <button @click="proceed">Proceed</button>
      </figure>
    </div>
    <ChatView v-else-if="state === 'chat'" :token="token" :profile="profile" :preferences="preferences" @back="toProfile" @reauth="toVerify" />
  </div>
</template>

<script>
import ChatView from './components/ChatView';
import Captcha from './components/Verify';

export default {
  name: 'App',
  components: {
    ChatView,
    Captcha,
  },
  data() {
    return {
      token: null,
      state: 'entry',
      profileGender: 'm',
      searchGender: ['f'],
    };
  },
  created() {
    this.setToken(localStorage.getItem('auth-token'));
  },
  computed: {
    profile() {
      return [
        `gender:${this.profileGender}`,
      ];
    },
    preferences() {
      return [
        ...this.searchGender.map(v => `gender:${v}`),
      ];
    }
  },
  methods: {
    setToken(token) {
      localStorage.setItem('auth-token', token);
      this.token = token;
      document.cookie = `X-Authorization=${token}; path=/`;
      if (this.token) {
        this.toProfile();
      } else {
        this.state = 'entry';
      }
    },
    toProfile() {
      this.state = 'profile';
    },
    toVerify() {
      this.setToken(null);
    },
    proceed() {
      this.state = 'chat';
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
