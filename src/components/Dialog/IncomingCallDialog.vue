<template>
  <v-dialog v-model="show" max-width="325" class="incoming-call-dialog">
    <v-card>
      <!--Card content-->
      <div class="card-content">
        <div class="avatar-wrapper">
          <v-avatar size="120">
            <MSAvatar
              :src="callerInfo ? callerInfo.avatarUrl : ''"
              :alt="callerInfo.userInfo"
            ></MSAvatar>
          </v-avatar>
        </div>

        <div class="d-flex justify-center pa-1 text-h6">{{ callerInfo.fullname }}</div>
        <div class="d-flex justify-center pa-1 text-subtitle-2">Muốn gọi video tới bạn</div>
      </div>

      <!--Card action-->
      <div class="card-actions">
        <v-btn
          icon="mdi-phone-hangup-outline"
          size="46"
          color="red-darken-1"
          @click.stop="show = false"
        ></v-btn>

        <v-btn
          color="green-accent-4"
          size="46"
          @click="openVideoCall"
          icon="mdi-video-outline"
        ></v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>
  
  <script>
import MSAvatar from '@/components/CustomAvatar/MSAvatar.vue'

export default {
  props: {
    visible: Boolean,
    callUrl: String,
    callerInfo: Object
  },

  components: { MSAvatar },

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
  },

  methods: {
    async openVideoCall() {
      window.open(this.callUrl, '_blank', 'width=1280,height=768')
      this.show = false
    }
  }
}
</script>
  
  <style lang="scss">
.incoming-call-dialog {
  .card-content {
    display: flex;
    flex-direction: column;
    padding: 24px;
  }

  .card-actions {
    display: flex;
    justify-content: space-around;
    padding: 36px;

    .v-btn__content {
      color: white;
    }
  }

  .avatar-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 200px;
  }
}
</style>
  