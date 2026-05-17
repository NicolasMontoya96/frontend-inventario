<template>
  <div class="flex h-screen bg-gray-50 font-sans">
    
    <Sidebar :isOpen="isSidebarOpen" @close="isSidebarOpen = false" />

    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shadow-sm shrink-0 z-10">
        <div class="flex items-center space-x-3 overflow-hidden">
          <button @click="isSidebarOpen = true" class="lg:hidden text-slate-500 hover:text-slate-800 p-1 focus:outline-none shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <h1 class="text-lg lg:text-2xl font-bold text-slate-800 truncate">Centro de Reportes</h1>
        </div>
        <div class="flex items-center shrink-0 ml-2">
          <span class="text-xs lg:text-sm font-medium text-slate-600 mr-3 hidden sm:inline-block truncate max-w-[120px] lg:max-w-none">{{ nombreUsuario }}</span>
          <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0 shadow-sm">{{ inicialUsuario }}</div>
        </div>
      </header>

      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 lg:p-8">
        <p class="text-xs lg:text-sm text-slate-600 mb-6 lg:mb-8 font-medium">
          Genera, audita y descarga balances en tiempo real para la toma de decisiones estratégicas de la tienda.
        </p>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          
          <div class="bg-white p-5 lg:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div class="h-10 w-10 lg:h-12 lg:w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl lg:text-2xl mb-3 lg:mb-4">
                📦
              </div>
              <h3 class="text-base lg:text-lg font-black text-slate-800">Valorización de Inventario</h3>
              <p class="text-[11px] lg:text-xs text-slate-600 mt-2 leading-relaxed">
                Calcula el stock físico de todos los artículos multiplicado por su precio de venta para conocer el capital activo retenido en mercancía.
              </p>
            </div>
            
            <div class="mt-5 lg:mt-6 pt-4 border-t border-gray-100 flex space-x-2">
              <button @click="descargarInventario('pdf')" :disabled="descargando.inventario" class="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-2 lg:px-3 rounded-xl text-[10px] lg:text-[11px] font-bold transition shadow-sm flex items-center justify-center gap-1">
                <svg v-if="descargando.inventario" class="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                📄 PDF
              </button>
              <button @click="descargarInventario('excel')" :disabled="descargando.inventario" class="flex-1 bg-green-700 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-2 lg:px-3 rounded-xl text-[10px] lg:text-[11px] font-bold transition shadow-sm flex items-center justify-center gap-1">
                <svg v-if="descargando.inventario" class="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                📊 Excel
              </button>
            </div>
          </div>

          <div class="bg-white p-5 lg:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div class="h-10 w-10 lg:h-12 lg:w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl lg:text-2xl mb-3 lg:mb-4">
                📈
              </div>
              <h3 class="text-base lg:text-lg font-black text-slate-800">Ventas por Rango</h3>
              <p class="text-[11px] lg:text-xs text-slate-600 mt-2 leading-relaxed mb-4">
                Agrupa la facturación total y los métodos de pago registrados entre los días seleccionados del calendario.
              </p>

              <div class="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-gray-150 mb-1">
                <div>
                  <label class="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Desde:</label>
                  <input type="date" v-model="fechaInicio" class="w-full text-[10px] lg:text-[11px] px-1.5 py-1 border border-gray-300 rounded-lg text-slate-700 bg-white">
                </div>
                <div>
                  <label class="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Hasta:</label>
                  <input type="date" v-model="fechaFin" class="w-full text-[10px] lg:text-[11px] px-1.5 py-1 border border-gray-300 rounded-lg text-slate-700 bg-white">
                </div>
              </div>
            </div>
            
            <div class="mt-4 pt-4 border-t border-gray-100 flex space-x-2">
              <button @click="descargarVentas('pdf')" :disabled="descargando.ventas" class="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-2 lg:px-3 rounded-xl text-[10px] lg:text-[11px] font-bold transition shadow-sm flex items-center justify-center gap-1">
                <svg v-if="descargando.ventas" class="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                📄 PDF
              </button>
              <button @click="descargarVentas('excel')" :disabled="descargando.ventas" class="flex-1 bg-green-700 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-2 lg:px-3 rounded-xl text-[10px] lg:text-[11px] font-bold transition shadow-sm flex items-center justify-center gap-1">
                <svg v-if="descargando.ventas" class="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                📊 Excel
              </button>
            </div>
          </div>

          <div class="bg-white p-5 lg:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div class="h-10 w-10 lg:h-12 lg:w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl lg:text-2xl mb-3 lg:mb-4">
                💸
              </div>
              <h3 class="text-base lg:text-lg font-black text-slate-800">Consolidado de Deudores</h3>
              <p class="text-[11px] lg:text-xs text-slate-600 mt-2 leading-relaxed">
                Extrae masivamente la lista de todos los clientes que tienen deudas activas con el negocio, ordenados automáticamente de mayor a menor saldo.
              </p>
            </div>
            
            <div class="mt-5 lg:mt-6 pt-4 border-t border-gray-100 flex space-x-2">
              <button @click="descargarDeudores('pdf')" :disabled="descargando.deudores" class="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-2 lg:px-3 rounded-xl text-[10px] lg:text-[11px] font-bold transition shadow-sm flex items-center justify-center gap-1">
                <svg v-if="descargando.deudores" class="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                📄 PDF
              </button>
              <button @click="descargarDeudores('excel')" :disabled="descargando.deudores" class="flex-1 bg-green-700 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-2 lg:px-3 rounded-xl text-[10px] lg:text-[11px] font-bold transition shadow-sm flex items-center justify-center gap-1">
                <svg v-if="descargando.deudores" class="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                📊 Excel
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue' // AÑADIDO: computed y onMounted
import api from '../api/axios' 
import Sidebar from '../components/Sidebar.vue'
import { useToast } from '../composables/useToast'

// VARIABLE PARA EL MENÚ MÓVIL
const isSidebarOpen = ref(false)

// VARIABLES DINÁMICAS PARA EL HEADER
const nombreUsuario = ref('Admin')
const inicialUsuario = computed(() => nombreUsuario.value ? nombreUsuario.value.charAt(0).toUpperCase() : 'A')

const { showToast } = useToast()

const hoy = new Date().toISOString().split('T')[0]
const fechaInicio = ref(hoy)
const fechaFin = ref(hoy)

const descargando = reactive({
  inventario: false,
  ventas: false,
  deudores: false
})

const dispararDescarga = (blob, nombreArchivo) => {
  const url = window.URL.createObjectURL(new Blob([blob]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', nombreArchivo)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

const descargarInventario = async (formato) => {
  descargando.inventario = true
  try {
    const endpoint = formato === 'excel' ? 'inventario-excel' : 'inventario-pdf'
    const ext = formato === 'excel' ? 'xlsx' : 'pdf'

    const res = await api.get(`/clientes/global/${endpoint}`, { responseType: 'blob' })
    dispararDescarga(res.data, `Valorizacion_Inventario_Global.${ext}`)
    showToast(`Inventario descargado en ${formato.toUpperCase()} correctamente.`, 'success')
  } catch (e) {
    showToast('Error al descargar el inventario. Intenta de nuevo.', 'error')
  } finally {
    descargando.inventario = false
  }
}

const descargarVentas = async (formato) => {
  descargando.ventas = true
  try {
    const endpoint = formato === 'excel' ? 'ventas-excel' : 'ventas-pdf'
    const ext = formato === 'excel' ? 'xlsx' : 'pdf'

    const res = await api.get(`/clientes/global/${endpoint}`, {
      params: { fecha_inicio: fechaInicio.value, fecha_fin: fechaFin.value },
      responseType: 'blob'
    })
    dispararDescarga(res.data, `Reporte_Ventas_${fechaInicio.value}_a_${fechaFin.value}.${ext}`)
    showToast(`Reporte de ventas descargado en ${formato.toUpperCase()} correctamente.`, 'success')
  } catch (e) {
    showToast('Error al procesar el reporte de ventas. Intenta de nuevo.', 'error')
  } finally {
    descargando.ventas = false
  }
}

const descargarDeudores = async (formato) => {
  descargando.deudores = true
  try {
    const endpoint = formato === 'excel' ? 'deudores-excel' : 'deudores-pdf'
    const ext = formato === 'excel' ? 'xlsx' : 'pdf'

    const res = await api.get(`/clientes/global/${endpoint}`, { responseType: 'blob' })
    dispararDescarga(res.data, `Consolidado_Deudores_Cartera.${ext}`)
    showToast(`Consolidado de deudores descargado en ${formato.toUpperCase()} correctamente.`, 'success')
  } catch (e) {
    showToast('Error al descargar el consolidado de deudores. Intenta de nuevo.', 'error')
  } finally {
    descargando.deudores = false
  }
}

// OBTENER NOMBRE DEL USUARIO AL CARGAR LA PANTALLA
onMounted(() => {
  const usuarioGuardado = localStorage.getItem('usuario') || localStorage.getItem('username') || localStorage.getItem('nombre')
  if (usuarioGuardado) nombreUsuario.value = usuarioGuardado
})
</script>