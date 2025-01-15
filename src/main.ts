import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import 'element-plus/theme-chalk/dark/css-vars.css'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createI18nInstance } from './locale';

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
const i18n = createI18nInstance();
createApp(App).use(pinia).use(i18n).mount('#zihao_il')
