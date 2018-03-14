<template>
  <div id="app">
    <HelloWorld/>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld';

export default {
  name: 'App',
  components: {
    HelloWorld,
  },
};
</script>

<style>
@import "./assets/yorha.css";

#app {
  max-width: 800px;
  margin: 0 auto;
  height: 100%;
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
