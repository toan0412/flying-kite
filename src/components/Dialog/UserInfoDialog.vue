<template>
  <v-dialog v-model="show" max-width="500" class="user-info-dialog">
    <v-card v-if="isCallingAPI">
      <v-skeleton-loader type="image"></v-skeleton-loader>
      <v-skeleton-loader type="paragraph"></v-skeleton-loader>
      <v-skeleton-loader type="paragraph"></v-skeleton-loader>
      <v-skeleton-loader type="paragraph"></v-skeleton-loader>
      <v-skeleton-loader type="paragraph"></v-skeleton-loader>
      <v-skeleton-loader type="paragraph"></v-skeleton-loader>
    </v-card>
    <v-card v-else>
      <v-card-actions class="justify-sm-center">
        <div class="text-h6 font-weight-bold">Thông tin người dùng</div>
        <v-btn
          class="position-absolute right-0"
          icon="mdi-close"
          flat
          @click.stop="show = false"
        ></v-btn>
      </v-card-actions>

      <div class="h-100 w-100 d-flex justify-center">
        <div class="user-info-dialog__body__main">
          <div class="text-subtitle-1 font-weight-bold opacity-70 pa-2">Hồ sơ</div>

          <div class="d-flex justify-sm-center mb-5">
            <v-avatar size="140">
              <MSAvatar cover :alt="userInfo.username" :src="userInfo.avatarUrl"></MSAvatar>
            </v-avatar>
          </div>

          <div class="user-info-dialog__main__item d-flex justify-sm-space-between ma-2">
            <div class="font-weight-bold">Tên người dùng:</div>
            <div class="font-weight-bold opacity-60">
              {{ userInfo.fullName }}
            </div>
          </div>

          <div class="user-info-dialog__main__item d-flex justify-sm-space-between ma-2">
            <div class="font-weight-bold">Email:</div>
            <div class="font-weight-bold opacity-60">
              {{ userInfo.email }}
              <v-icon size="14" icon="mdi-check-circle-outline" color="green-accent-4"></v-icon>
            </div>
          </div>

          <div class="user-info-dialog__main__item d-flex justify-sm-space-between ma-2">
            <div class="font-weight-bold">Trạng thái:</div>
            <div class="font-weight-bold opacity-60">
              {{ userInfo.status === 'online' ? 'Đang trực tuyến' : 'Đang ngoại tuyến' }}
            </div>
          </div>

          <div
            class="user-info-dialog__main__item d-flex justify-sm-space-between ma-2 cursor-pointer"
          >
            <v-hover>
              <template v-slot:default="{ props: hoverProps, isHovering }">
                <div
                  @click="sendMessage(userInfo)"
                  v-bind="hoverProps"
                  :class="['mx-auto', isHovering ? 'opacity-70' : 'opacity-100']"
                  class="d-flex w-100 justify-center align-center font-weight-bold"
                >
                  <v-icon class="pr-2" icon="mdi-message-text-outline"></v-icon>
                  Gửi tin nhắn
                </div>
              </template>
            </v-hover>
          </div>

          <div
            class="user-info-dialog__main__item d-flex justify-sm-space-between ma-2 cursor-pointer"
          >
            <v-hover>
              <template v-slot:default="{ props: hoverProps, isHovering }">
                <div
                  v-bind="hoverProps"
                  :class="['mx-auto', isHovering ? 'opacity-70' : 'opacity-100']"
                  class="d-flex w-100 justify-center align-center font-weight-bold"
                >
                  <v-icon class="pr-2" icon="mdi-phone-outline"></v-icon>
                  Gọi thoại
                </div>
              </template>
            </v-hover>
          </div>

          <div
            class="user-info-dialog__main__item d-flex justify-sm-space-between ma-2 cursor-pointer"
          >
            <v-hover>
              <template v-slot:default="{ props: hoverProps, isHovering }">
                <div
                  v-bind="hoverProps"
                  :class="['mx-auto', isHovering ? 'opacity-70' : 'opacity-100']"
                  class="d-flex w-100 justify-center align-center font-weight-bold"
                >
                  <v-icon class="pr-2" icon="mdi-video-outline"></v-icon>
                  Gọi video
                </div>
              </template>
            </v-hover>
          </div>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>
  
  <script>
import MSAvatar from '@/components/CustomAvatar/MSAvatar.vue'
import { getUserByIdAPI } from '@/services/UserServices'

export default {
  data() {
    return {
      userInfo: {},
      isCallingAPI: true
    }
  },

  props: {
    visible: Boolean,
    userId: String
  },

  components: {
    MSAvatar
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
  },

  methods: {
    async getUserInfo() {
      this.isCallingAPI = true
      try {
        const response = await getUserByIdAPI(this.userId)
        this.userInfo = response.data
      } catch (error) {
        console.error('Error get user info', error)
      } finally {
        this.isCallingAPI = false
      }
    },

    sendMessage(userInfo) {
      console.log('send message', userInfo)
    }
  },

  watch: {
    visible(newValue) {
      if (newValue) {
        this.getUserInfo()
      }
    }
  }
}
</script>
  
  <style lang="scss">
.user-info-dialog {
  .v-card-actions {
    border-bottom: 1px solid var(--border-color);
  }
  .user-info-dialog__body__nav {
    border: 1px solid var(--border-color);

    .v-list-item {
      cursor: pointer;
      border-bottom: 1px solid var(--border-color);
    }

    .v-list-item:hover {
      opacity: 0.7;
    }

    .v-list-item__content {
      display: flex;
      align-items: center;
    }
  }

  .v-text-field {
    .v-field__field {
      height: 36px;
    }

    .v-input__details {
      display: none;
    }

    .v-field__outline {
      display: none;
    }

    .v-field__outline {
      height: 36px;
    }

    .v-input__append {
      margin: 4px;
    }

    .v-field__input {
      min-height: fit-content;
      font-size: 14px;
      height: 36px;
    }
  }
}

.user-info-dialog__body {
  display: flex;
}

.user-info-dialog__body__main {
  width: 450px;
  height: 525px;
}

.user-info-dialog__main__item {
  align-items: center;
  height: 44px;
  border-bottom: 1px solid var(--border-color);
}
</style>
  