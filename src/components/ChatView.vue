<template>
  <div id="view">
    <div class="chatbox">
        <div class="title">
          <h3>Log</h3>
        </div>
        <div class="body" ref="chatbox">
          <transition-group name="chat-history" v-on:enter="scrollToBottom" tag="div">
            <Message v-for="message in history"
                :key="message.timestamp"
                :remote="message.remote"
                :content="message.content"
            />
          </transition-group>
        </div>
    </div>

    <fieldset>
        <div class="send">
            <button type="submit" @click="modalVisible = true" v-if="this.socket !== null">
              Disconnect
            </button>
            <button type="submit" @click="connect" v-if="this.socket === null">
              Reconnect
            </button>
            <form @submit.prevent="sendMessage">
              <input type="text" v-model="chat"/>
              <button type="submit">
                Send
              </button>
            </form>
        </div>
    </fieldset>

    <div class="modal" :class="{'active': modalVisible}">
      <div class="modal-body">
        <figure>
          <label>Are you sure you want to disconnect?</label>
          <br>
          <div style="text-align: right">
            <button @click.stop="disconnect">Yes</button>
            &nbsp;
            <button @click.stop="modalVisible = false">Not Right Now</button>
          </div>
        </figure>
      </div>
    </div>
  </div>
</template>

<script>
import Message from './Message';

export default {
  props: ['token', 'profile', 'preferences'],
  components: {
    Message,
  },
  data() {
    return {
      chat: "",
      history: [],
      socket: null,
      modalVisible: false,
    };
  },
  mounted() {
    this.connect();
  },
  methods: {
    sendMessage() {
      if (this.chat.trim().length === 0) {
        return;
      }
      this.socket.send(JSON.stringify({
        event_type: 'chat-message',
        data: {
          text: this.chat,
        },
      }));
      this.history.push({
        remote: false,
        content: this.chat,
        timestamp: Date.now(),
      });
      this.chat = "";
    },
    scrollToBottom(el, done) {
      this.$refs.chatbox.scrollTop = this.$refs.chatbox.scrollHeight;
      done();
    },
    connect() {
      const host = location.origin.replace(/^http/, 'ws');
      this.socket = new WebSocket(host);
      this.history = [];
      this.history.push({
        remote: false,
        content: "Establishing uplink...",
        timestamp: Date.now(),
      });
      
      this.socket.onmessage = ev => {
        console.log(ev.data);
        const msg = JSON.parse(ev.data);
        
        const {
          event_type,
          data,
        } = msg;
        if (event_type === 'new-conversation') {
          this.history.push({
            remote: false,
            content: "Begin Transmission",
            timestamp: Date.now(),
          });
        } else if (event_type === 'chat-message') {
          this.history.push({
            remote: true,
            content: data.text,
            timestamp: Date.now(),
          });
        } else if (event_type === 'invalid-token') {
          this.closeSocket();
          this.$emit('reauth');
        } else if (event_type === 'end-conversation') {
          this.history.push({
            remote: false,
            content: "Transmission Ended (CODE=901, Other User Disconnected)",
            timestamp: Date.now(),
          });
          this.closeSocket();
        } else if (event_type === 'no-match') {
          this.history.push({
            remote: false,
            content: "Transmission Ended (CODE=404, No Match Found)",
            timestamp: Date.now(),
          });
          this.closeSocket();
        }
      };
      this.socket.onopen = () => {
        this.socket.send(JSON.stringify({
          event_type: 'match',
          data: {
            profile: this.profile,
            search: this.preferences,
          },
        }));
      };
    },
    disconnect() {
      this.history.push({
        remote: false,
        content: "Transmission Ended (CODE=2311, Self Termination)",
        timestamp: Date.now(),
      });
      this.closeSocket();
      this.modalVisible = false;
    },
    closeSocket() {
      this.socket.close();
      this.socket = null;
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.send, .send form {
  display: flex;
  flex: 1 1 auto;
}

.send input[type=text] {
  flex: 1 1 auto;
  margin-left: 0.5rem;
}

fieldset {
    padding: .5rem;
}

#view {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
}

figure {
  display: inline-block;
}

.chatbox {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  margin: 0 0 1rem 0;
}

.chatbox .title {
  background-color: #454138;
  color: #bab5a1;
  padding: 0.5rem 1rem;
}

.chatbox .title h3 {
  margin: 0;
  font-size: 1.2rem;
}

.chatbox .body {
  overflow-y: auto;
  background-color: #dcd8c0;
  color: #454138;
  padding: 0.5rem;
  flex: 1;
}

.modal {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
}

.modal.active {
  opacity: 1;
  pointer-events: fill;
}

</style>