<template>
  <div id="container">
    <div v-if="!proceed">
      <h1>VEIL</h1>
      <fieldset>
        <h3>Welcome No. 2B</h3>
        <label>Your access token is {{token}}</label>
        <br>
        <button @click="connect">Proceed</button>
      </fieldset>
    </div>
    <ChatView v-else :history="history" :socket="socket" />
  </div>
</template>

<script>
import ChatView from './ChatView';
import Cookies from 'js-cookie';

export default {
  components: {
    ChatView,
  },
  data() {
    return {
      history: [],
      token: null,
      proceed: false,
      socket: null,
    };
  },
  created() {
    this.history = [];
    this.history.push({
      remote: false,
      content: "Waiting for connection...",
      timestamp: Date.now(),
    });
    fetch('http://localhost:8000/auth', {
      method: 'GET',
      credentials: 'include',
    })
    .then(response => response.json())
    .then((body) => {
      this.token = Cookies.get('token');
    });

    if (Cookies.get("r") == undefined) {
      fetch('https://api.ipify.org/?format=json')
      .then(response => response.json())
      .then(body => Cookies.set('r', body.ip, { expires: 3 }));
    }
  },
  destroyed() {
    if (this.socket) {
      this.socket.close();
    }
  },
  methods: {
    connect() {
      this.socket = new WebSocket(`ws://localhost:8000/`);
      this.socket.onmessage = ev => {
        let body = JSON.parse(ev.data);
        console.log(body);
        // connection found
        if (body.op === 0) {
          this.history.push({
            remote: false,
            content: "Connection established",
            timestamp: Date.now(),
          });
        }
        else if (body.op === 1){
          this.history.push({
            remote: true,
            content: body.text,
            timestamp: Date.now(),
          });
        }
      };
      this.socket.onclose = ev => {
        this.history.push({
          remote: false,
          connect: "Transmission Ended",
          timestamp: Date.now(),
        })
      };
      this.proceed = true;
    },
    disconnect() {
      this.socket.close();
      this.socket = null;
      this.proceed = false;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#container {
  height: 100%;
}
</style>