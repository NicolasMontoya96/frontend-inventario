import axios from 'axios'

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

export default api