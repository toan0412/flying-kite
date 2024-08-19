<template>
  <div v-if="isAuth" class="main">
    <div class="sidebar-wrapper">
      <Sidebar />
    </div>
    <div class="main-wrapper">
      <router-view />
    </div>
  </div>
  <div v-else>
    <Login @is-auth="handleAuthStatus" />
  </div>
</template>

<script>
import Sidebar from '@/components/layout/sidebar/Sidebar.vue'
import Login from './views/Login/LoginView.vue'
  
export default {
  data() {
    return {
      isAuth: false,
    };
  },

  components: {
    Sidebar,
    Login,
  },

  created() {
    const accessToken = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId')
    if (accessToken && userId) {
      this.isAuth = true;
    }
  },

  methods: {
    handleAuthStatus(isAuth) {
      this.isAuth = isAuth;
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
