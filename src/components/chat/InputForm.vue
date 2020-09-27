<template>
    <fieldset>
        <form @submit.prevent="disconnect" v-if="open">
            <button type="submit">
                Disconnect
            </button>
        </form>
        <form @submit.prevent="reconnect" v-else>
            <button type="submit">
                Reconnect
            </button>
        </form>
        <form @submit.prevent="sendMessage" class="send">
          <input type="text" v-model="chat"/>
          <button type="submit">
            Send
          </button>
        </form>
    </fieldset>
</template>

<script>
import { mapState } from 'vuex';
export default {
  data() {
    return {
      chat: "",
    };
  },
  computed: {
      ...mapState('chat', [
          'open',
      ]),
  },
  methods: {
    disconnect() {
        this.$emit('disconnect');
    },
    reconnect() {
        this.$emit('reconnect');
    },
    sendMessage() {
      if (this.chat.trim().length === 0) {
        return;
      }
      this.$emit('send', {
          text: this.chat,
          timestamp: Date.now(),
      });
      this.chat = "";
    },
  },
};
</script>

<style scoped>
.send {
  display: flex;
  flex: 1 1 auto;
}

input[type=text] {
  flex: 1 1 auto;
  margin-left: 0.5rem;
}

fieldset {
    padding: .5rem;
    display: flex;
}
</style>