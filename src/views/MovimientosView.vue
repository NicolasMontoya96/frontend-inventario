<template>
  <div class="flex h-screen bg-gray-50 font-sans">
    
    <Sidebar :isOpen="isSidebarOpen" @close="isSidebarOpen = false" />

    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shadow-sm shrink-0 z-10">
        <div class="flex items-center space-x-3">
          <button @click="isSidebarOpen = true" class="lg:hidden text-slate-500 hover:text-slate-800 p-1 focus:outline-none">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <h1 class="text-xl lg:text-2xl font-semibold text-slate-800">Auditoría y Estados de Cuenta</h1>
        </div>
      </header>

      <main class="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-8 bg-gray-50">
        
        <div class="bg-white p-4 lg:p-6 rounded-xl border border-gray-200 shadow-sm mb-6 max-w-xl">
          <label class="block text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Filtrar Historial Clínico de Cuentas</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
            <input type="text" v-model="busqueda" placeholder="Buscar por nombre o apellido..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm bg-white">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-6">
          <div class="bg-white p-5 lg:p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-blue-500">
            <p class="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-wider">Total Facturado</p>
            <p class="text-2xl lg:text-3xl font-black text-slate-800 mt-1 lg:mt-2">${{ totalFacturado.toLocaleString() }}</p>
          </div>
          <div class="bg-white p-5 lg:p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-green-500">
            <p class="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-wider">Total Recaudado (Caja)</p>
            <p class="text-2xl lg:text-3xl font-black text-green-600 mt-1 lg:mt-2">${{ totalRecaudado.toLocaleString() }}</p>
          </div>
          <div class="bg-white p-5 lg:p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-red-500">
            <p class="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-wider">Saldo Pendiente (Cartera)</p>
            <p class="text-2xl lg:text-3xl font-black text-red-600 mt-1 lg:mt-2">${{ totalEnDeuda.toLocaleString() }}</p>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="p-4 lg:p-6 border-b border-gray-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h2 class="text-sm lg:text-base font-bold text-slate-800">Libro de Movimientos General</h2>
            <span class="text-[10px] lg:text-xs bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-semibold">{{ movimientosFiltrados.length }} Registros</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr class="bg-gray-50 text-gray-500 text-[10px] lg:text-xs uppercase tracking-wider border-b border-gray-200">
                  <th class="px-4 lg:px-6 py-3 lg:py-4 font-medium">Fecha / Hora</th>
                  <th class="px-4 lg:px-6 py-3 lg:py-4 font-medium">Cliente</th>
                  <th class="px-4 lg:px-6 py-3 lg:py-4 font-medium">Tipo Operación</th>
                  <th class="px-4 lg:px-6 py-3 lg:py-4 font-medium text-right">Total</th>
                  <th class="px-4 lg:px-6 py-3 lg:py-4 font-medium text-right">A Deuda</th>
                  <th class="px-4 lg:px-6 py-3 lg:py-4 font-medium text-center">Detalle</th>
                </tr>
              </thead>
              <tbody class="text-xs lg:text-sm text-gray-700 divide-y divide-gray-200">
                <tr v-for="mov in movimientosFiltrados" :key="mov.id" class="hover:bg-gray-50 transition">
                  <td class="px-4 lg:px-6 py-3 lg:py-4 text-gray-500">{{ formatearFecha(mov.fecha) }}</td>
                  <td class="px-4 lg:px-6 py-3 lg:py-4">
                    <p class="font-bold text-slate-900" v-if="mov.cliente">{{ mov.cliente.nombre }} {{ mov.cliente.apellido || '' }}</p>
                    <p class="font-medium text-gray-400" v-else>Cliente #{{ mov.cliente_id }}</p>
                  </td>
                  <td class="px-4 lg:px-6 py-3 lg:py-4">
                    <span :class="mov.es_credito ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-green-100 text-green-800 border-green-200'" class="px-2 py-0.5 rounded text-[10px] font-bold border">
                      {{ mov.es_credito ? 'A Crédito' : 'Contado' }}
                    </span>
                  </td>
                  <td class="px-4 lg:px-6 py-3 lg:py-4 text-right font-semibold text-slate-900">${{ parseFloat(mov.total_venta).toLocaleString() }}</td>
                  
                  <td class="px-4 lg:px-6 py-3 lg:py-4 text-right font-bold" :class="getDeudaMovimiento(mov) > 0 ? 'text-red-600' : 'text-gray-400'">
                    ${{ getDeudaMovimiento(mov).toLocaleString() }}
                  </td>
                  
                  <td class="px-4 lg:px-6 py-3 lg:py-4 text-center">
                    <button @click="abrirDetalle(mov)" class="text-blue-600 hover:text-blue-800 p-1.5 bg-blue-50 rounded-lg transition text-sm">
                      👁️
                    </button>
                  </td>
                </tr>
                <tr v-if="movimientosFiltrados.length === 0">
                  <td colspan="6" class="px-6 py-12 text-center text-gray-400 text-sm">No se encontraron movimientos comerciales.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>

    <div v-if="isDetalleOpen && ventaSeleccionada" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="px-4 lg:px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
          <div>
            <h3 class="text-base lg:text-lg font-bold text-slate-800">Venta #{{ ventaSeleccionada.id }}</h3>
            <p class="text-[10px] lg:text-xs text-gray-500">
              Cliente: {{ ventaSeleccionada.cliente ? ventaSeleccionada.cliente.nombre : ventaSeleccionada.cliente_id }} | 
              Pago: {{ ventaSeleccionada.metodo_pago }}
            </p>
          </div>
          <button @click="cerrarModalDetalle" class="text-gray-400 hover:text-red-500 transition text-2xl font-semibold leading-none">&times;</button>
        </div>
        
        <div class="p-4 lg:p-6 overflow-y-auto">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs lg:text-sm mb-4 min-w-[400px]">
              <thead>
                <tr class="bg-slate-100 text-slate-600 text-[10px] lg:text-xs uppercase border-b border-slate-200">
                  <th class="px-3 py-2 font-medium">Producto</th>
                  <th class="px-3 py-2 font-medium text-center">Cant.</th>
                  <th class="px-3 py-2 font-medium text-right">Precio Unit.</th>
                  <th class="px-3 py-2 font-medium text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="item in ventaSeleccionada.detalles" :key="item.id">
                  
                  <td class="px-3 py-2 font-semibold text-slate-800">
                    {{ item.nombre_producto || getNombreProducto(item.producto_id) }}
                  </td>
                  
                  <td class="px-3 py-2 text-center text-slate-600">{{ item.cantidad }}</td>
                  <td class="px-3 py-2 text-right text-slate-600">${{ parseFloat(item.precio_unitario).toLocaleString() }}</td>
                  <td class="px-3 py-2 text-right font-bold text-slate-900">${{ (item.cantidad * parseFloat(item.precio_unitario)).toLocaleString() }}</td>
                </tr>
                <tr v-if="!ventaSeleccionada.detalles || ventaSeleccionada.detalles.length === 0">
                  <td colspan="4" class="px-4 py-6 text-center text-gray-400 text-xs italic">Esta factura fue registrada como abono o no tiene productos desglosados.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="flex justify-end pt-4 border-t border-gray-200">
            <span class="text-sm lg:text-lg font-medium text-gray-600 mr-4">Total Facturado:</span>
            <span class="text-xl lg:text-2xl font-black text-slate-900">${{ parseFloat(ventaSeleccionada.total_venta).toLocaleString() }}</span>
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

const listaVentas = ref([])
const listaProductos = ref([])
const listaClientes = ref([]) 
const busqueda = ref('')

const isDetalleOpen = ref(false)
const ventaSeleccionada = ref(null)

const movimientosFiltrados = computed(() => {
  if (!listaVentas.value || !Array.isArray(listaVentas.value)) return []
  if (!busqueda.value) return listaVentas.value
  
  const termino = busqueda.value.toLowerCase().trim()
  return listaVentas.value.filter(v => {
    if (!v.cliente) return String(v.cliente_id).includes(termino)
    const nombreCompleto = `${v.cliente.nombre} ${v.cliente.apellido || ''}`.toLowerCase()
    return nombreCompleto.includes(termino)
  })
})

const totalFacturado = computed(() => movimientosFiltrados.value.reduce((sum, v) => sum + parseFloat(v.total_venta || 0), 0))

const totalEnDeuda = computed(() => {
  if (!listaClientes.value || listaClientes.value.length === 0) return 0
  if (!busqueda.value.trim()) {
    return listaClientes.value.reduce((sum, c) => sum + parseFloat(c.saldo_deuda || 0), 0)
  }
  const clientIdsFiltrados = [...new Set(movimientosFiltrados.value.map(v => v.cliente_id))]
  return listaClientes.value
    .filter(c => clientIdsFiltrados.includes(c.id))
    .reduce((sum, c) => sum + parseFloat(c.saldo_deuda || 0), 0)
})

const totalRecaudado = computed(() => {
  return totalFacturado.value - totalEnDeuda.value
})

const getDeudaMovimiento = (mov) => {
  if (!mov.es_credito) return 0
  if (!listaClientes.value) return parseFloat(mov.monto_en_deuda || 0)
  const cliente = listaClientes.value.find(c => c.id === mov.cliente_id)
  return cliente ? parseFloat(cliente.saldo_deuda || 0) : 0
}

const abrirDetalle = (venta) => {
  ventaSeleccionada.value = venta
  isDetalleOpen.value = true
}

const cerrarModalDetalle = () => {
  isDetalleOpen.value = false
  ventaSeleccionada.value = null
}

// MODIFICADO: Validación adaptativa por tipos numéricos y fallback claro
const getNombreProducto = (id) => {
  if (!listaProductos.value || !Array.isArray(listaProductos.value)) return 'Cargando...'
  const prod = listaProductos.value.find(p => Number(p.id) === Number(id))
  return prod ? prod.nombre : `[Inactivo] Artículo #${id}`
}

const cargarHistorialGeneral = async () => {
  try {
    const [resVentas, resProductos, resClientes] = await Promise.all([
      api.get('/ventas/'),
      api.get('/productos/'),
      api.get('/clientes/')
    ])
    
    listaVentas.value = resVentas.data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    listaProductos.value = resProductos.data
    listaClientes.value = resClientes.data
  } catch (error) { 
    console.error("Error cargando la auditoría:", error) 
  }
}

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '-'
  return new Date(fechaStr).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
}

onMounted(() => { 
  cargarHistorialGeneral() 
})
</script>