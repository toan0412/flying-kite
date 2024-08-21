<template>
  <div v-if="isAuth" class="main">
    <div class="sidebar-wrapper">
      <Sidebar @select-room="handleRoomSelected" />
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
import Sidebar from '@/components/layout/sidebar/Sidebar.vue';
import LoginView from './views/Login/LoginView.vue';
import HomeView from './views/Home/HomeView.vue';
import IntroductionView from './views/Introduction/IntroductionView.vue';

export default {
  data() {
    return {
      isAuth: false,
      isIntroduction: true,
    };
  },

  components: {
    Sidebar,
    LoginView,
    HomeView,
    IntroductionView
  },

  created() {
    const accessToken = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');
    if (accessToken && userId) {
      this.isAuth = true;
    }
  },

  methods: {
    handleAuthStatus(isAuth) {
      this.isAuth = isAuth;
    },
    handleRoomSelected() {
      this.isIntroduction = false;
    },
  },
};
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
