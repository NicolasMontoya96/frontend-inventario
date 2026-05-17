import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router' // <-- Importamos nuestro mapa de rutas

const app = createApp(App)

app.use(router) // <-- Le decimos a Vue que use el mapa
app.mount('#app')