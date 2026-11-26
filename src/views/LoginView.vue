<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white p-10 rounded-xl shadow-sm border border-gray-200">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Sistema Inventario</h1>
        <p class="text-gray-500 mt-2 text-sm">Ingresa tus credenciales para continuar</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 mb-1.5">Usuario</label>
          <input id="username" type="text" v-model="credentials.username" :disabled="isSubmitting" required placeholder="Ej: admin" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition duration-200 disabled:opacity-50" />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
          <input id="password" type="password" v-model="credentials.password" :disabled="isSubmitting" required placeholder="••••••••" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition duration-200 disabled:opacity-50" />
        </div>
        <div class="pt-4">
          <button type="submit" :disabled="isSubmitting" class="w-full bg-slate-900 text-white font-medium py-3 px-6 rounded-lg hover:bg-slate-800 transition duration-200 flex items-center justify-center disabled:bg-slate-700 disabled:cursor-not-allowed">
            <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isSubmitting ? 'Verificando...' : 'Iniciar Sesión' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../api/axios' // MODIFICADO: Ahora importamos nuestro cliente centralizado en vez de axios crudo
import { useRouter } from 'vue-router' 
import { useToast } from '../composables/useToast' 

const router = useRouter() 
const { showToast } = useToast() 

const credentials = ref({ username: '', password: '' })
const isSubmitting = ref(false)

const handleLogin = async () => {
  isSubmitting.value = true 
  try {
    const formData = new URLSearchParams()
    formData.append('username', credentials.value.username)
    formData.append('password', credentials.value.password)

    // MODIFICADO: Usamos 'api' directamente y ya sabe a qué URL pegarle automáticamente
    const respuesta = await api.post('/autenticacion/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })

    const token = respuesta.data.access_token
    localStorage.setItem('token', token)
    localStorage.setItem('usuario', credentials.value.username)
    
    showToast(`¡Bienvenido de nuevo, ${credentials.value.username}!`, "success")
    router.push('/dashboard')

  } catch (error) {
    console.error("Error al iniciar sesión:", error)
    // Antes esto siempre decía "usuario o contraseña incorrectos", así el
    // problema real fuera que el servidor no respondió o no hay red — lo que
    // hace imposible distinguir un typo de una caída del backend. Usamos el
    // mensaje real que manda el backend cuando lo hay (401: credenciales
    // malas) y uno aparte cuando no hay respuesta del todo.
    const mensaje = error.response?.data?.detail
      || (error.request ? 'No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.' : 'Ocurrió un error inesperado. Intenta de nuevo.')
    showToast(mensaje, "error")
  } finally {
    isSubmitting.value = false 
  }
}
</script>