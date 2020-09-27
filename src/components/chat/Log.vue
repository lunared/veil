<template>
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
</template>

<script>
import Message from './Message';

export default {
  components: {
    Message,
  },
  computed: {
    history(){
      return this.$store.state.chat.log;
    },
  },
  methods: {
    scrollToBottom(el, done) {
      this.$refs.chatbox.scrollTop = this.$refs.chatbox.scrollHeight;
      done();
    },
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
</style>