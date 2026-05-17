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
            <h1 class="text-xl lg:text-2xl font-semibold text-slate-800">Ventas</h1>
          </div>
        </div>

        <nav class="flex space-x-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
          <button @click="pestanaActual = 'caja'" 
                  class="px-4 py-2 text-sm font-medium rounded-lg transition whitespace-nowrap"
                  :class="pestanaActual === 'caja' ? 'bg-slate-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'">
            🛒 Caja Registradora
          </button>
          <button @click="cambiarAHistorial" 
                  class="px-4 py-2 text-sm font-medium rounded-lg transition whitespace-nowrap"
                  :class="pestanaActual === 'historial' ? 'bg-slate-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'">
            📋 Historial
          </button>
        </nav>

        <div class="relative w-full lg:w-72" v-if="pestanaActual === 'caja'">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
          <input type="text" v-model="busqueda" placeholder="Buscar producto..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm">
        </div>
      </header>

      <div class="flex-1 flex flex-col lg:flex-row overflow-hidden relative" v-if="pestanaActual === 'caja'">
        
        <main class="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6" :class="mostrarCarritoMovil ? 'hidden lg:block' : 'block'">
          
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse min-w-[500px] lg:min-w-full">
                <thead>
                  <tr class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                    <th class="px-4 py-3 font-medium">Producto</th>
                    <th class="px-4 py-3 font-medium">Categoría</th>
                    <th class="px-4 py-3 font-medium text-right">Precio</th>
                    <th class="px-4 py-3 font-medium text-center">Stock</th>
                    <th class="px-4 py-3 font-medium text-center">Añadir</th>
                  </tr>
                </thead>
                <tbody class="text-sm text-gray-700 divide-y divide-gray-200">
                  <tr v-for="producto in productosFiltrados" :key="producto.id" 
                      class="hover:bg-slate-50 transition"
                      :class="producto.stock === 0 ? 'opacity-50' : ''">
                    <td class="px-4 py-3 font-semibold text-slate-900">{{ producto.nombre }}</td>
                    <td class="px-4 py-3"><span class="bg-blue-100 text-blue-700 py-1 px-2 rounded text-[10px] font-bold">Cat: {{ producto.categoria_id }}</span></td>
                    <td class="px-4 py-3 text-right font-black text-slate-800">${{ parseFloat(producto.precio_venta).toLocaleString() }}</td>
                    <td class="px-4 py-3 text-center font-bold" :class="producto.stock < 5 ? 'text-red-500' : 'text-green-600'">{{ producto.stock }}</td>
                    <td class="px-4 py-3 text-center">
                      <button @click="agregarAlCarrito(producto)" :disabled="producto.stock === 0" 
                              class="bg-slate-900 hover:bg-slate-800 disabled:bg-gray-300 text-white w-8 h-8 rounded-lg flex items-center justify-center transition shadow-sm mx-auto font-bold text-lg leading-none active:scale-95">
                        +
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="productosFiltrados.length === 0" class="text-center py-12 text-gray-500 bg-white">
              No se encontraron productos.
            </div>
          </div>
        </main>

        <div v-if="!mostrarCarritoMovil" class="lg:hidden absolute bottom-4 left-4 right-4 z-20">
           <button @click="mostrarCarritoMovil = true" class="w-full bg-blue-600 text-white font-bold py-3.5 px-5 rounded-xl shadow-lg flex justify-between items-center active:scale-95 transition-transform">
             <span class="flex items-center"><span class="mr-2">🛒</span> Ver Resumen</span>
             <span class="bg-blue-800 px-2.5 py-1 rounded-lg text-sm">{{ carrito.length }} items | ${{ totalVenta.toLocaleString() }}</span>
           </button>
        </div>

        <aside class="w-full lg:w-96 bg-white lg:border-l border-gray-200 flex-col shadow-xl z-30 lg:flex shrink-0 h-full lg:h-auto" :class="mostrarCarritoMovil ? 'flex' : 'hidden'">
          
          <div class="p-4 lg:p-6 border-b border-gray-200 bg-slate-50 flex items-center justify-between">
            <div class="flex items-center">
              <button @click="mostrarCarritoMovil = false" class="lg:hidden mr-3 text-slate-500 hover:text-slate-800 p-1">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              </button>
              <h2 class="text-lg font-bold text-slate-800 flex items-center"><span class="mr-2 hidden lg:inline">🛒</span> Resumen de Venta</h2>
            </div>
          </div>

          <div class="px-4 lg:px-6 pt-4">
            <label class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Cliente *</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
              <input type="text" v-model="busquedaCliente" @focus="mostrarDropdownCliente = true" placeholder="Buscar cliente..." class="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm bg-white">
              <button v-if="venta.cliente_id" @click="limpiarCliente" class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-red-500">✖</button>
            </div>
            <ul v-if="mostrarDropdownCliente && clientesFiltradosCaja.length > 0" class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto left-0 right-0 lg:static">
              <li v-for="cliente in clientesFiltradosCaja" :key="cliente.id" @click="seleccionarCliente(cliente)" class="px-4 py-2 hover:bg-slate-100 cursor-pointer text-sm border-b border-gray-50 last:border-0">
                <span class="font-bold text-slate-800">{{ cliente.nombre }} {{ cliente.apellido || '' }}</span>
                <span class="text-xs text-gray-500 block">ID: {{ cliente.id }} | Deuda: ${{ parseFloat(cliente.saldo_deuda || 0).toLocaleString() }}</span>
              </li>
            </ul>
          </div>

          <div class="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
            <div v-if="carrito.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
              <span class="text-4xl mb-2">📦</span> Vacío
            </div>
            <div v-for="(item, index) in carrito" :key="index" class="flex justify-between items-center border-b border-gray-100 pb-3">
              <div class="flex-1 pr-2 overflow-hidden">
                <p class="text-sm font-semibold text-slate-800 truncate">{{ item.producto.nombre }}</p>
                <p class="text-xs text-gray-500">${{ parseFloat(item.producto.precio_venta).toLocaleString() }} x {{ item.cantidad }}</p>
              </div>
              
              <div class="flex items-center space-x-1 lg:space-x-2 shrink-0">
                <button @click="restarCantidad(index)" class="w-6 h-6 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center font-bold">-</button>
                <input 
                  type="number" v-model.number="item.cantidad" @input="validarCantidadManual(index)" @blur="corregirCantidadVacia(index)" min="1" :max="item.producto.stock"
                  class="w-10 lg:w-12 h-6 border border-gray-300 rounded text-center text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-950 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button @click="sumarCantidad(index)" class="w-6 h-6 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center font-bold">+</button>
                <button @click="quitarDelCarrito(index)" class="text-red-400 hover:text-red-600 ml-1 lg:ml-2">🗑️</button>
              </div>
            </div>
          </div>

          <div class="p-4 lg:p-6 border-t border-gray-200 bg-slate-50">
            <div class="flex justify-between items-center mb-4">
              <span class="text-gray-500 font-medium text-sm lg:text-base">Total:</span>
              <span class="text-2xl lg:text-3xl font-black text-slate-900">${{ totalVenta.toLocaleString() }}</span>
            </div>
            <div class="space-y-3 lg:space-y-4">
              <div>
                <label class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Tipo de Venta</label>
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
                <p class="text-[10px] text-blue-600 mt-1 font-medium">Deuda: ${{ montoEnDeuda.toLocaleString() }}</p>
              </div>

              <div class="flex flex-col lg:flex-row gap-3">
                <div class="flex-1">
                  <label class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Pago</label>
                  <select v-model="venta.metodo_pago" class="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs bg-white">
                    <option value="Efectivo">💵 Efectivo</option>
                    <option value="Transferencia">📱 Transf.</option>
                    <option value="Tarjeta">💳 Tarjeta</option>
                  </select>
                </div>
                <div class="flex-1">
                  <label class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Fecha</label>
                  <input type="datetime-local" v-model="venta.fecha" class="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-950 bg-white font-medium text-slate-800"/>
                </div>
              </div>

              <button @click="procesarVenta" :disabled="carrito.length === 0 || !venta.cliente_id || isProcessingVenta" 
                      class="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-lg mt-2 flex justify-center items-center text-sm lg:text-base">
                <svg v-if="isProcessingVenta" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isProcessingVenta ? 'Procesando...' : 'Registrar Venta' }} ➔
              </button>
            </div>
          </div>
        </aside>
      </div>

      <div class="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-8" v-else>
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="p-4 lg:p-6 border-b border-gray-200">
            <h2 class="text-base lg:text-lg font-bold text-slate-800">Registro General de Facturas</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr class="bg-gray-50 text-gray-500 text-[10px] lg:text-xs uppercase tracking-wider border-b border-gray-200">
                  <th class="px-4 py-3 font-medium">Factura</th>
                  <th class="px-4 py-3 font-medium">Fecha</th>
                  <th class="px-4 py-3 font-medium">Cliente</th>
                  <th class="px-4 py-3 font-medium">Tipo</th>
                  <th class="px-4 py-3 font-medium">Pago</th>
                  <th class="px-4 py-3 font-medium text-right">Total</th>
                  <th class="px-4 py-3 font-medium text-center">Ver</th>
                </tr>
              </thead>
              <tbody class="text-xs lg:text-sm text-gray-700 divide-y divide-gray-200">
                <tr v-for="v in historialVentas" :key="v.id" class="hover:bg-gray-50">
                  <td class="px-4 py-3 font-mono font-bold text-slate-600">#{{ v.id }}</td>
                  <td class="px-4 py-3 text-gray-500">{{ formatearFecha(v.fecha) }}</td>
                  <td class="px-4 py-3">
                    <span v-if="v.cliente" class="font-semibold text-slate-900">{{ v.cliente.nombre }} {{ v.cliente.apellido || '' }}</span>
                    <span v-else class="font-semibold text-slate-900">Cliente #{{ v.cliente_id }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <span :class="v.es_credito ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'" class="px-2 py-1 rounded text-[10px] font-bold">
                      {{ v.es_credito ? 'Crédito' : 'Contado' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-gray-600">{{ v.metodo_pago }}</td>
                  <td class="px-4 py-3 text-right font-black text-slate-900">${{ parseFloat(v.total_venta).toLocaleString() }}</td>
                  <td class="px-4 py-3 text-center">
                    <button @click="abrirDetalle(v)" class="text-blue-600 hover:text-blue-800 p-1.5 bg-blue-50 rounded-lg transition text-sm border border-blue-100">
                      👁️
                    </button>
                  </td>
                </tr>
                <tr v-if="historialVentas.length === 0">
                  <td colspan="7" class="px-6 py-8 text-center text-gray-500">No se han registrado ventas.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>

    <div v-if="isDetalleOpen && ventaSeleccionada" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div class="px-4 lg:px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h3 class="text-base lg:text-lg font-bold text-slate-800">Venta #{{ ventaSeleccionada.id }}</h3>
            <p class="text-[10px] lg:text-xs text-gray-500">
              Fecha: {{ formatearFecha(ventaSeleccionada.fecha) }} | Pago: {{ ventaSeleccionada.metodo_pago }}
            </p>
          </div>
          <button @click="cerrarModalDetalle" class="text-gray-400 hover:text-red-500 transition text-2xl font-semibold leading-none">&times;</button>
        </div>
        
        <div class="p-4 lg:p-6 overflow-x-auto">
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
              <tr v-for="item in ventaSeleccionada.detalles" :key="item.id">
                <td class="px-3 py-2 font-semibold text-slate-800">{{ getNombreProducto(item.producto_id) }}</td>
                <td class="px-3 py-2 text-center text-slate-600">{{ item.cantidad }}</td>
                <td class="px-3 py-2 text-right text-slate-600">${{ parseFloat(item.precio_unitario).toLocaleString() }}</td>
                <td class="px-3 py-2 text-right font-bold text-slate-900">${{ (item.cantidad * parseFloat(item.precio_unitario)).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
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
import { useToast } from '../composables/useToast'

const obtenerFechaLocalActual = () => {
  const ahora = new Date()
  const tzOffset = ahora.getTimezoneOffset() * 60000
  const horaLocal = new Date(ahora.getTime() - tzOffset)
  return horaLocal.toISOString().slice(0, 16)
}

// NUEVOS ESTADOS PARA MÓVIL
const isSidebarOpen = ref(false)
const mostrarCarritoMovil = ref(false)

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
  if (!listaProductos.value || !Array.isArray(listaProductos.value)) return []
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

    await api.post('/ventas/', payload) 

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
    mostrarCarritoMovil.value = false // Oculta el resumen en móvil al cobrar
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