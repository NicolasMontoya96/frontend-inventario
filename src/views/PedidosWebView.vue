<template>
  <div class="flex h-screen bg-gray-50 font-sans">

    <Sidebar :isOpen="isSidebarOpen" @close="isSidebarOpen = false" />

    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="bg-white border-b border-gray-200 flex flex-col lg:flex-row lg:items-center justify-between px-4 lg:px-8 py-3 lg:py-0 lg:h-16 shadow-sm shrink-0 gap-3 lg:gap-0 z-10">
        <div class="flex items-center justify-between w-full lg:w-auto">
          <div class="flex items-center space-x-3">
            <button @click="isSidebarOpen = true" class="lg:hidden text-slate-500 hover:text-slate-800 p-1 focus:outline-none">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <h1 class="text-xl lg:text-2xl font-semibold text-slate-800">Pedidos Web</h1>
          </div>
          <button @click="cargarPedidos" class="lg:hidden text-slate-500 hover:text-slate-800 p-1" title="Actualizar">
            🔄
          </button>
        </div>

        <nav class="flex space-x-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
          <button v-for="opcion in filtrosEstado" :key="opcion.valor"
                  @click="filtroActual = opcion.valor"
                  class="px-4 py-2 text-sm font-medium rounded-lg transition whitespace-nowrap"
                  :class="filtroActual === opcion.valor ? 'bg-slate-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'">
            {{ opcion.etiqueta }}
          </button>
        </nav>
      </header>

      <div class="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-8">
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="p-4 lg:p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 class="text-base lg:text-lg font-bold text-slate-800">
              {{ pedidosFiltrados.length }} pedido{{ pedidosFiltrados.length === 1 ? '' : 's' }}
            </h2>
            <button @click="cargarPedidos" class="hidden lg:flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 font-medium">
              🔄 Actualizar
            </button>
          </div>

          <div v-if="cargando" class="p-12 text-center text-gray-500">Cargando pedidos…</div>

          <div v-else-if="errorCarga" class="p-12 text-center text-red-500">
            No se pudieron cargar los pedidos. {{ errorCarga }}
          </div>

          <template v-else>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse min-w-[760px]">
                <thead>
                  <tr class="bg-gray-50 text-gray-500 text-[10px] lg:text-xs uppercase tracking-wider border-b border-gray-200">
                    <th class="px-4 py-3 font-medium">Referencia</th>
                    <th class="px-4 py-3 font-medium">Fecha</th>
                    <th class="px-4 py-3 font-medium">Cliente</th>
                    <th class="px-4 py-3 font-medium">Estado</th>
                    <th class="px-4 py-3 font-medium text-right">Total</th>
                    <th class="px-4 py-3 font-medium text-center">Detalle</th>
                  </tr>
                </thead>
                <tbody class="text-xs lg:text-sm text-gray-700 divide-y divide-gray-200">
                  <tr v-for="pedido in pedidosFiltrados" :key="pedido.id" class="hover:bg-gray-50">
                    <td class="px-4 py-3 font-mono text-slate-600">
                      {{ pedido.referencia_pago.slice(0, 8) }}…
                    </td>
                    <td class="px-4 py-3 text-gray-500">{{ formatearFecha(pedido.fecha) }}</td>
                    <td class="px-4 py-3">
                      <span class="font-semibold text-slate-900 block">{{ pedido.nombre_cliente }}</span>
                      <span class="text-gray-500 text-[11px]">{{ pedido.telefono_cliente }}</span>
                    </td>
                    <td class="px-4 py-3">
                      <span :class="claseEstado(pedido.estado)" class="px-2 py-1 rounded text-[10px] font-bold uppercase">
                        {{ etiquetaEstado(pedido.estado) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right font-black text-slate-900">
                      ${{ parseFloat(pedido.total_pedido).toLocaleString() }}
                    </td>
                    <td class="px-4 py-3 text-center">
                      <button @click="abrirDetalle(pedido)" class="text-blue-600 hover:text-blue-800 p-1.5 bg-blue-50 rounded-lg transition text-sm border border-blue-100">
                        👁️
                      </button>
                    </td>
                  </tr>
                  <tr v-if="pedidosFiltrados.length === 0">
                    <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                      No hay pedidos{{ filtroActual ? ` en estado "${etiquetaEstado(filtroActual)}"` : '' }}.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div v-if="pedidoSeleccionado" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div class="px-4 lg:px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h3 class="text-base lg:text-lg font-bold text-slate-800">Pedido #{{ pedidoSeleccionado.id }}</h3>
            <p class="text-[10px] lg:text-xs text-gray-500 font-mono">{{ pedidoSeleccionado.referencia_pago }}</p>
          </div>
          <button @click="pedidoSeleccionado = null" class="text-gray-400 hover:text-red-500 transition text-2xl font-semibold leading-none">&times;</button>
        </div>

        <div class="p-4 lg:p-6 overflow-x-auto">
          <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Cliente</p>
              <p class="text-slate-800 font-medium">{{ pedidoSeleccionado.nombre_cliente }}</p>
              <p class="text-gray-500">{{ pedidoSeleccionado.telefono_cliente }}</p>
              <p class="text-gray-500" v-if="pedidoSeleccionado.email_cliente">{{ pedidoSeleccionado.email_cliente }}</p>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Envío</p>
              <p class="text-slate-800">{{ pedidoSeleccionado.direccion_envio }}</p>
            </div>
          </div>

          <table class="w-full text-left border-collapse text-xs lg:text-sm mb-4 min-w-[400px]">
            <thead>
              <tr class="bg-slate-100 text-slate-600 text-[10px] lg:text-xs uppercase border-b border-slate-200">
                <th class="px-3 py-2 font-medium">Producto</th>
                <th class="px-3 py-2 font-medium text-center">Cant.</th>
                <th class="px-3 py-2 font-medium text-right">Precio</th>
                <th class="px-3 py-2 font-medium text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in pedidoSeleccionado.detalles" :key="item.id">
                <td class="px-3 py-2 font-semibold text-slate-800">{{ item.nombre_producto }}</td>
                <td class="px-3 py-2 text-center text-slate-600">{{ item.cantidad }}</td>
                <td class="px-3 py-2 text-right text-slate-600">${{ parseFloat(item.precio_unitario).toLocaleString() }}</td>
                <td class="px-3 py-2 text-right font-bold text-slate-900">${{ (item.cantidad * parseFloat(item.precio_unitario)).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>

          <div class="flex justify-between items-center pt-4 border-t border-gray-200">
            <span :class="claseEstado(pedidoSeleccionado.estado)" class="px-2 py-1 rounded text-[10px] font-bold uppercase">
              {{ etiquetaEstado(pedidoSeleccionado.estado) }}
            </span>
            <div class="text-right">
              <span class="text-sm text-gray-600 mr-3">Total:</span>
              <span class="text-xl lg:text-2xl font-black text-slate-900">${{ parseFloat(pedidoSeleccionado.total_pedido).toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../api/axios'
import Sidebar from '../components/Sidebar.vue'

const isSidebarOpen = ref(false)
const pedidos = ref([])
const cargando = ref(true)
const errorCarga = ref('')
const filtroActual = ref('')
const pedidoSeleccionado = ref(null)

const filtrosEstado = [
  { valor: '', etiqueta: 'Todos' },
  { valor: 'pendiente', etiqueta: 'Pendientes' },
  { valor: 'pagado', etiqueta: 'Pagados' },
  { valor: 'fallido', etiqueta: 'Fallidos' },
  { valor: 'expirado', etiqueta: 'Expirados' },
]

const pedidosFiltrados = computed(() => {
  if (!filtroActual.value) return pedidos.value
  return pedidos.value.filter((p) => p.estado === filtroActual.value)
})

const etiquetaEstado = (estado) => {
  const mapa = { pendiente: 'Pendiente', pagado: 'Pagado', fallido: 'Fallido', expirado: 'Expirado' }
  return mapa[estado] || estado
}

const claseEstado = (estado) => {
  const mapa = {
    pendiente: 'bg-amber-100 text-amber-800',
    pagado: 'bg-green-100 text-green-800',
    fallido: 'bg-red-100 text-red-800',
    expirado: 'bg-gray-200 text-gray-600',
  }
  return mapa[estado] || 'bg-gray-100 text-gray-600'
}

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '-'
  return new Date(fechaStr).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
}

const abrirDetalle = (pedido) => {
  pedidoSeleccionado.value = pedido
}

const cargarPedidos = async () => {
  cargando.value = true
  errorCarga.value = ''
  try {
    const res = await api.get('/pedidos-web/')
    pedidos.value = res.data
  } catch (error) {
    console.error('Error cargando pedidos web:', error)
    errorCarga.value = error.response?.data?.detail || 'Error de conexión con el servidor.'
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarPedidos()
})
</script>