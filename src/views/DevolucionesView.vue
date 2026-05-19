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
            <h1 class="text-xl lg:text-2xl font-semibold text-slate-800">Devoluciones</h1>
          </div>
        </div>

        <div class="relative w-full lg:w-80">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">#</span>
          <input
            type="text"
            v-model="busqueda"
            placeholder="Buscar factura o cliente..."
            class="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
          >
        </div>
      </header>

      <main class="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-8">
        <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-6">
          <section class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="p-4 lg:p-5 border-b border-gray-200 bg-slate-50 flex justify-between items-center">
              <div>
                <h2 class="text-sm lg:text-base font-bold text-slate-800">Facturas disponibles</h2>
                <p class="text-[11px] text-gray-500 mt-0.5">Selecciona la venta reclamada por el cliente.</p>
              </div>
              <span class="text-[10px] lg:text-xs bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-semibold">{{ ventasFiltradas.length }} registros</span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse min-w-[760px]">
                <thead>
                  <tr class="bg-gray-50 text-gray-500 text-[10px] lg:text-xs uppercase tracking-wider border-b border-gray-200">
                    <th class="px-4 py-3 font-medium">Factura</th>
                    <th class="px-4 py-3 font-medium">Fecha</th>
                    <th class="px-4 py-3 font-medium">Cliente</th>
                    <th class="px-4 py-3 font-medium text-center">Items</th>
                    <th class="px-4 py-3 font-medium text-right">Total</th>
                    <th class="px-4 py-3 font-medium text-center">Accion</th>
                  </tr>
                </thead>
                <tbody class="text-xs lg:text-sm text-gray-700 divide-y divide-gray-200">
                  <tr
                    v-for="ventaItem in ventasFiltradas"
                    :key="ventaItem.id"
                    class="hover:bg-gray-50 transition"
                    :class="ventaSeleccionada?.id === ventaItem.id ? 'bg-blue-50/70' : ''"
                  >
                    <td class="px-4 py-3 font-mono font-bold text-slate-700">#{{ ventaItem.id }}</td>
                    <td class="px-4 py-3 text-gray-500 whitespace-nowrap">{{ formatearFecha(ventaItem.fecha) }}</td>
                    <td class="px-4 py-3">
                      <p class="font-semibold text-slate-900">{{ nombreCliente(ventaItem) }}</p>
                      <p class="text-[10px] text-gray-400">{{ ventaItem.es_credito ? 'Credito' : 'Contado' }} | {{ ventaItem.metodo_pago || 'Sin metodo' }}</p>
                    </td>
                    <td class="px-4 py-3 text-center font-bold text-slate-700">{{ ventaItem.detalles?.length || 0 }}</td>
                    <td class="px-4 py-3 text-right font-black text-slate-900">${{ numero(ventaItem.total_venta).toLocaleString() }}</td>
                    <td class="px-4 py-3 text-center">
                      <button
                        @click="seleccionarVenta(ventaItem)"
                        class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition"
                      >
                        Devolver
                      </button>
                    </td>
                  </tr>
                  <tr v-if="ventasFiltradas.length === 0">
                    <td colspan="6" class="px-6 py-10 text-center text-gray-500">No se encontraron facturas para devolver.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <aside class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-fit xl:sticky xl:top-6">
            <div class="p-4 lg:p-5 border-b border-gray-200 bg-slate-50">
              <h2 class="text-sm lg:text-base font-bold text-slate-800">Aplicar devolucion</h2>
              <p class="text-[11px] text-gray-500 mt-0.5">{{ ventaSeleccionada ? `Factura #${ventaSeleccionada.id}` : 'Selecciona una factura para iniciar.' }}</p>
            </div>

            <div v-if="!ventaSeleccionada" class="p-8 text-center text-sm text-gray-400">
              No hay factura seleccionada.
            </div>

            <div v-else class="p-4 lg:p-5 space-y-5">
              <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div class="flex justify-between gap-3 text-xs">
                  <span class="text-gray-500">Cliente</span>
                  <span class="font-bold text-slate-800 text-right">{{ nombreCliente(ventaSeleccionada) }}</span>
                </div>
                <div class="flex justify-between gap-3 text-xs mt-2">
                  <span class="text-gray-500">Total factura</span>
                  <span class="font-black text-slate-900">${{ numero(ventaSeleccionada.total_venta).toLocaleString() }}</span>
                </div>
              </div>

              <div class="space-y-3">
                <div v-for="item in itemsDevolucion" :key="item.detalle_id" class="border border-gray-200 rounded-xl p-3">
                  <div class="flex justify-between gap-3 mb-3">
                    <div class="min-w-0">
                      <p class="text-sm font-bold text-slate-900 truncate">{{ item.nombre_producto }}</p>
                      <p class="text-[11px] text-gray-500">Vendido: {{ item.cantidad_vendida }} | Unit: ${{ item.precio_unitario.toLocaleString() }}</p>
                    </div>
                    <p class="text-sm font-black text-slate-800 shrink-0">${{ (item.cantidad_devolver * item.precio_unitario).toLocaleString() }}</p>
                  </div>
                  <div class="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
                    <input
                      type="range"
                      min="0"
                      :max="item.cantidad_vendida"
                      v-model.number="item.cantidad_devolver"
                      class="w-full accent-slate-900"
                    >
                    <input
                      type="number"
                      min="0"
                      :max="item.cantidad_vendida"
                      v-model.number="item.cantidad_devolver"
                      @input="normalizarCantidad(item)"
                      class="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-center text-xs font-bold text-slate-800"
                    >
                    <span class="text-[11px] text-gray-500">unid.</span>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Motivo del reclamo *</label>
                <textarea
                  v-model="motivo"
                  rows="3"
                  placeholder="Ej. Producto defectuoso, talla incorrecta, cambio solicitado..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm resize-none"
                ></textarea>
              </div>

              <div class="border-t border-gray-200 pt-4">
                <div class="flex justify-between items-center mb-4">
                  <span class="text-gray-500 font-medium text-sm">Total a devolver:</span>
                  <span class="text-2xl font-black text-slate-900">${{ totalDevolucion.toLocaleString() }}</span>
                </div>
                <button
                  @click="procesarDevolucion"
                  :disabled="!puedeProcesar || isProcessing"
                  class="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-lg flex justify-center items-center text-sm"
                >
                  <svg v-if="isProcessing" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isProcessing ? 'Procesando...' : 'Registrar devolucion' }}
                </button>
              </div>
            </div>
          </aside>
        </div>

        <section class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
          <div class="p-4 lg:p-5 border-b border-gray-200 bg-slate-50 flex justify-between items-center">
            <h2 class="text-sm lg:text-base font-bold text-slate-800">Historial de devoluciones</h2>
            <button @click="cargarDevoluciones" class="text-xs font-bold text-slate-600 hover:text-slate-900">Actualizar</button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr class="bg-gray-50 text-gray-500 text-[10px] lg:text-xs uppercase tracking-wider border-b border-gray-200">
                  <th class="px-4 py-3 font-medium">ID</th>
                  <th class="px-4 py-3 font-medium">Factura</th>
                  <th class="px-4 py-3 font-medium">Fecha</th>
                  <th class="px-4 py-3 font-medium">Motivo</th>
                  <th class="px-4 py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody class="text-xs lg:text-sm text-gray-700 divide-y divide-gray-200">
                <tr v-for="dev in devoluciones" :key="dev.id" class="hover:bg-gray-50">
                  <td class="px-4 py-3 font-mono font-bold text-slate-600">#{{ dev.id }}</td>
                  <td class="px-4 py-3 font-semibold text-slate-800">#{{ dev.venta_id || dev.factura_id }}</td>
                  <td class="px-4 py-3 text-gray-500">{{ formatearFecha(dev.fecha || dev.created_at) }}</td>
                  <td class="px-4 py-3 text-gray-600 max-w-md truncate">{{ dev.motivo || dev.observacion || 'Sin motivo registrado' }}</td>
                  <td class="px-4 py-3 text-right font-black text-slate-900">${{ numero(dev.total_devolucion || dev.total || dev.monto).toLocaleString() }}</td>
                </tr>
                <tr v-if="devoluciones.length === 0">
                  <td colspan="5" class="px-6 py-8 text-center text-gray-500">Aun no hay devoluciones registradas.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api/axios'
import Sidebar from '../components/Sidebar.vue'
import { useToast } from '../composables/useToast'

const route = useRoute()
const { showToast } = useToast()

const isSidebarOpen = ref(false)
const ventas = ref([])
const productos = ref([])
const devoluciones = ref([])
const busqueda = ref('')
const ventaSeleccionada = ref(null)
const itemsDevolucion = ref([])
const motivo = ref('')
const isProcessing = ref(false)

const numero = (valor) => Number.parseFloat(valor || 0) || 0

const ventasFiltradas = computed(() => {
  const termino = busqueda.value.toLowerCase().trim()
  if (!termino) return ventas.value

  return ventas.value.filter((ventaItem) => {
    const cliente = nombreCliente(ventaItem).toLowerCase()
    return String(ventaItem.id).includes(termino) || cliente.includes(termino)
  })
})

const totalDevolucion = computed(() =>
  itemsDevolucion.value.reduce((total, item) => total + (item.cantidad_devolver * item.precio_unitario), 0)
)

const puedeProcesar = computed(() =>
  ventaSeleccionada.value &&
  totalDevolucion.value > 0 &&
  motivo.value.trim().length >= 3
)

const nombreCliente = (ventaItem) => {
  if (!ventaItem) return '-'
  if (ventaItem.cliente) return `${ventaItem.cliente.nombre || ''} ${ventaItem.cliente.apellido || ''}`.trim()
  return `Cliente #${ventaItem.cliente_id}`
}

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '-'
  return new Date(fechaStr).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
}

const getNombreProducto = (item) => {
  if (item.nombre_producto) return item.nombre_producto
  const prod = productos.value.find(p => Number(p.id) === Number(item.producto_id))
  return prod ? prod.nombre : `Producto #${item.producto_id}`
}

const normalizarCantidad = (item) => {
  if (!item.cantidad_devolver || item.cantidad_devolver < 0) item.cantidad_devolver = 0
  if (item.cantidad_devolver > item.cantidad_vendida) item.cantidad_devolver = item.cantidad_vendida
}

const seleccionarVenta = (ventaItem) => {
  ventaSeleccionada.value = ventaItem
  motivo.value = ''
  itemsDevolucion.value = (ventaItem.detalles || []).map(item => ({
    detalle_id: item.id,
    producto_id: item.producto_id,
    nombre_producto: getNombreProducto(item),
    cantidad_vendida: Number.parseInt(item.cantidad || 0),
    cantidad_devolver: 0,
    precio_unitario: numero(item.precio_unitario)
  }))
}

const cargarVentas = async () => {
  const res = await api.get('/ventas/')
  ventas.value = Array.isArray(res.data) ? res.data : []
}

const cargarProductos = async () => {
  const res = await api.get('/productos/')
  productos.value = Array.isArray(res.data) ? res.data : []
}

const cargarDevoluciones = async () => {
  try {
    const res = await api.get('/devoluciones/')
    devoluciones.value = Array.isArray(res.data) ? res.data : []
  } catch (error) {
    devoluciones.value = []
  }
}

const seleccionarVentaDesdeQuery = () => {
  const ventaId = route.query.venta_id
  if (!ventaId) return
  const ventaEncontrada = ventas.value.find(v => Number(v.id) === Number(ventaId))
  if (ventaEncontrada) {
    seleccionarVenta(ventaEncontrada)
    busqueda.value = String(ventaEncontrada.id)
  }
}

const procesarDevolucion = async () => {
  if (!puedeProcesar.value) {
    showToast('Selecciona cantidades y registra el motivo del reclamo.', 'warning')
    return
  }

  isProcessing.value = true
  try {
    const payload = {
      venta_id: ventaSeleccionada.value.id,
      motivo: motivo.value.trim(),
      total_devolucion: totalDevolucion.value,
      items: itemsDevolucion.value
        .filter(item => item.cantidad_devolver > 0)
        .map(item => ({
          detalle_venta_id: item.detalle_id,
          producto_id: item.producto_id,
          cantidad: Number.parseInt(item.cantidad_devolver),
          precio_unitario: item.precio_unitario
        }))
    }

    await api.post('/devoluciones/', payload)

    showToast(`Devolucion por $${totalDevolucion.value.toLocaleString()} registrada correctamente.`, 'success')
    ventaSeleccionada.value = null
    itemsDevolucion.value = []
    motivo.value = ''
    await Promise.all([cargarVentas(), cargarProductos(), cargarDevoluciones()])
  } catch (error) {
    showToast(error.response?.data?.detail || 'No se pudo registrar la devolucion en el servidor.', 'error')
  } finally {
    isProcessing.value = false
  }
}

onMounted(async () => {
  try {
    await Promise.all([cargarVentas(), cargarProductos(), cargarDevoluciones()])
    seleccionarVentaDesdeQuery()
  } catch (error) {
    showToast('Error cargando los datos de devoluciones.', 'error')
  }
})
</script>
