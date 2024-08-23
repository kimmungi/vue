import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { auth, db, storage } from './firebase'  // storage를 import에 추가합니다.

const app = createApp(App)

// Firebase 서비스를 Vue 인스턴스에 추가
app.config.globalProperties.$auth = auth
app.config.globalProperties.$db = db
app.config.globalProperties.$storage = storage  // 이 줄을 추가합니다.

app.use(router).mount('#app')