<template>
  <aside class="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen shrink-0 border-r border-slate-800 shadow-xl justify-between">
    
    <div class="flex flex-col overflow-hidden">
      <div class="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/40 shrink-0">
        <div class="flex items-center space-x-3">
          <div class="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-lg shadow-md shadow-blue-500/20 font-black">
            📦
          </div>
          <div>
            <h2 class="text-sm font-bold text-white tracking-wider uppercase leading-none">INVENTARIO PRO</h2>
            <span class="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1 block">Panel de Control</span>
          </div>
        </div>
      </div>

      <nav class="p-4 space-y-1.5 flex-1 overflow-y-auto">
        <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 mb-2">Módulos</p>
        
        <router-link to="/dashboard" 
          class="flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition duration-150"
          :class="$route.path === '/dashboard' ? 'bg-slate-800 text-white font-semibold border-l-4 border-l-blue-500 rounded-l-none' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'">
          <span class="mr-3 text-base">🏠</span> Dashboard
        </router-link>

        <router-link to="/productos" 
          class="flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition duration-150"
          :class="$route.path === '/productos' ? 'bg-slate-800 text-white font-semibold border-l-4 border-l-blue-500 rounded-l-none' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'">
          <span class="mr-3 text-base">📦</span> Productos
        </router-link>

        <router-link to="/proveedores" 
          class="flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition duration-150"
          :class="$route.path === '/proveedores' ? 'bg-slate-800 text-white font-semibold border-l-4 border-l-blue-500 rounded-l-none' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'">
          <span class="mr-3 text-base">🏭</span> Proveedores
        </router-link>

        <router-link to="/clientes" 
          class="flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition duration-150"
          :class="$route.path === '/clientes' ? 'bg-slate-800 text-white font-semibold border-l-4 border-l-blue-500 rounded-l-none' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'">
          <span class="mr-3 text-base">👥</span> Clientes
        </router-link>

        <router-link to="/movimientos" 
          class="flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition duration-150"
          :class="$route.path === '/movimientos' ? 'bg-slate-800 text-white font-semibold border-l-4 border-l-blue-500 rounded-l-none' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'">
          <span class="mr-3 text-base">📊</span> Movimientos
        </router-link>

        <router-link to="/ventas" 
          class="flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition duration-150"
          :class="$route.path === '/ventas' ? 'bg-slate-800 text-white font-semibold border-l-4 border-l-blue-500 rounded-l-none' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'">
          <span class="mr-3 text-base">🛒</span> Ventas
        </router-link>

        <router-link to="/compras" 
          class="flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition duration-150"
          :class="$route.path === '/compras' ? 'bg-slate-800 text-white font-semibold border-l-4 border-l-blue-500 rounded-l-none' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'">
          <span class="mr-3 text-base">🚚</span> Compras
        </router-link>

        <router-link to="/reportes" 
          class="flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition duration-150"
          :class="$route.path === '/reportes' ? 'bg-slate-800 text-white font-semibold border-l-4 border-l-blue-500 rounded-l-none' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'">
          <span class="mr-3 text-base">📈</span> Reportes Core
        </router-link>
      </nav>
    </div>

    <div class="p-4 border-t border-slate-800 bg-slate-950/20 space-y-3 shrink-0">
      
      <button @click="cerrarSesion" class="w-full flex items-center space-x-3 px-4 py-2 rounded-xl text-sm font-medium transition duration-200 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300">
        <span class="text-base">🚪</span>
        <span>Cerrar Sesión</span>
      </button>

      <div class="flex items-center space-x-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
        <div class="h-9 w-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm uppercase border border-blue-500/20 shrink-0">
          {{ inicialUsuario }}
        </div>
        <div class="overflow-hidden">
          <p class="text-xs font-bold text-white truncate uppercase tracking-wide leading-tight">{{ nombreUsuario }}</p>
          <span class="text-[10px] text-slate-500 font-medium block mt-0.5">Sesión Activa</span>
        </div>
      </div>

    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '../composables/useToast' // INYECTADO: Sistema de Toasts

const router = useRouter()
const { showToast } = useToast() // INYECTADO: Instancia de Toasts
const nombreUsuario = ref('Admin Tienda') 

const inicialUsuario = computed(() => {
  return nombreUsuario.value ? nombreUsuario.value.charAt(0).toUpperCase() : 'A'
})

const cargarUsuarioSesion = () => {
  const usuarioGuardado = localStorage.getItem('usuario') || localStorage.getItem('username') || localStorage.getItem('nombre')
  if (usuarioGuardado) {
    nombreUsuario.value = usuarioGuardado
  }
}

// CORREGIDO: Redirección inmediata, limpieza total de variables y Toast de despedida
const cerrarSesion = () => {
  if (confirm("¿Deseas salir del sistema de inventario?")) {
    // 1. Limpieza fulminante de credenciales en disco duro
    localStorage.clear()
    
    // 2. Lanzamos mensaje de éxito en la esquina superior
    showToast("Sesión cerrada correctamente. ¡Hasta luego!", "success")
    
    // 3. LA BOMBA ATÓMICA: Forzamos al navegador a destruir la memoria JS y recargar la ruta raíz
    // Le damos 800 milisegundos para que tu papá alcance a leer el Toast verde antes del salto
    setTimeout(() => {
      window.location.href = '/' // O la ruta exacta donde viva tu Login
    }, 800)
  }
}

onMounted(() => {
  cargarUsuarioSesion()
})
</script>