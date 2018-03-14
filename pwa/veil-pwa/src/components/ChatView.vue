<template>
  <div id="view">
    <figure class="chatbox">
        <figcaption>VEIL</figcaption>
        <div class="chatbox-body" ref="chatbox">
          <transition-group name="chat-history" v-on:enter="scrollToBottom">
            <Message v-for="message in history"
                :key="message.timestamp"
                :remote="message.remote"
                :content="message.content"
            />
          </transition-group>
        </div>
    </figure>

    <fieldset>
        <div class="send">
            <button type="submit" @click="modalVisible = true">
            Disconnect
            </button>
            <input type="text" v-model="chat"/>
            <button type="submit" @click="sendMessage">
            Send
            </button>
        </div>
    </fieldset>

    <div class="modal" :class="{'active': modalVisible}">
      <div class="modal-body">
        <figure>
          <label>Are you sure you want to disconnect?</label>
          <br>
          <div style="text-align: right">
            <button @click.stop="disconnect">Yes</button>
            <button @click.stop="modalVisible = false">Not Right Now</button>
          </div>
        </figure>
      </div>
    </div>
  </div>
</template>

<script>
import Message from './Message';
import Cookies from 'js-cookie';

export default {
  props: ['history', 'socket'],
  components: {
    Message,
  },
  data() {
    return {
      chat: "",
      modalVisible: false,
    };
  },
  methods: {
    sendMessage() {
      this.socket.send(this.chat);
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
    disconnect() {
      
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.send {
  display: flex;
}

.send input[type=text] {
  flex: 1 1 auto;
}

fieldset {
    padding: .5rem;
}

#view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chatbox {
  flex: 1 1 auto;
}

.chatbox-body {
  overflow: auto;
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