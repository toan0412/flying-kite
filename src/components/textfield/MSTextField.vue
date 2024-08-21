<template>
  <v-text-field class="custom-textfield">
    <slot></slot>
  </v-text-field>
</template>

<script>
export default {}
</script>

<style lang="scss">
.custom-textfield {
  .v-field {
    border-radius: 18px;
    background-color: var(--background-icon-color);
  }

  .v-field--variant-solo {
    box-shadow: unset;
  }

  .v-field__input {
    color: var(--text-color);
  }

  .v-field__append-inner {
    color: var(--text-color);
  }
}</style>
