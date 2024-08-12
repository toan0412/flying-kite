<template>
  <!--
  <div class="sidebar-wrapper">
    <Sidebar />
  </div>
  <div class="main-wrapper">
    <router-view />
  </div>
  -->
  <Login />
</template>

<script>
import Sidebar from '@/components/layout/sidebar/Sidebar.vue'
import Login from './views/Login/LoginView.vue'
export default {
  components: {
    Sidebar,
    Login
  }
}

</script>

<style lang="scss">
#app {
  display: flex;
  border-top: 1px solid var(--border-color);
}

.main-wrapper {
  z-index: 1;
  width: calc(100% - 322px);
  min-height: 100vh;
  box-shadow: rgba(0, 0, 0, 0.14) 0px 2px 8px 0px;
}
</style>
