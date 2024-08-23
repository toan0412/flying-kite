<template>
  <v-dialog class="custom-dialog" v-model="dialog" max-width="400px">
    <v-card>
      <v-card-title class="headline">{{ title }}</v-card-title>
      <v-card-text>{{ message }}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <MSButton color="grey-lighten-3" variant="flat" text @click="respond(false)">Đóng</MSButton>
        <MSButton color="red-lighten-1" variant="flat" text @click="respond(true)">Đồng ý</MSButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import MSButton from '../CustomButton/MSButton.vue'

export default {
  name: 'ConfirmDialog',
  props: {
    title: {
      type: String,
      default: 'Thông báo'
    },
    message: {
      type: String,
      default: 'Bạn có chắc chắn không?'
    }
  },
  data() {
    return {
      dialog: false
    }
  },
  methods: {
    openDialog() {
      this.dialog = true
    },
    respond(answer) {
      this.dialog = false
      this.$emit('response', answer)
    }
  },
  components: {
    MSButton
  }
}
</script>

<style lang="scss">
  .custom-dialog{
    .headline {
      color: var(--text-color);
      margin-left: 8px;
      margin-top: 4px;
      padding-bottom: 0;
    }

    .v-card-actions {
      padding-top: 0;
      padding-bottom: 12px;
      margin-right: 22px;
    }
  }

</style>