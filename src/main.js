import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import App from './App.vue'
import { createPinia } from 'pinia';
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import '@/assets/base.css'

import router from './router'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
  },
})
const pinia = createPinia();

const app = createApp(App)
app.use(vuetify)
app.use(router)
app.use(pinia)
app.mount('#app')
