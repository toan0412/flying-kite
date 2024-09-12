<template>
  <div v-if="isUserInfoLoaded" class="introduction__wrapper">
    <div class="introduction__main">
      <div class="introduction__main__content">
        <div class="introduction__main__content__header">
          <v-avatar size="100">
            <MSAvatar :alt="userInfo.username" :src="userInfo.avatarUrl"> </MSAvatar>
          </v-avatar>

          <div class="introduction__main__content__header__gretting">
            Chào mừng bạn!
            <div class="fullname">
              {{ userInfo.fullname }}
            </div>
          </div>
        </div>
        <div class="text">Bạn có thể thực hiện một số hành động nhanh để bắt đầu</div>
        <div class="introduction__main__content_body">
          <div class="introduction__main__content_body__item">
            <v-card class="mx-auto" max-width="400">
              <v-img
                class="align-end text-white"
                height="200"
                src="https://cdn.vuetifyjs.com/images/cards/docks.jpg"
                cover
              >
              </v-img>

              <v-card-title class="pt-4"> Dễ dàng trò chuyện với bất cứ ai </v-card-title>

              <v-card-text>
                <div>Tìm kiếm mọi người một cách dễ dàng</div>
                <div>Tạo tin nhắn riêng hoặc tin nhắn nhóm mới</div>
              </v-card-text>

              <v-card-actions>
                <v-btn color="brown" text="Tin nhắn riêng"></v-btn>

                <v-btn color="brown" text="Tạo nhóm nhóm"></v-btn>
              </v-card-actions>
            </v-card>
          </div>
          <div class="introduction__main__content_body__item">
            <v-card class="mx-auto" max-width="400">
              <v-img
                class="align-end text-white"
                height="200"
                src="https://cdn.vuetifyjs.com/images/cards/docks.jpg"
                cover
              >
              </v-img>

              <v-card-title class="pt-4"> Dễ dàng trò chuyện với bất cứ ai </v-card-title>

              <v-card-text>
                <div>Whitehaven Beach</div>

                <div>Whitsunday Island, Whitsunday Islands</div>
              </v-card-text>

              <v-card-actions>
                <v-btn color="purple" text="Tìm kiếm"></v-btn>

                <v-btn color="purple" text="Explore"></v-btn>
              </v-card-actions>
            </v-card>
          </div>
        </div>
      </div>

      <div class="introduction__main__footer">Bạn đã đăng nhập bằng {{ userInfo.email }}</div>
    </div>
  </div>
</template>

<script>
import MSAvatar from '@/components/CustomAvatar/MSAvatar.vue'
import { useUserInfoStore } from '@/stores/UserInfoStore'

export default {
  data() {
    return {
      userInfo: {},
      isUserInfoLoaded: false
    }
  },

  components: {
    MSAvatar
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

  .fullname {
    font-weight: bold;
  }
}

.introduction__main__content_body {
  display: flex;
}

.introduction__main__content_body__item {
  display: flex;
  padding: 12px 16px;
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
}
</style>
