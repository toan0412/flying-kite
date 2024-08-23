<template>
  <v-btn class="ms-button text-none">
    <slot></slot>
  </v-btn>
</template>

<script>
export default {
  name: 'MSButton'
}
</script>

<style lang="scss">
.ms-button {
  box-shadow: unset;

  .v-btn__content {
    font-size: 13px;
  }
}
</style>
