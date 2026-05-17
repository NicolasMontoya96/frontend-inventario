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
            <h1 class="text-xl lg:text-2xl font-semibold text-slate-800">Compras</h1>
          </div>
        </div>

        <nav class="flex space-x-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
          <button @click="pestanaActual = 'abastecer'" 
                  class="px-4 py-2 text-sm font-medium rounded-lg transition whitespace-nowrap"
                  :class="pestanaActual === 'abastecer' ? 'bg-slate-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'">
            📥 Abastecer Inventario
          </button>
          <button @click="cambiarAHistorial" 
                  class="px-4 py-2 text-sm font-medium rounded-lg transition whitespace-nowrap"
                  :class="pestanaActual === 'historial' ? 'bg-slate-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'">
            📋 Historial
          </button>
        </nav>

        <div class="relative w-full lg:w-72" v-if="pestanaActual === 'abastecer'">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
          <input type="text" v-model="busquedaProducto" placeholder="Buscar producto..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm">
        </div>
      </header>

      <div class="flex-1 flex flex-col lg:flex-row overflow-hidden relative" v-if="pestanaActual === 'abastecer'">
        
        <main class="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6" :class="mostrarResumenMovil ? 'hidden lg:block' : 'block'">
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse min-w-[500px] lg:min-w-full">
                <thead>
                  <tr class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                    <th class="px-4 py-3 font-medium">ID</th>
                    <th class="px-4 py-3 font-medium">Producto a Surtir</th>
                    <th class="px-4 py-3 font-medium text-center">Últ. Costo</th>
                    <th class="px-4 py-3 font-medium text-center">Stock Actual</th>
                    <th class="px-4 py-3 font-medium text-center">Añadir</th>
                  </tr>
                </thead>
                <tbody class="text-sm text-gray-700 divide-y divide-gray-200">
                  <tr v-for="producto in productosFiltrados" :key="producto.id" class="hover:bg-slate-50 transition">
                    <td class="px-4 py-3 font-mono font-medium text-slate-500">#{{ producto.id }}</td>
                    <td class="px-4 py-3 font-semibold text-slate-900">{{ producto.nombre }}</td>
                    <td class="px-4 py-3 text-center text-gray-500 font-medium">${{ parseFloat(producto.precio_compra || 0).toLocaleString() }}</td>
                    <td class="px-4 py-3 text-center font-bold" :class="producto.stock < 5 ? 'text-red-500' : 'text-slate-600'">
                      {{ producto.stock }} unid.
                    </td>
                    <td class="px-4 py-3 text-center">
                      <button @click="agregarALote(producto)" 
                              class="bg-slate-900 hover:bg-slate-800 text-white w-8 h-8 rounded-lg flex items-center justify-center transition shadow-sm mx-auto font-bold text-lg leading-none active:scale-95">
                        +
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="productosFiltrados.length === 0" class="text-center py-12 text-gray-500 bg-white">
              No se encontraron productos en el catálogo.
            </div>
          </div>
        </main>

        <div v-if="!mostrarResumenMovil" class="lg:hidden absolute bottom-4 left-4 right-4 z-20">
           <button @click="mostrarResumenMovil = true" class="w-full bg-slate-800 text-white font-bold py-3.5 px-5 rounded-xl shadow-lg flex justify-between items-center active:scale-95 transition-transform">
             <span class="flex items-center"><span class="mr-2">📥</span> Ver Lote</span>
             <span class="bg-slate-950 px-2.5 py-1 rounded-lg text-sm">{{ loteCompra.length }} items | ${{ totalCompra.toLocaleString() }}</span>
           </button>
        </div>

        <aside class="w-full lg:w-96 bg-white lg:border-l border-gray-200 flex-col shadow-xl z-30 lg:flex shrink-0 h-full lg:h-auto" :class="mostrarResumenMovil ? 'flex' : 'hidden'">
          
          <div class="p-4 lg:p-6 border-b border-gray-200 bg-slate-50 flex items-center justify-between lg:block">
            <div class="flex items-center mb-0 lg:mb-4">
              <button @click="mostrarResumenMovil = false" class="lg:hidden mr-3 text-slate-500 hover:text-slate-800 p-1">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              </button>
              <h2 class="text-lg font-bold text-slate-800 flex items-center"><span class="mr-2 hidden lg:inline">📄</span> Datos de Factura</h2>
            </div>
            <div class="hidden lg:block space-y-4">
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Número de Factura</label>
                <input type="text" v-model="compra.numero_factura" placeholder="Ej. Opcional (Se autogenera)" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm">
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Proveedor *</label>
                <select v-model="compra.proveedor_id" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm bg-white">
                  <option value="" disabled>Seleccione proveedor...</option>
                  <option v-for="prov in listaProveedores" :key="prov.id" :value="prov.id">{{ prov.nombre_empresa }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
            <div class="block lg:hidden bg-slate-50 p-3 rounded-lg border border-gray-200 mb-4 space-y-3">
              <div>
                <label class="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">N° de Factura</label>
                <input type="text" v-model="compra.numero_factura" placeholder="Ej. Opcional" class="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-slate-900">
              </div>
              <div>
                <label class="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Proveedor *</label>
                <select v-model="compra.proveedor_id" class="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:ring-slate-900">
                  <option value="" disabled>Seleccione...</option>
                  <option v-for="prov in listaProveedores" :key="prov.id" :value="prov.id">{{ prov.nombre_empresa }}</option>
                </select>
              </div>
            </div>

            <div v-if="loteCompra.length === 0" class="h-48 lg:h-full flex flex-col items-center justify-center text-gray-400 text-sm text-center px-4">
              <span class="text-4xl mb-2">📥</span> Selecciona productos para abastecer.
            </div>
            <div v-for="(item, index) in loteCompra" :key="index" class="border-b border-gray-100 pb-4 space-y-2">
              <div class="flex justify-between items-start">
                <p class="text-sm font-semibold text-slate-800 truncate pr-2">{{ item.nombre }}</p>
                <button @click="quitarDelLote(index)" class="text-gray-400 hover:text-red-500 text-xs p-1">🗑️</button>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase">Cant</label>
                  <input type="number" v-model.number="item.cantidad" min="1" class="w-full px-2 py-1.5 border border-gray-300 rounded text-sm font-bold text-slate-800 focus:ring-1 focus:ring-slate-900">
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase">Costo Unit. ($)</label>
                  <input type="number" step="0.01" v-model.number="item.precio_compra" min="0" class="w-full px-2 py-1.5 border border-gray-300 rounded text-sm font-bold text-slate-800 focus:ring-1 focus:ring-slate-900">
                </div>
              </div>
            </div>
          </div>

          <div class="p-4 lg:p-6 border-t border-gray-200 bg-slate-50">
            <div class="flex justify-between items-center mb-4">
              <span class="text-gray-500 font-medium text-sm lg:text-base">Inversión Total:</span>
              <span class="text-2xl lg:text-3xl font-black text-slate-900">${{ totalCompra.toLocaleString() }}</span>
            </div>
            <button @click="procesarCompra" :disabled="loteCompra.length === 0 || !compra.proveedor_id || isProcessingCompra"
                    class="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-lg flex justify-center items-center text-sm lg:text-base">
              <svg v-if="isProcessingCompra" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isProcessingCompra ? 'Registrando...' : 'Ingresar Mercancía ➔' }}
            </button>
          </div>
        </aside>
      </div>

      <div class="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-8" v-else>
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="p-4 lg:p-6 border-b border-gray-200">
            <h2 class="text-base lg:text-lg font-bold text-slate-800">Libro de Facturas de Proveedores</h2>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr class="bg-gray-50 text-gray-500 text-[10px] lg:text-xs uppercase tracking-wider border-b border-gray-200">
                  <th class="px-4 py-3 font-medium">ID</th>
                  <th class="px-4 py-3 font-medium">Fecha</th>
                  <th class="px-4 py-3 font-medium">N° Factura</th>
                  <th class="px-4 py-3 font-medium">Proveedor</th>
                  <th class="px-4 py-3 font-medium text-right">Inversión</th>
                  <th class="px-4 py-3 font-medium text-center">Ver</th>
                </tr>
              </thead>
              <tbody class="text-xs lg:text-sm text-gray-700 divide-y divide-gray-200">
                <tr v-for="c in historialCompras" :key="c.id" class="hover:bg-gray-50">
                  <td class="px-4 py-3 font-mono font-bold text-slate-600">#{{ c.id }}</td>
                  <td class="px-4 py-3 text-gray-500">{{ formatearFecha(c.fecha) }}</td>
                  <td class="px-4 py-3 font-semibold text-slate-800">{{ c.numero_factura }}</td>
                  <td class="px-4 py-3">
                    <span v-if="c.proveedor" class="font-bold text-slate-900">{{ c.proveedor.nombre_empresa }}</span>
                    <span v-else class="text-gray-600">Prov #{{ c.proveedor_id }}</span>
                  </td>
                  <td class="px-4 py-3 text-right font-black text-slate-900">${{ parseFloat(c.total).toLocaleString() }}</td>
                  <td class="px-4 py-3 text-center">
                    <button @click="abrirDetalle(c)" class="text-blue-600 hover:text-blue-800 p-1.5 bg-blue-50 rounded-lg transition text-sm">👁️</button>
                  </td>
                </tr>
                <tr v-if="historialCompras.length === 0">
                  <td colspan="6" class="px-6 py-8 text-center text-gray-500">No se han registrado compras.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isDetalleOpen && compraSeleccionada" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div class="px-4 lg:px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h3 class="text-base lg:text-lg font-bold text-slate-800">Compra #{{ compraSeleccionada.id }}</h3>
            <p class="text-[10px] lg:text-xs text-gray-500">Factura: {{ compraSeleccionada.numero_factura }} | Fecha: {{ formatearFecha(compraSeleccionada.fecha) }}</p>
          </div>
          <button @click="cerrarModalDetalle" class="text-gray-400 hover:text-red-500 transition text-2xl font-semibold leading-none">&times;</button>
        </div>
        
        <div class="p-4 lg:p-6 overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs lg:text-sm mb-4 min-w-[400px]">
            <thead>
              <tr class="bg-slate-100 text-slate-600 text-[10px] lg:text-xs uppercase border-b border-slate-200">
                <th class="px-3 py-2 font-medium">Producto</th>
                <th class="px-3 py-2 font-medium text-center">Cant.</th>
                <th class="px-3 py-2 font-medium text-right">Costo</th>
                <th class="px-3 py-2 font-medium text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in compraSeleccionada.detalles" :key="item.id">
                <td class="px-3 py-2 font-semibold text-slate-800">{{ item.nombre_producto || getNombreProducto(item.producto_id) }}</td>
                <td class="px-3 py-2 text-center text-slate-600">{{ item.cantidad }}</td>
                <td class="px-3 py-2 text-right text-slate-600">${{ parseFloat(item.precio_compra).toLocaleString() }}</td>
                <td class="px-3 py-2 text-right font-bold text-slate-900">${{ (item.cantidad * parseFloat(item.precio_compra)).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
          <div class="flex justify-end pt-4 border-t border-gray-200">
            <span class="text-sm lg:text-lg font-medium text-gray-600 mr-4">Total:</span>
            <span class="text-xl lg:text-2xl font-black text-slate-900">${{ parseFloat(compraSeleccionada.total).toLocaleString() }}</span>
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

const { showToast } = useToast()

const isSidebarOpen = ref(false)
const mostrarResumenMovil = ref(false)

const pestanaActual = ref('abastecer')
const listaProductos = ref([])
const listaProveedores = ref([])
const historialCompras = ref([])
const loteCompra = ref([])
const busquedaProducto = ref('')
const compra = ref({ proveedor_id: '', numero_factura: '' })
const isProcessingCompra = ref(false)

const isDetalleOpen = ref(false)
const compraSeleccionada = ref(null)

const productosFiltrados = computed(() => {
  if (!listaProductos.value || !Array.isArray(listaProductos.value)) return []
  if (!busquedaProducto.value) return listaProductos.value
  return listaProductos.value.filter(p => p.nombre.toLowerCase().includes(busquedaProducto.value.toLowerCase()))
})

const totalCompra = computed(() =>
  loteCompra.value.reduce((total, item) => total + (parseFloat(item.precio_compra || 0) * parseInt(item.cantidad || 0)), 0)
)

const agregarALote = (producto) => {
  const existe = loteCompra.value.find(item => item.producto_id === producto.id)
  if (existe) {
    existe.cantidad++
  } else {
    loteCompra.value.push({
      producto_id: producto.id,
      nombre: producto.nombre,
      cantidad: 1,
      precio_compra: parseFloat(producto.precio_compra || 0)
    })
  }
}

const quitarDelLote = (index) => loteCompra.value.splice(index, 1)

const getNombreProducto = (id) => {
  if (!listaProductos.value || !Array.isArray(listaProductos.value)) return `Cargando...`
  
  const prod = listaProductos.value.find(p => Number(p.id) === Number(id))
  
  return prod ? prod.nombre : `[Inactivo] Artículo #${id}`
}

const abrirDetalle = (compraObj) => {
  compraSeleccionada.value = compraObj
  isDetalleOpen.value = true
}

const cerrarModalDetalle = () => {
  isDetalleOpen.value = false
  compraSeleccionada.value = null
}

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '-'
  return new Date(fechaStr).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
}

const cargarDatosBase = async () => {
  try {
    const [resProductos, resProveedores] = await Promise.all([
      api.get('/productos/'),
      api.get('/proveedores/')
    ])
    listaProductos.value = resProductos.data
    listaProveedores.value = resProveedores.data
  } catch (error) {
    console.error("Error cargando catálogos de compras:", error)
  }
}

const cambiarAHistorial = async () => {
  pestanaActual.value = 'historial'
  try {
    const res = await api.get('/compras/')
    historialCompras.value = res.data
  } catch (error) {
    console.error("Error cargando el historial:", error)
  }
}

const procesarCompra = async () => {
  isProcessingCompra.value = true
  try {
    const numeroFacturaFinal = compra.value.numero_factura.trim() !== ''
      ? compra.value.numero_factura
      : `INT-${Date.now().toString().slice(-6)}`

    const payload = {
      proveedor_id: parseInt(compra.value.proveedor_id),
      proveedor_nuevo: null,
      numero_factura: numeroFacturaFinal,
      items: loteCompra.value.map(item => ({
        producto_id: item.producto_id,
        kind: undefined, // Safeguard against type mismatches if any
        cantidad: parseInt(item.cantidad),
        precio_compra: parseFloat(item.precio_compra)
      }))
    }

    await api.post('/compras/', payload) 

    showToast(`¡Entrada de mercancía por $${totalCompra.value.toLocaleString()} registrada con éxito!`, "success")
    loteCompra.value = []
    compra.value = { proveedor_id: '', numero_factura: '' }
    mostrarResumenMovil.value = false 
    cargarDatosBase()
  } catch (error) {
    showToast(error.response?.data?.detail || "Error al guardar la factura de compra.", "error")
  } finally {
    isProcessingCompra.value = false
  }
}

onMounted(() => { cargarDatosBase() })
</script>