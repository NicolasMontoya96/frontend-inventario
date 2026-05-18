<template>
  <div class="flex h-screen bg-gray-50 font-sans">
    
    <Sidebar :isOpen="isSidebarOpen" @close="isSidebarOpen = false" />

    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shadow-sm shrink-0 z-10">
        <div class="flex items-center space-x-3">
          <button @click="isSidebarOpen = true" class="lg:hidden text-slate-500 hover:text-slate-800 p-1 focus:outline-none">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <h1 class="text-xl lg:text-2xl font-semibold text-slate-800">Libro de Movimientos General</h1>
        </div>
      </header>

      <main class="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-8 bg-gray-50">

        <!-- FILTROS -->
        <div class="flex flex-col sm:flex-row gap-3 mb-6">
          <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex-1">
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Buscar</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
              <input type="text" v-model="busqueda" placeholder="Cliente o proveedor..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm bg-white">
            </div>
          </div>
          <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Tipo</label>
            <div class="flex gap-2">
              <button v-for="tipo in tiposFiltro" :key="tipo.valor"
                @click="filtroTipo = tipo.valor"
                :class="filtroTipo === tipo.valor ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                class="px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap">
                {{ tipo.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- MÉTRICAS -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div class="bg-white p-4 lg:p-5 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-blue-500">
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ventas brutas</p>
            <p class="text-xl lg:text-2xl font-black text-slate-800 mt-1">${{ totalVentas.toLocaleString() }}</p>
          </div>
          <div class="bg-white p-4 lg:p-5 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-green-500">
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Abonos recibidos</p>
            <p class="text-xl lg:text-2xl font-black text-green-600 mt-1">${{ totalAbonos.toLocaleString() }}</p>
          </div>
          <div class="bg-white p-4 lg:p-5 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-purple-500">
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Compras (salidas)</p>
            <p class="text-xl lg:text-2xl font-black text-purple-600 mt-1">${{ totalCompras.toLocaleString() }}</p>
          </div>
          <div class="bg-white p-4 lg:p-5 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-red-500">
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cartera pendiente</p>
            <p class="text-xl lg:text-2xl font-black text-red-600 mt-1">${{ totalCartera.toLocaleString() }}</p>
          </div>
        </div>

        <!-- TABLA -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="p-4 lg:p-5 border-b border-gray-200 bg-slate-50 flex justify-between items-center">
            <h2 class="text-sm lg:text-base font-bold text-slate-800">Movimientos</h2>
            <span class="text-[10px] lg:text-xs bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-semibold">{{ movimientosFiltrados.length }} registros</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[620px]">
              <thead>
                <tr class="bg-gray-50 text-gray-500 text-[10px] lg:text-xs uppercase tracking-wider border-b border-gray-200">
                  <th class="px-4 lg:px-6 py-3 font-medium">Fecha / Hora</th>
                  <th class="px-4 lg:px-6 py-3 font-medium">Contraparte</th>
                  <th class="px-4 lg:px-6 py-3 font-medium">Tipo</th>
                  <th class="px-4 lg:px-6 py-3 font-medium text-right">Monto</th>
                  <th class="px-4 lg:px-6 py-3 font-medium text-center">Detalle</th>
                </tr>
              </thead>
              <tbody class="text-xs lg:text-sm text-gray-700 divide-y divide-gray-100">
                <tr v-for="mov in movimientosFiltrados" :key="`${mov._tipo}-${mov.id}`" class="hover:bg-gray-50 transition">
                  
                  <td class="px-4 lg:px-6 py-3 text-gray-500 text-xs">{{ formatearFecha(mov.fecha) }}</td>

                  <td class="px-4 lg:px-6 py-3">
                    <p class="font-bold text-slate-900">{{ mov._contraparte }}</p>
                    <p class="text-[10px] text-gray-400">{{ mov._subinfo }}</p>
                  </td>

                  <td class="px-4 lg:px-6 py-3">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold border" :class="chipClase(mov._tipo, mov)">
                      {{ chipLabel(mov._tipo, mov) }}
                    </span>
                  </td>

                  <td class="px-4 lg:px-6 py-3 text-right font-black font-mono"
                      :class="mov._tipo === 'compra' ? 'text-purple-700' : mov._tipo === 'abono' ? 'text-green-700' : 'text-slate-900'">
                    {{ mov._tipo === 'compra' ? '−' : '+' }}${{ parseFloat(mov._monto).toLocaleString() }}
                  </td>

                  <td class="px-4 lg:px-6 py-3 text-center">
                    <button
                      v-if="mov._tipo === 'venta' || mov._tipo === 'compra'"
                      @click="abrirDetalle(mov)"
                      class="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition text-sm"
                    >👁️</button>
                    <span v-else class="text-gray-300 text-xs">—</span>
                  </td>
                </tr>

                <tr v-if="movimientosFiltrados.length === 0">
                  <td colspan="5" class="px-6 py-12 text-center text-gray-400">No se encontraron movimientos.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>

    <!-- MODAL DETALLE -->
    <div v-if="isDetalleOpen && movSeleccionado" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="px-4 lg:px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
          <div>
            <h3 class="text-base lg:text-lg font-bold text-slate-800">
              {{ movSeleccionado._tipo === 'venta' ? `Venta #${movSeleccionado.id}` : `Compra #${movSeleccionado.id} — ${movSeleccionado.numero_factura}` }}
            </h3>
            <p class="text-[10px] lg:text-xs text-gray-500">
              {{ movSeleccionado._tipo === 'venta'
                ? `Cliente: ${movSeleccionado._contraparte} | Pago: ${movSeleccionado.metodo_pago}`
                : `Proveedor: ${movSeleccionado._contraparte}` }}
            </p>
          </div>
          <button @click="cerrarDetalle" class="text-gray-400 hover:text-red-500 transition text-2xl font-semibold leading-none">&times;</button>
        </div>

        <div class="p-4 lg:p-6 overflow-y-auto">
          <table class="w-full text-left border-collapse text-xs lg:text-sm mb-4">
            <thead>
              <tr class="bg-slate-100 text-slate-600 text-[10px] uppercase border-b border-slate-200">
                <th class="px-3 py-2 font-medium">Producto</th>
                <th class="px-3 py-2 font-medium text-center">Cant.</th>
                <th class="px-3 py-2 font-medium text-right">Precio Unit.</th>
                <th class="px-3 py-2 font-medium text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in detallesModal" :key="item.id">
                <td class="px-3 py-2 font-semibold text-slate-800">{{ getNombreProducto(item.producto_id) }}</td>
                <td class="px-3 py-2 text-center text-slate-600">{{ item.cantidad }}</td>
                <td class="px-3 py-2 text-right text-slate-600">
                  ${{ parseFloat(movSeleccionado._tipo === 'venta' ? item.precio_unitario : item.precio_compra).toLocaleString() }}
                </td>
                <td class="px-3 py-2 text-right font-bold text-slate-900">
                  ${{ (item.cantidad * parseFloat(movSeleccionado._tipo === 'venta' ? item.precio_unitario : item.precio_compra)).toLocaleString() }}
                </td>
              </tr>
              <tr v-if="detallesModal.length === 0">
                <td colspan="4" class="px-4 py-6 text-center text-gray-400 text-xs italic">Sin productos desglosados.</td>
              </tr>
            </tbody>
          </table>
          <div class="flex justify-end pt-4 border-t border-gray-200">
            <span class="text-sm font-medium text-gray-600 mr-4">Total:</span>
            <span class="text-xl font-black text-slate-900">${{ parseFloat(movSeleccionado._monto).toLocaleString() }}</span>
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

const listaVentas    = ref([])
const listaAbonos    = ref([])
const listaCompras   = ref([])
const listaProductos = ref([])
const listaClientes  = ref([])

const busqueda   = ref('')
const filtroTipo = ref('todos')

const tiposFiltro = [
  { valor: 'todos',  label: 'Todos'     },
  { valor: 'venta',  label: '🛒 Ventas'  },
  { valor: 'abono',  label: '💰 Abonos'  },
  { valor: 'compra', label: '📦 Compras' },
]

const isDetalleOpen   = ref(false)
const movSeleccionado = ref(null)
const detallesModal   = computed(() => movSeleccionado.value?.detalles || [])

// Normaliza las 3 fuentes al mismo formato para la tabla
const movimientosUnificados = computed(() => {
  const ventas = listaVentas.value.map(v => ({
    ...v,
    _tipo: 'venta',
    _monto: parseFloat(v.total_venta || 0),
    _contraparte: v.cliente
      ? `${v.cliente.nombre} ${v.cliente.apellido || ''}`.trim()
      : `Cliente #${v.cliente_id}`,
    _subinfo: v.es_credito
      ? `Crédito · Deuda: $${parseFloat(v.monto_en_deuda || 0).toLocaleString()}`
      : 'Contado',
  }))

  const abonos = listaAbonos.value.map(a => ({
    ...a,
    _tipo: 'abono',
    _monto: parseFloat(a.monto_abonado || 0),
    _contraparte: a.cliente_nombre || `Cliente #${a.cliente_id}`,
    _subinfo: a.notas || 'Abono a deuda',
  }))

  const compras = listaCompras.value.map(c => ({
    ...c,
    _tipo: 'compra',
    _monto: parseFloat(c.total || 0),
    _contraparte: c.proveedor
      ? c.proveedor.nombre_empresa
      : `Proveedor #${c.proveedor_id}`,
    _subinfo: `Factura: ${c.numero_factura}`,
  }))

  return [...ventas, ...abonos, ...compras]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

const movimientosFiltrados = computed(() => {
  let lista = movimientosUnificados.value

  if (filtroTipo.value !== 'todos') {
    lista = lista.filter(m => m._tipo === filtroTipo.value)
  }

  if (busqueda.value.trim()) {
    const t = busqueda.value.toLowerCase().trim()
    lista = lista.filter(m => m._contraparte.toLowerCase().includes(t))
  }

  return lista
})

// Métricas sobre el total siempre, sin importar el filtro activo
const totalVentas  = computed(() => listaVentas.value.reduce((s, v) => s + parseFloat(v.total_venta || 0), 0))
const totalAbonos  = computed(() => listaAbonos.value.reduce((s, a) => s + parseFloat(a.monto_abonado || 0), 0))
const totalCompras = computed(() => listaCompras.value.reduce((s, c) => s + parseFloat(c.total || 0), 0))
const totalCartera = computed(() => listaClientes.value.reduce((s, c) => s + parseFloat(c.saldo_deuda || 0), 0))

const chipClase = (tipo, mov) => {
  if (tipo === 'abono')  return 'bg-green-100 text-green-800 border-green-200'
  if (tipo === 'compra') return 'bg-purple-100 text-purple-800 border-purple-200'
  if (tipo === 'venta')  return mov.es_credito
    ? 'bg-orange-100 text-orange-800 border-orange-200'
    : 'bg-blue-100 text-blue-800 border-blue-200'
  return ''
}

const chipLabel = (tipo, mov) => {
  if (tipo === 'abono')  return 'Abono'
  if (tipo === 'compra') return 'Compra'
  if (tipo === 'venta')  return mov.es_credito ? 'A Crédito' : 'Contado'
  return ''
}

const abrirDetalle = (mov) => { movSeleccionado.value = mov; isDetalleOpen.value = true }
const cerrarDetalle = () => { isDetalleOpen.value = false; movSeleccionado.value = null }

const getNombreProducto = (id) => {
  const prod = listaProductos.value.find(p => Number(p.id) === Number(id))
  return prod ? prod.nombre : `Artículo #${id}`
}

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '-'
  return new Date(fechaStr).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
}

const cargarTodo = async () => {
  try {
    const [resVentas, resAbonos, resCompras, resProductos, resClientes] = await Promise.all([
      api.get('/ventas/'),
      api.get('/clientes/abonos/todos'),
      api.get('/compras/'),
      api.get('/productos/'),
      api.get('/clientes/')
    ])
    listaVentas.value    = resVentas.data
    listaAbonos.value    = resAbonos.data
    listaCompras.value   = resCompras.data
    listaProductos.value = resProductos.data
    listaClientes.value  = resClientes.data
  } catch (error) {
    console.error('Error cargando movimientos:', error)
  }
}

onMounted(() => { cargarTodo() })
</script>