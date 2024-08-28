<template>
  <div v-if="isAuth" class="main">
    <div class="sidebar-wrapper">
      <Sidebar @is-auth="handleAuthStatus" />
    </div>
    <div class="main-wrapper">
      <IntroductionView v-if="isIntroduction" />
      <HomeView v-else />
    </div>
  </div>
  <div v-else>
    <LoginView @is-auth="handleAuthStatus" />
  </div>
</template>

<script>
import Sidebar from '@/components/layout/sidebar/Sidebar.vue'
import LoginView from './views/Login/LoginView.vue'
import HomeView from './views/Home/HomeView.vue'
import IntroductionView from './views/Introduction/IntroductionView.vue'
import { useRoomInfoStore } from '@/stores/RoomInfoStore'

export default {
  data() {
    return {
      isAuth: false,
      isIntroduction: true
    }
  },

  components: {
    Sidebar,
    LoginView,
    HomeView,
    IntroductionView
  },

  created() {
    const roomInfoStore = useRoomInfoStore()
    console.log(roomInfoStore.roomInfo)
    const accessToken = localStorage.getItem('accessToken')
    const userId = localStorage.getItem('userId')
    if (accessToken && userId) {
      this.isAuth = true
    }
  },

  computed: {
    currentRoom() {
      const roomInfoStore = useRoomInfoStore()
      return roomInfoStore.roomInfo
    }
  },

  watch: {
    currentRoom(newRoom) {
      if (!newRoom) return
      if (this.isIntroduction) {
        this.isIntroduction = false
      }
    }
  },

  methods: {
    handleAuthStatus(isAuth) {
      this.isAuth = isAuth
    },
  }
}
</script>


<style lang="scss">
#app {
  display: flex;
  border-top: 1px solid var(--border-color);
}

.main {
  display: flex;
  width: 100%;
}

.main-wrapper {
  z-index: 1;
  width: calc(100% - 322px);
  min-height: 100vh;
  box-shadow: rgba(0, 0, 0, 0.14) 0px 2px 8px 0px;
}
</style>
