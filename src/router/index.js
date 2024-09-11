import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home/HomeView.vue'
import LoginView from '../views/Login/LoginView.vue'
import CallView from '../views/Call/CallView.vue'
import Sidebar from '@/components/layout/sidebar/Sidebar.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/',
    name: 'home',
    components: {
      default: HomeView,
      sidebar: Sidebar
    },
    meta: { requiresAuth: true }
  },
  {
    path: '/call',
    name: 'call',
    component: CallView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Check auth before routing
router.beforeEach((to, from, next) => {
  const isAuth = localStorage.getItem('accessToken')

  // Check if route requires authentication
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isAuth) {
      next({ path: '/login', replace: true })
    } else {
      next()
    }
  } else if (to.name === 'login' && isAuth) {
    next({ path: '/', replace: true })
  } else {
    next()
  }
})

export default router
