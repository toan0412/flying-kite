import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home/HomeView.vue'
import LoginView from '../views/Login/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/',
      name: 'home',
      component: HomeView
    }
  ]
})

//Check auth before routing
router.beforeEach((to, from, next) => {
  const isAuth = localStorage.getItem('accessToken')

  if (to.name === 'login' && isAuth) {
    next({ path: '/', replace: true })
  } else if (to.name !== 'login' && !isAuth) {
    next({ path: '/login', replace: true })
  } else {
    next()
  }
})

export default router
