<template>
  <v-dialog v-model="show" max-width="525">
    <v-card>
      <v-card-actions class="justify-sm-center">
        <div class="text-h6 font-weight-bold">{{ file.name }}</div>
        <v-btn
          class="position-absolute right-0"
          icon="mdi-close"
          flat
          @click.stop="show = false"
        ></v-btn>
      </v-card-actions>
      <v-img :src="file.url" contain height="100%"></v-img>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    visible: Boolean,
    file: Object
  },

  computed: {
    show: {
      get() {
        return this.visible
      },
      set(value) {
        if (!value) {
          this.$emit('close')
        } else {
          this.$emit('input', value)
        }
      }
    }
  }
}
</script>