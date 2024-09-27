import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import App from './App.vue'
import { createPinia } from 'pinia'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import '@/assets/base.css'
import { vuetifyThemes } from '@/assets/colorsSet'
import router from './router'
import vue3GoogleLogin from 'vue3-google-login'

function getThemeConfig() {
  return localStorage.getItem('app_theme') || 'default'
}

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: getThemeConfig() || 'default',
    themes: vuetifyThemes,
    variations: {
      colors: ['primary', 'secondary'],
      lighten: 2,
      darken: 2
    }
  },
  icons: {
    defaultSet: 'mdi'
  }
})

const pinia = createPinia()

const app = createApp(App)
app.use(vue3GoogleLogin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  scope: 'email profile'
  // prompt: 'select_account'
})
app.use(vuetify)
app.use(router)
app.use(pinia)
app.mount('#app')
