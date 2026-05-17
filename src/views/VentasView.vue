<template>
  <div class="flex h-screen bg-gray-50 font-sans">
    
    <Sidebar />

    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm shrink-0">
        <div class="flex items-center space-x-6">
          <h1 class="text-2xl font-semibold text-slate-800 mr-4">Módulo de Ventas</h1>
          
          <nav class="flex space-x-2">
            <button @click="pestanaActual = 'caja'" 
                    class="px-4 py-2 text-sm font-medium rounded-lg transition"
                    :class="pestanaActual === 'caja' ? 'bg-slate-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'">
              🛒 Caja Registradora
            </button>
            <button @click="cambiarAHistorial" 
                    class="px-4 py-2 text-sm font-medium rounded-lg transition"
                    :class="pestanaActual === 'historial' ? 'bg-slate-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'">
              📋 Historial de Ventas
            </button>
          </nav>
        </div>

        <div class="relative w-72" v-if="pestanaActual === 'caja'">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
          <input type="text" v-model="busqueda" placeholder="Buscar producto..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm">
        </div>
      </header>

      <div class="flex-1 flex overflow-hidden" v-if="pestanaActual === 'caja'">
        <main class="flex-1 overflow-y-auto p-6">
          <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div v-for="producto in productosFiltrados" :key="producto.id" 
                 @click="agregarAlCarrito(producto)"
                 class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md cursor-pointer transition transform hover:-translate-y-1"
                 :class="producto.stock === 0 ? 'opacity-50 pointer-events-none' : ''">
              <div class="flex justify-between items-start mb-2">
                <span class="bg-blue-100 text-blue-700 py-1 px-2 rounded text-xs font-bold">Cat: {{ producto.categoria_id }}</span>
                <span class="text-xs font-medium" :class="producto.stock < 5 ? 'text-red-500' : 'text-green-500'">Stock: {{ producto.stock }}</span>
              </div>
              <h3 class="font-bold text-slate-800 mt-2 line-clamp-2">{{ producto.nombre }}</h3>
              <p class="text-lg font-black text-slate-900 mt-2">${{ parseFloat(producto.precio_venta).toLocaleString() }}</p>
            </div>
          </div>
          <div v-if="productosFiltrados.length === 0" class="text-center py-12 text-gray-500">
            No se encontraron productos con ese nombre.
          </div>
        </main>

        <aside class="w-96 bg-white border-l border-gray-200 flex flex-col shadow-xl z-10 shrink-0">
          <div class="p-6 border-b border-gray-200 bg-slate-50">
            <h2 class="text-lg font-bold text-slate-800 mb-4 flex items-center"><span class="mr-2">🛒</span> Resumen de Venta</h2>
            <div class="relative">
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Cliente *</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
                <input type="text" v-model="busquedaCliente" @focus="mostrarDropdownCliente = true" placeholder="Escribe para buscar..." class="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm bg-white">
                <button v-if="venta.cliente_id" @click="limpiarCliente" class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-red-500">✖</button>
              </div>
              <ul v-if="mostrarDropdownCliente && clientesFiltradosCaja.length > 0" class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                <li v-for="cliente in clientesFiltradosCaja" :key="cliente.id" @click="seleccionarCliente(cliente)" class="px-4 py-2 hover:bg-slate-100 cursor-pointer text-sm border-b border-gray-50 last:border-0">
                  <span class="font-bold text-slate-800">{{ cliente.nombre }} {{ cliente.apellido || '' }}</span>
                  <span class="text-xs text-gray-500 block">ID: {{ cliente.id }} | Deuda: ${{ parseFloat(cliente.saldo_deuda || 0).toLocaleString() }}</span>
                </li>
              </ul>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-6 space-y-4">
            <div v-if="carrito.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
              <span class="text-4xl mb-2">📦</span> El carrito está vacío
            </div>
            <div v-for="(item, index) in carrito" :key="index" class="flex justify-between items-center border-b border-gray-100 pb-3">
              <div class="flex-1 pr-4 overflow-hidden">
                <p class="text-sm font-semibold text-slate-800 truncate">{{ item.producto.nombre }}</p>
                <p class="text-xs text-gray-500">${{ parseFloat(item.producto.precio_venta).toLocaleString() }} x {{ item.cantidad }}</p>
              </div>
              
              <div class="flex items-center space-x-2 shrink-0">
                <button @click="restarCantidad(index)" class="w-6 h-6 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center font-bold">-</button>
                
                <input 
                  type="number" 
                  v-model.number="item.cantidad" 
                  @input="validarCantidadManual(index)"
                  @blur="corregirCantidadVacia(index)"
                  min="1" 
                  :max="item.producto.stock"
                  class="w-12 h-6 border border-gray-300 rounded text-center text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-950 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                
                <button @click="sumarCantidad(index)" class="w-6 h-6 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center font-bold">+</button>
                <button @click="quitarDelCarrito(index)" class="text-red-400 hover:text-red-600 ml-2">🗑️</button>
              </div>
            </div>
          </div>

          <div class="p-6 border-t border-gray-200 bg-slate-50">
            <div class="flex justify-between items-center mb-4">
              <span class="text-gray-500 font-medium">Total:</span>
              <span class="text-3xl font-black text-slate-900">${{ totalVenta.toLocaleString() }}</span>
            </div>
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tipo de Venta</label>
                <div class="flex space-x-4">
                  <label class="flex items-center cursor-pointer">
                    <input type="radio" :value="false" v-model="venta.es_credito" class="text-slate-900 focus:ring-slate-900">
                    <span class="ml-2 text-sm text-slate-700">Contado</span>
                  </label>
                  <label class="flex items-center cursor-pointer">
                    <input type="radio" :value="true" v-model="venta.es_credito" class="text-slate-900 focus:ring-slate-900">
                    <span class="ml-2 text-sm text-slate-700">A Crédito</span>
                  </label>
                </div>
              </div>

              <div v-if="venta.es_credito" class="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <label class="block text-xs font-semibold text-blue-800 mb-1">Cuota Inicial (Abono)</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-500">$</span>
                  <input type="number" v-model="venta.cuota_inicial" class="w-full pl-8 pr-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                </div>
                <p class="text-xs text-blue-600 mt-1 font-medium">Queda debiendo: ${{ montoEnDeuda.toLocaleString() }}</p>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Método de Pago</label>
                <select v-model="venta.metodo_pago" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm bg-white">
                  <option value="Efectivo">💵 Efectivo</option>
                  <option value="Transferencia">📱 Transferencia (Nequi/Bancolombia)</option>
                  <option value="Tarjeta">💳 Tarjeta (Datáfono)</option>
                </select>
              </div>

              <div class="bg-slate-100 p-3 rounded-xl border border-gray-200">
                <label class="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  📅 Fecha de Operación:
                </label>
                <input 
                  type="datetime-local" 
                  v-model="venta.fecha" 
                  class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 bg-white font-medium text-slate-800"
                />
                <p class="text-[9px] text-slate-500 mt-1 italic leading-tight">
                  * Dejar quieto si es venta de hoy. Editar sólo para asentar notas atrasadas del cuaderno.
                </p>
              </div>

              <button @click="procesarVenta" :disabled="carrito.length === 0 || !venta.cliente_id || isProcessingVenta" 
                      class="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-lg mt-4 flex justify-center items-center">
                <svg v-if="isProcessingVenta" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isProcessingVenta ? 'Procesando Venta...' : 'Registrar Venta' }} ➔
              </button>
            </div>
          </div>
        </aside>
      </div>

      <div class="flex-1 overflow-x-hidden overflow-y-auto p-8" v-else>
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-lg font-bold text-slate-800">Registro General de Facturas</h2>
          </div>

          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th class="px-6 py-4 font-medium">ID Factura</th>
                <th class="px-6 py-4 font-medium">Fecha / Hora</th>
                <th class="px-6 py-4 font-medium">Cliente (ID)</th>
                <th class="px-6 py-4 font-medium">Tipo</th>
                <th class="px-6 py-4 font-medium">Método Pago</th>
                <th class="px-6 py-4 font-medium text-right">Total Facturado</th>
                <th class="px-6 py-4 font-medium text-center">Detalle</th>
              </tr>
            </thead>
            <tbody class="text-sm text-gray-700 divide-y divide-gray-200">
              <tr v-for="v in historialVentas" :key="v.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 font-mono font-bold text-slate-600">#{{ v.id }}</td>
                <td class="px-6 py-4 text-gray-500">{{ formatearFecha(v.fecha) }}</td>
                <td class="px-6 py-4">
                  <span v-if="v.cliente" class="font-semibold text-slate-900">
                    {{ v.cliente.nombre }} {{ v.cliente.apellido || '' }}
                  </span>
                  <span v-else class="font-semibold text-slate-900">Cliente #{{ v.cliente_id }}</span>
                  <span class="text-xs text-gray-400 block">ID único: {{ v.cliente_id }}</span>
                </td>
                <td class="px-6 py-4">
                  <span :class="v.es_credito ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'" 
                        class="px-2 py-1 rounded text-xs font-bold">
                    {{ v.es_credito ? 'A Crédito' : 'Contado' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-gray-600">{{ v.metodo_pago }}</td>
                <td class="px-6 py-4 text-right font-black text-slate-900">${{ parseFloat(v.total_venta).toLocaleString() }}</td>
                <td class="px-6 py-4 text-center">
                  <button @click="abrirDetalle(v)" title="Ver productos facturados" class="text-blue-600 hover:text-blue-800 p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition text-base border border-blue-100">
                    👁️
                  </button>
                </td>
              </tr>
              <tr v-if="historialVentas.length === 0">
                <td colspan="7" class="px-6 py-8 text-center text-gray-500">No se han registrado ventas en el sistema todavía.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <div v-if="isDetalleOpen && ventaSeleccionada" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h3 class="text-lg font-bold text-slate-800">Recibo de Venta #{{ ventaSeleccionada.id }}</h3>
            <p class="text-xs text-gray-500">
              Fecha: {{ formatearFecha(ventaSeleccionada.fecha) }} | 
              Pago: {{ ventaSeleccionada.metodo_pago }}
            </p>
          </div>
          <button @click="cerrarModalDetalle" class="text-gray-400 hover:text-red-500 transition text-2xl font-semibold leading-none">&times;</button>
        </div>
        
        <div class="p-6">
          <table class="w-full text-left border-collapse text-sm mb-4">
            <thead>
              <tr class="bg-slate-100 text-slate-600 text-xs uppercase border-b border-slate-200">
                <th class="px-4 py-2 font-medium">Producto</th>
                <th class="px-4 py-2 font-medium text-center">Cantidad</th>
                <th class="px-4 py-2 font-medium text-right">Precio Unit.</th>
                <th class="px-4 py-2 font-medium text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in ventaSeleccionada.detalles" :key="item.id">
                <td class="px-4 py-3 font-semibold text-slate-800">{{ getNombreProducto(item.producto_id) }}</td>
                <td class="px-4 py-3 text-center text-slate-600">{{ item.cantidad }}</td>
                <td class="px-4 py-3 text-right text-slate-600">${{ parseFloat(item.precio_unitario).toLocaleString() }}</td>
                <td class="px-4 py-3 text-right font-bold text-slate-900">${{ (item.cantidad * parseFloat(item.precio_unitario)).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
          <div class="flex justify-end pt-4 border-t border-gray-200">
            <span class="text-lg font-medium text-gray-600 mr-4">Total Facturado:</span>
            <span class="text-2xl font-black text-slate-900">${{ parseFloat(ventaSeleccionada.total_venta).toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../api/axios' // ✅ Instancia centralizada con token automático
import Sidebar from '../components/Sidebar.vue'
import { useToast } from '../composables/useToast'

const obtenerFechaLocalActual = () => {
  const ahora = new Date()
  const tzOffset = ahora.getTimezoneOffset() * 60000
  const horaLocal = new Date(ahora.getTime() - tzOffset)
  return horaLocal.toISOString().slice(0, 16)
}

const pestanaActual = ref('caja')
const listaProductos = ref([])
const listaClientes = ref([])
const historialVentas = ref([])
const carrito = ref([])
const busqueda = ref('')
const busquedaCliente = ref('')
const mostrarDropdownCliente = ref(false)
const isDetalleOpen = ref(false)
const ventaSeleccionada = ref(null)
const { showToast } = useToast()
const isProcessingVenta = ref(false)

const venta = ref({
  cliente_id: '',
  es_credito: false,
  cuota_inicial: 0,
  metodo_pago: 'Efectivo',
  fecha: obtenerFechaLocalActual()
})

const productosFiltrados = computed(() => {
  if (!busqueda.value) return listaProductos.value
  return listaProductos.value.filter(p => p.nombre.toLowerCase().includes(busqueda.value.toLowerCase()))
})

const clientesFiltradosCaja = computed(() => {
  if (!busquedaCliente.value) return listaClientes.value
  const termino = busquedaCliente.value.toLowerCase()
  return listaClientes.value.filter(c =>
    `${c.nombre} ${c.apellido || ''}`.toLowerCase().includes(termino) ||
    (c.telefono && c.telefono.includes(termino))
  )
})

const totalVenta = computed(() =>
  carrito.value.reduce((total, item) => total + (parseFloat(item.producto.precio_venta) * item.cantidad), 0)
)

const montoEnDeuda = computed(() => {
  if (!venta.value.es_credito) return 0
  const deuda = totalVenta.value - parseFloat(venta.value.cuota_inicial || 0)
  return deuda > 0 ? deuda : 0
})

const validarCantidadManual = (index) => {
  const item = carrito.value[index]
  if (item.cantidad > item.producto.stock) {
    showToast(`Stock insuficiente: Solo quedan ${item.producto.stock} unidades de '${item.producto.nombre}'.`, "warning")
    item.cantidad = item.producto.stock
  }
}

const corregirCantidadVacia = (index) => {
  const item = carrito.value[index]
  if (!item.cantidad || item.cantidad < 1) item.cantidad = 1
}

const abrirDetalle = (v) => {
  ventaSeleccionada.value = v
  isDetalleOpen.value = true
}

const cerrarModalDetalle = () => {
  isDetalleOpen.value = false
  ventaSeleccionada.value = null
}

const getNombreProducto = (id) => {
  const prod = listaProductos.value.find(p => p.id === id)
  return prod ? prod.nombre : `Producto #${id}`
}

const seleccionarCliente = (cliente) => {
  venta.value.cliente_id = cliente.id
  busquedaCliente.value = `${cliente.nombre} ${cliente.apellido || ''}`.trim()
  mostrarDropdownCliente.value = false
}

const limpiarCliente = () => {
  venta.value.cliente_id = ''
  busquedaCliente.value = ''
  mostrarDropdownCliente.value = false
}

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '-'
  return new Date(fechaStr).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
}

const agregarAlCarrito = (producto) => {
  const itemExistente = carrito.value.find(item => item.producto.id === producto.id)
  if (itemExistente) {
    if (itemExistente.cantidad < producto.stock) itemExistente.cantidad++
  } else {
    carrito.value.push({ producto: producto, cantidad: 1 })
  }
}

const sumarCantidad = (index) => {
  const item = carrito.value[index]
  if (item.cantidad < item.producto.stock) item.cantidad++
}

const restarCantidad = (index) => {
  if (carrito.value[index].cantidad > 1) carrito.value[index].cantidad--
}

const quitarDelCarrito = (index) => {
  carrito.value.splice(index, 1)
}

// ✅ Sin token manual, sin URL hardcodeada
const cargarDatos = async () => {
  try {
    const [resProductos, resClientes] = await Promise.all([
      api.get('/productos/'),
      api.get('/clientes/')
    ])
    listaProductos.value = resProductos.data
    listaClientes.value = resClientes.data
  } catch (error) {
    console.error("Error cargando inventario/clientes:", error)
  }
}

const cambiarAHistorial = async () => {
  pestanaActual.value = 'historial'
  try {
    const res = await api.get('/ventas/')
    historialVentas.value = res.data
  } catch (error) {
    console.error("Error cargando el historial de ventas:", error)
  }
}

const procesarVenta = async () => {
  isProcessingVenta.value = true
  try {
    const payload = {
      cliente_id: parseInt(venta.value.cliente_id),
      cliente_nuevo: null,
      es_credito: venta.value.es_credito,
      cuota_inicial: venta.value.es_credito ? parseFloat(venta.value.cuota_inicial || 0) : totalVenta.value,
      metodo_pago: venta.value.metodo_pago,
      fecha: venta.value.fecha ? new Date(venta.value.fecha).toISOString() : null,
      items: carrito.value.map(item => ({
        producto_id: item.producto.id,
        cantidad: item.cantidad,
        precio_unitario: parseFloat(item.producto.precio_venta)
      }))
    }

    await api.post('/ventas/', payload) // ✅ Limpio

    showToast(`¡Venta por $${totalVenta.value.toLocaleString()} registrada con éxito!`, "success")

    carrito.value = []
    venta.value = {
      cliente_id: '',
      es_credito: false,
      cuota_inicial: 0,
      metodo_pago: 'Efectivo',
      fecha: obtenerFechaLocalActual()
    }
    limpiarCliente()
    await cargarDatos()

  } catch (error) {
    console.error("Error al registrar la venta:", error)
    showToast(error.response?.data?.detail || "Error contable: No se pudo asentar la factura en el servidor.", "error")
  } finally {
    isProcessingVenta.value = false
  }
}

onMounted(() => {
  cargarDatos()
})
</script>