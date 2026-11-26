import axios from 'axios'
import router from '../router'
import { useToast } from '../composables/useToast'

const api = axios.create({
  // Jalamos la variable del archivo .env, si no existe por algún motivo, usa localhost por defecto
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
})

// INTERCEPTOR: Se ejecuta automáticamente ANTES de que cualquier petición salga al backend
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      // Inyección automática del Bearer Token estándar de JWT
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// INTERCEPTOR DE RESPUESTA: antes, si el token expiraba mientras alguien
// trabajaba, cada petición fallaba con un toast de error genérico y la
// persona quedaba "atascada" sin saber que tenía que volver a loguearse.
// Esto detecta el 401 una sola vez, en un solo lugar, y manda de vuelta
// al login con un aviso claro — en vez de repetir ese manejo en cada vista.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const esNoAutorizado = error.response?.status === 401
    const yaEstaEnLogin = router.currentRoute.value.name === 'login'

    if (esNoAutorizado && !yaEstaEnLogin) {
      localStorage.removeItem('token')
      const { showToast } = useToast()
      showToast('Tu sesión expiró, vuelve a iniciar sesión.', 'error')
      router.push({ name: 'login' })
    }

    return Promise.reject(error)
  }
)

export default api