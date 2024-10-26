<template>
  <div v-if="isUserInfoLoaded" class="introduction__wrapper">
    <div class="introduction__main">
      <div class="introduction__main__content">
        <div class="introduction__main__content__header">
          <v-avatar size="100">
            <v-img :alt="userInfo.email" :src="userInfo.avatarUrl"> </v-img>
          </v-avatar>

          <div class="introduction__main__content__header__gretting">
            Chào mừng bạn!
            <div class="fullName">
              {{ userInfo.fullName }}
            </div>
          </div>
        </div>
        <div class="text">Bạn có thể thực hiện một số hành động nhanh để bắt đầu</div>
        <div class="introduction__main__content_body">
          <div class="introduction__main__content_body__item">
            <v-card class="mx-auto" width="360" height="320">
              <div class="d-flex justify-center mt-6">
                <v-img
                  :height="120"
                  :max-width="120"
                  src="https://firebasestorage.googleapis.com/v0/b/flying-kite-26adc.appspot.com/o/assets%2Flaunch.png?alt=media&token=a23abb9b-d49a-4a22-b175-0f3e1e60c4e3"
                  cover
                >
                </v-img>
              </div>

              <v-card-title class="pt-4 d-flex justify-center">
                Dễ dàng trò chuyện với bất cứ ai
              </v-card-title>

              <v-card-text>
                <p>Tìm kiếm mọi người một cách dễ dàng</p>
                <p>Tạo tin nhắn riêng hoặc tin nhắn nhóm mới</p>
              </v-card-text>

              <v-card-actions>
                <MSButton @click="showCreatePrivateRoomDialog = true">Tin nhắn riêng</MSButton>

                <MSButton @click="showCreatePublicRoomDialog = true">Tin nhắn nhóm</MSButton>
              </v-card-actions>
            </v-card>
          </div>

          <div class="introduction__main__content_body__item">
            <v-card class="mx-auto" width="360" height="320">
              <div class="d-flex justify-center mt-6">
                <v-img
                  :height="120"
                  :max-width="120"
                  src="https://firebasestorage.googleapis.com/v0/b/flying-kite-26adc.appspot.com/o/assets%2FLovepik_com-401009840-phone-class-cartoon-hand-drawn-wind-red-phone.png?alt=media&token=d60551c5-afff-4446-8a32-6cbe2274d635"
                  cover
                >
                </v-img>
              </div>

              <v-card-title class="pt-4 d-flex justify-center">
                Dễ dàng gọi thoại, video cho bất kì ai
              </v-card-title>

              <v-card-text>
                <p>
                  Gọi thoại và video dễ dàng, kết nối với bạn bè và đồng nghiệp mọi lúc mọi nơi.
                </p>
              </v-card-text>

              <v-card-actions>
                <MSButton @click="openCallRoom(false)">Gọi thoại</MSButton>

                <MSButton @click="openCallRoom(true)">Gọi video</MSButton>
              </v-card-actions>
            </v-card>
          </div>
        </div>
      </div>

      <div class="introduction__main__footer">Bạn đã đăng nhập bằng {{ userInfo.email }}</div>
    </div>
  </div>

  <CreatePrivateRoomDialog
    :visible="showCreatePrivateRoomDialog"
    @close="showCreatePrivateRoomDialog = false"
  />
  <CreatePublicRoomDialog
    :visible="showCreatePublicRoomDialog"
    @close="showCreatePublicRoomDialog = false"
  />
  <CreateCallRoomDialog
    :has-video="hasVideoCall"
    :visible="showCallRoomDialog"
    @close="showCallRoomDialog = false"
  />
</template>

<script>
import MSButton from '@/components/CustomButton/MSButton.vue'
import { useUserInfoStore } from '@/stores/UserInfoStore'
import { defineAsyncComponent } from 'vue'

export default {
  data() {
    return {
      userInfo: {},
      isUserInfoLoaded: false,
      showCreatePrivateRoomDialog: false,
      showCreatePublicRoomDialog: false,
      showCallRoomDialog: false,
      hasVideoCall: false
    }
  },

  components: {
    MSButton,
    CreatePrivateRoomDialog: defineAsyncComponent(() =>
      import('@/components/Dialog/CreatePrivateRoomDialog.vue')
    ),
    CreatePublicRoomDialog: defineAsyncComponent(() =>
      import('@/components/Dialog/CreatePublicRoomDialog.vue')
    ),
    CreateCallRoomDialog: defineAsyncComponent(() =>
      import('@/components/Dialog/CreateCallRoomDialog.vue')
    )
  },

  methods: {
    openCallRoom(hasVideo) {
      this.showCallRoomDialog = true
      this.hasVideoCall = hasVideo
    }
  },

  mounted() {
    const userInfoStore = useUserInfoStore()
    this.userInfo = userInfoStore.userInfo

    this.$watch(
      () => userInfoStore.userInfo,
      (newValue) => {
        this.userInfo = newValue
        if (newValue) {
          this.isUserInfoLoaded = true
        }
      },
      { immediate: true }
    )
  }
}
</script>

<style lang="scss">
.introduction__wrapper {
  position: relative;
  display: flex;
  overflow: hidden;
  align-items: stretch;
  height: 100%;
}

.introduction__main {
  position: relative;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-shrink: 1;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  padding-left: 45px;
  padding-right: 45px;
  transition: none 0s ease 0s;
}

.introduction__main__content {
  position: relative;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-shrink: 1;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  align-self: stretch;
}

.introduction__main__footer {
  position: relative;
  display: flex;
  flex-direction: column;
  flex-grow: 0;
  flex-shrink: 0;
  overflow: hidden;
  align-items: stretch;
}

.introduction__main__content__header {
  display: flex;
  margin-bottom: 30px;
  margin-right: 10px;
  margin-left: 10px;
  align-items: center;

  .v-avatar {
    border: 1px solid var(--border-color);
    background: rgb(var(--v-theme-primary));
  }
}

.introduction__main__content__header__gretting {
  position: relative;
  display: inline;
  flex-grow: 0;
  flex-shrink: 0;
  padding-left: 24px;
  overflow: hidden;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  font-size: 40px;
  color: var(--text-color);

  .fullName {
    font-weight: bold;
  }
}

.introduction__main__content_body {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.introduction__main__content_body__item {
  display: flex;
  padding: 12px 16px;

  .v-card {
    box-shadow: unset;
    border: 1px solid var(--border-color);
  }

  .v-card-text {
    p {
      display: flex;
      justify-content: center;
      text-align: center;
    }
  }

  .v-card-actions {
    width: 100%;
    position: absolute;
    bottom: 12px;
    display: flex;
    justify-content: space-around;

    .v-btn {
      background-color: rgb(var(--v-theme-primary));
      color: rgb(var(--v-theme-secondary));
    }
  }
}

.introduction__main__footer {
  font-size: 15px;
  font-weight: bold;
  color: var(--text-color);
  text-align: center;
  line-height: 20px;
  margin-bottom: 18px;
}

.text {
  display: inline;
  flex-grow: 0;
  flex-shrink: 0;
  overflow: hidden;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  font-size: 22px;
  color: var(--text-color);
  margin: 25px 10px;
  text-align: center;
}

@media (max-width: 1024px) {
  .introduction__main {
    padding-left: 20px;
    padding-right: 20px;
  }

  .introduction__main__content__header__gretting {
    font-size: 32px;
  }

  .text {
    font-size: 18px;
  }
}

@media (max-width: 768px) {
  .introduction__main__content__header {
    flex-direction: column;
    text-align: center;
  }

  .introduction__main__content__header__gretting {
    padding-left: 0;
    margin-top: 15px;
    font-size: 28px;
  }

  .introduction__main__content_body__item {
    width: 100%;
  }

  .v-card {
    width: 100% !important;
  }
}

@media (max-width: 480px) {
  .introduction__main {
    padding-left: 10px;
    padding-right: 10px;
  }

  .introduction__main__content__header__gretting {
    font-size: 24px;
  }

  .text {
    font-size: 16px;
  }

  .introduction__main__footer {
    font-size: 13px;
  }

  .v-card-title {
    font-size: 18px !important;
  }

  .v-card-text {
    font-size: 14px;
  }

  .v-btn {
    font-size: 12px !important;
  }
}
</style>