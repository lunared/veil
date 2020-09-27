<template>
  <div class="modal" :class="{'active': visible}">
    <div class="modal-body">
        <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: ['visible'],
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
  z-index: 999;
}

.modal.active {
  opacity: 1;
  pointer-events: fill;
}
</style>
