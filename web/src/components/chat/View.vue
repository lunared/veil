<template>
  <div id="view">
    <ChatLog />
    <InputForm @send="sendMessage" @reconnect="connect" @disconnect="showModal" />
    
    <Modal :visible="modalVisible">
      <form @submit.prevent="disconnect" @reset.prevent="showModal(false)">
        <figure>
        <label>Are you sure you want to disconnect?</label>
        <br>
        <div style="text-align: right">
            <button type="submit">Yes</button>
            &nbsp;
            <button type="reset">Not Right Now</button>
        </div>
        </figure>
      </form>
    </Modal>
  </div>
</template>

<script>
import InputForm from './InputForm';
import ChatLog from './Log';
import Modal from '../Modal';

export default {
  components: {
    ChatLog,
    InputForm,
    Modal,
  },
  data() {
    return {
      socket: null,
      modalVisible: false,
    };
  },
  mounted() {
    this.connect();
  },
  beforeDestroy() {
    this.disconnect();
  },
  methods: {
    showModal(visible = true) {
      this.modalVisible = visible;
    },
    sendMessage(payload) {
      this.socket.send(JSON.stringify({
        event_type: 'chat-message',
        data: {
          text: payload.text,
        },
      }));
      this.$store.commit('chat/push', {
        remote: false,
        content: payload.text,
        timestamp: payload.timestamp,
      });
    },
    connect() {
      if (this.socket !== null) {
        return;
      }

      const host = location.origin.replace(/^http/, 'ws');
      this.socket = new WebSocket(`${host}/ws`);
      this.$store.commit('chat/begin');
      this.$store.commit('chat/push', {
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
        if (`e:${event_type}` in this) {
          this[`e:${event_type}`](data);
        }
      };
      this.socket.onopen = () => {
        const profile = [
          `gender:${this.$store.state.profile.details.gender}`,
        ];
        const search = [
          ...this.$store.state.profile.preferences.gender.map(v => `gender:${v}`),
        ];
        this.socket.send(JSON.stringify({
          event_type: 'match',
          data: {
            profile,
            search,
          },
        }));
      };
    },
    disconnect() {
      this.$store.commit('chat/push', {
        remote: false,
        content: "Transmission Ended (CODE=2311, Self Termination)",
        timestamp: Date.now(),
      });
      this.closeSocket();
      this.modalVisible = false;
    },
    closeSocket() {
      this.$store.commit('chat/end');
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }
    },
    // socket event handlers
    'e:new-conversation'() {
      this.$store.commit('chat/push', {
        remote: false,
        content: "Begin Transmission",
        timestamp: Date.now(),
      });
    },
    'e:end-conversation'() {
      this.$store.commit('chat/push', {
        remote: false,
        content: "Transmission Ended (CODE=901, Other User Disconnected)",
        timestamp: Date.now(),
      });
      this.closeSocket();
    },
    'e:chat-message'({ text }) {
      this.$store.commit('chat/push', {
        remote: true,
        content: text,
        timestamp: Date.now(),
      });
    },
    'e:no-match'() {
      this.$store.commit('chat/push', {
        remote: false,
        content: "Transmission Ended (CODE=404, No Match Found)",
        timestamp: Date.now(),
      });
      this.closeSocket();
    },
    'e:invalid-token'() {
      this.closeSocket();
      this.$store.commit('auth/setToken', null);
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#view {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
}

figure {
  display: inline-block;
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