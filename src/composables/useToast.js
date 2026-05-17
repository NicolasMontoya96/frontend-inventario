import { ref } from 'vue'

// Estado global de los toasts (se comparte entre todas las vistas)
const toasts = ref([])

export function useToast() {
  const showToast = (message, type = 'success', duration = 4000) => {
    const id = Date.now()
    
    // Agrega el nuevo toast a la pila
    toasts.value.push({ id, message, type })
    
    // Lo elimina automáticamente cuando se cumple el tiempo
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }

  const removeToast = (id) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return {
    toasts,
    showToast,
    removeToast
  }
}