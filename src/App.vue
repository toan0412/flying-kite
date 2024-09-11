<template>
  <div v-if="isAuth" class="main">
    <div class="sidebar-wrapper">
      <router-view class="view sidebar" name="sidebar" @is-auth="handleAuthStatus" />
    </div>
    <div class="main-wrapper">
      <IntroductionView v-if="showIntroduction" />
      <router-view v-else />
    </div>
    <IncomingCallDialog
      :callUrl="callUrl"
      :callerInfo="callerInfo"
      v-model:visible="showPrivateRoomDialog"
      @close="showPrivateRoomDialog = false"
    />
  </div>
  <div v-else>
    <LoginView @is-auth="handleAuthStatus" />
  </div>
</template>

<script>
import LoginView from '@/views/Login/LoginView.vue'
import IntroductionView from '@/views/Introduction/IntroductionView.vue'
import { useRoomInfoStore } from '@/stores/RoomInfoStore'
import ChatService from '@/socket/ChatService'
import { getUserByIdAPI } from './services/UserServices'
import { defineAsyncComponent } from 'vue'

export default {
  data() {
    return {
      isAuth: false,
      isIntroduction: true,
      showPrivateRoomDialog: false,
      callUrl: null,
      callerInfo: null
    }
  },

  components: {
    LoginView,
    IntroductionView,
    IncomingCallDialog: defineAsyncComponent(() =>
      import('./components/Dialog/IncomingCallDialog.vue')
    )
  },

  created() {
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
    },

    showIntroduction() {
      return this.isIntroduction && this.$route.path !== '/call'
    }
  },

  mounted() {
    ChatService.onLeavedRoomReceived(() => {
      this.isIntroduction = true
    })

    ChatService.onIncomingCallReceived(async (callUrl) => {
      const url = new URL(callUrl)
      const callerId = url.searchParams.get('caller_id')
      try {
        const res = await getUserByIdAPI(callerId)
        this.callerInfo = res.data
      } catch (error) {
        console.error('Failed to get caller info:', error)
      }
      this.callUrl = callUrl
      this.showPrivateRoomDialog = true
    })
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
    }
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
  flex-grow: 1;
  width: calc(100% - 322px);
  height: 100vh;
  box-shadow: rgba(0, 0, 0, 0.14) 0px 2px 8px 0px;
}
</style>
