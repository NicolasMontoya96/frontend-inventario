<template>
  <div class="flex h-screen bg-gray-50 font-sans">
    <Sidebar />

    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm shrink-0">
        <div class="flex items-center space-x-6">
          <h1 class="text-2xl font-semibold text-slate-800 mr-4">Módulo de Compras</h1>
          <nav class="flex space-x-2">
            <button @click="pestanaActual = 'abastecer'" 
                    class="px-4 py-2 text-sm font-medium rounded-lg transition"
                    :class="pestanaActual === 'abastecer' ? 'bg-slate-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'">
              📥 Abastecer Inventario
            </button>
            <button @click="cambiarAHistorial" 
                    class="px-4 py-2 text-sm font-medium rounded-lg transition"
                    :class="pestanaActual === 'historial' ? 'bg-slate-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'">
              📋 Historial de Compras
            </button>
          </nav>
        </div>
        <div class="relative w-72" v-if="pestanaActual === 'abastecer'">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
          <input type="text" v-model="busquedaProducto" placeholder="Buscar producto para surtir..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm">
        </div>
      </header>

      <div class="flex-1 flex overflow-hidden" v-if="pestanaActual === 'abastecer'">
        <main class="flex-1 overflow-y-auto p-6">
          <div class="mb-4">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Haz clic en un producto existente para añadirle stock</p>
          </div>
          <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div v-for="producto in productosFiltrados" :key="producto.id" 
                 @click="agregarALote(producto)"
                 class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md cursor-pointer transition transform hover:-translate-y-1">
              <div class="flex justify-between items-start mb-1">
                <span class="bg-slate-100 text-slate-700 py-0.5 px-1.5 rounded text-xs font-medium">ID: {{ producto.id }}</span>
                <span class="text-xs font-bold" :class="producto.stock === 0 ? 'text-red-500' : 'text-gray-500'">Stock: {{ producto.stock }}</span>
              </div>
              <h3 class="font-bold text-slate-800 line-clamp-2 mt-1">{{ producto.nombre }}</h3>
              <p class="text-xs text-gray-400 mt-1">Último Costo: ${{ parseFloat(producto.precio_compra || 0).toLocaleString() }}</p>
            </div>
          </div>
        </main>

        <aside class="w-96 bg-white border-l border-gray-200 flex flex-col shadow-xl z-10 shrink-0">
          <div class="p-6 border-b border-gray-200 bg-slate-50 space-y-4">
            <h2 class="text-lg font-bold text-slate-800 flex items-center"><span class="mr-2">📄</span> Datos de Factura</h2>
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

          <div class="flex-1 overflow-y-auto p-6 space-y-4">
            <div v-if="loteCompra.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400 text-sm text-center px-4">
              <span class="text-4xl mb-2">📥</span> Selecciona productos del catálogo para abastecer la bodega.
            </div>
            <div v-for="(item, index) in loteCompra" :key="index" class="border-b border-gray-100 pb-4 space-y-2">
              <div class="flex justify-between items-start">
                <p class="text-sm font-semibold text-slate-800 truncate pr-2">{{ item.nombre }}</p>
                <button @click="quitarDelLote(index)" class="text-gray-400 hover:text-red-500 text-xs">🗑️</button>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase">Cant</label>
                  <input type="number" v-model.number="item.cantidad" min="1" class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-slate-900">
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase">Costo Unitario ($)</label>
                  <input type="number" v-model.number="item.precio_compra" min="0" class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-slate-900">
                </div>
              </div>
            </div>
          </div>

          <div class="p-6 border-t border-gray-200 bg-slate-50">
            <div class="flex justify-between items-center mb-4">
              <span class="text-gray-500 font-medium">Costo Total:</span>
              <span class="text-2xl font-black text-slate-900">${{ totalCompra.toLocaleString() }}</span>
            </div>
            <button @click="procesarCompra" :disabled="loteCompra.length === 0 || !compra.proveedor_id || isProcessingCompra"
                    class="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-lg flex justify-center items-center text-sm">
              <svg v-if="isProcessingCompra" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isProcessingCompra ? 'Registrando...' : 'Registrar Entrada de Mercancía ➔' }}
            </button>
          </div>
        </aside>
      </div>

      <div class="flex-1 overflow-x-hidden overflow-y-auto p-8" v-else>
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-lg font-bold text-slate-800">Libro de Facturas de Proveedores</h2>
          </div>

          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th class="px-6 py-4 font-medium">ID Compra</th>
                <th class="px-6 py-4 font-medium">Fecha / Hora</th>
                <th class="px-6 py-4 font-medium">N° Factura</th>
                <th class="px-6 py-4 font-medium">Proveedor</th>
                <th class="px-6 py-4 font-medium text-right">Inversión Total</th>
                <th class="px-6 py-4 font-medium text-center">Detalle</th>
              </tr>
            </thead>
            <tbody class="text-sm text-gray-700 divide-y divide-gray-200">
              <tr v-for="c in historialCompras" :key="c.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 font-mono font-bold text-slate-600">#{{ c.id }}</td>
                <td class="px-6 py-4 text-gray-500">{{ formatearFecha(c.fecha) }}</td>
                <td class="px-6 py-4 font-semibold text-slate-800">{{ c.numero_factura }}</td>
                <td class="px-6 py-4">
                  <span v-if="c.proveedor" class="font-bold text-slate-900">{{ c.proveedor.nombre_empresa }}</span>
                  <span v-else class="text-gray-600">Proveedor #{{ c.proveedor_id }}</span>
                </td>
                <td class="px-6 py-4 text-right font-black text-slate-900">${{ parseFloat(c.total).toLocaleString() }}</td>
                <td class="px-6 py-4 text-center">
                  <button @click="abrirDetalle(c)" title="Ver productos" class="text-blue-600 hover:text-blue-800 p-2 bg-blue-50 rounded-lg transition text-base">
                    👁️
                  </button>
                </td>
              </tr>
              <tr v-if="historialCompras.length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-gray-500">No se han registrado compras en el sistema todavía.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="isDetalleOpen && compraSeleccionada" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h3 class="text-lg font-bold text-slate-800">Detalle de Compra #{{ compraSeleccionada.id }}</h3>
            <p class="text-xs text-gray-500">Factura: {{ compraSeleccionada.numero_factura }} | Fecha: {{ formatearFecha(compraSeleccionada.fecha) }}</p>
          </div>
          <button @click="isDetalleOpen = false" class="text-gray-400 hover:text-red-500 transition text-2xl font-semibold leading-none">&times;</button>
        </div>
        
        <div class="p-6">
          <table class="w-full text-left border-collapse text-sm mb-4">
            <thead>
              <tr class="bg-slate-100 text-slate-600 text-xs uppercase border-b border-slate-200">
                <th class="px-4 py-2 font-medium">Producto</th>
                <th class="px-4 py-2 font-medium text-center">Cantidad</th>
                <th class="px-4 py-2 font-medium text-right">Costo Unit.</th>
                <th class="px-4 py-2 font-medium text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in compraSeleccionada.detalles" :key="item.id">
                <td class="px-4 py-3 font-semibold text-slate-800">{{ getNombreProducto(item.producto_id) }}</td>
                <td class="px-4 py-3 text-center text-slate-600">{{ item.cantidad }}</td>
                <td class="px-4 py-3 text-right text-slate-600">${{ parseFloat(item.precio_compra).toLocaleString() }}</td>
                <td class="px-4 py-3 text-right font-bold text-slate-900">${{ (item.cantidad * parseFloat(item.precio_compra)).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
          <div class="flex justify-end pt-4 border-t border-gray-200">
            <span class="text-lg font-medium text-gray-600 mr-4">Inversión Total:</span>
            <span class="text-2xl font-black text-slate-900">${{ parseFloat(compraSeleccionada.total).toLocaleString() }}</span>
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

const { showToast } = useToast()

const pestanaActual = ref('abastecer')
const listaProductos = ref([])
const listaProveedores = ref([])
const historialCompras = ref([])
const loteCompra = ref([])
const busquedaProducto = ref('')
const compra = ref({ proveedor_id: '', numero_factura: '' })
const isProcessingCompra = ref(false) // ✅ Spinner en el botón

const isDetalleOpen = ref(false)
const compraSeleccionada = ref(null)

const productosFiltrados = computed(() => {
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
  const prod = listaProductos.value.find(p => p.id === id)
  return prod ? prod.nombre : `Producto #${id}`
}

const abrirDetalle = (compraObj) => {
  compraSeleccionada.value = compraObj
  isDetalleOpen.value = true
}

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '-'
  return new Date(fechaStr).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
}

// ✅ Sin token manual, sin URL hardcodeada
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
        cantidad: parseInt(item.cantidad),
        precio_compra: parseFloat(item.precio_compra)
      }))
    }

    await api.post('/compras/', payload) // ✅ Limpio

    showToast(`¡Entrada de mercancía por $${totalCompra.value.toLocaleString()} registrada con éxito!`, "success")
    loteCompra.value = []
    compra.value = { proveedor_id: '', numero_factura: '' }
    cargarDatosBase()
  } catch (error) {
    showToast(error.response?.data?.detail || "Error al guardar la factura de compra.", "error")
  } finally {
    isProcessingCompra.value = false
  }
}

onMounted(() => { cargarDatosBase() })
</script>