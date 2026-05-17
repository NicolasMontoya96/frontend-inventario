<template>
  <div class="flex h-screen bg-gray-50 font-sans">
    
    <Sidebar/>

    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
        <h1 class="text-2xl font-semibold text-slate-800">Directorio de Proveedores</h1>
        <div class="flex items-center">
          <span class="text-sm font-medium text-gray-600 mr-4">Usuario Admin</span>
          <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">A</div>
        </div>
      </header>

      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-4xl">
          <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-blue-500">
            <p class="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Proveedores</p>
            <p class="text-3xl font-bold text-slate-800 mt-2">{{ listaProveedores.length }}</p>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-gray-200 flex justify-between items-center bg-white">
            <div class="relative w-72">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
              <input type="text" v-model="busqueda" placeholder="Buscar por empresa o NIT..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm">
            </div>
            <button @click="isModalOpen = true" class="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center shadow-sm">
              <span class="mr-2">+</span> Nuevo Proveedor
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th class="px-6 py-4 font-medium">Empresa</th>
                  <th class="px-6 py-4 font-medium">NIT</th>
                  <th class="px-6 py-4 font-medium">Contacto</th>
                  <th class="px-6 py-4 font-medium text-center">Auditoría</th>
                  <th class="px-6 py-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="text-sm text-gray-700 divide-y divide-gray-200">
                <tr v-for="prov in proveedoresFiltrados" :key="prov.id" class="hover:bg-gray-50 transition">
                  <td class="px-6 py-4">
                    <p class="font-bold text-slate-900">{{ prov.nombre_empresa }}</p>
                    <p class="text-xs text-gray-500 truncate max-w-[200px]">{{ prov.descripcion || 'Sin descripción' }}</p>
                  </td>
                  <td class="px-6 py-4 font-mono text-slate-600">{{ prov.nit }}</td>
                  <td class="px-6 py-4 text-slate-700">{{ prov.contacto || 'No registrado' }}</td>
                  <td class="px-6 py-4 text-center">
                    <button @click="abrirHistorialCompras(prov)" title="Ver Historial de Facturas" class="text-blue-600 hover:text-blue-800 p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition text-sm font-semibold border border-blue-100 shadow-sm">
                      👁️ Ver Facturas
                    </button>
                  </td>
                  <td class="px-6 py-4 text-right space-x-3">
                    <button class="text-slate-400 hover:text-slate-800 transition text-lg">✏️</button>
                    <button @click="eliminarProveedor(prov.id)" class="text-slate-400 hover:text-red-600 transition text-lg">🗑️</button>
                  </td>
                </tr>
                <tr v-if="proveedoresFiltrados.length === 0">
                  <td colspan="5" class="px-6 py-8 text-center text-gray-500">No hay proveedores registrados.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>

    <!-- MODAL NUEVO PROVEEDOR -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 class="text-lg font-bold text-slate-800">Registrar Proveedor</h3>
          <button @click="isModalOpen = false" class="text-gray-400 hover:text-red-500 transition text-2xl font-semibold leading-none">&times;</button>
        </div>
        <form @submit.prevent="guardarProveedor" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Razón Social / Empresa *</label>
            <input type="text" v-model="nuevoProveedor.nombre_empresa" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">NIT (Opcional)</label>
              <input type="text" v-model="nuevoProveedor.nit" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono / Contacto</label>
              <input type="text" v-model="nuevoProveedor.contacto" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm">
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción / Notas</label>
            <textarea v-model="nuevoProveedor.descripcion" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"></textarea>
          </div>
          <div class="pt-4 flex justify-end space-x-3 border-t border-gray-100 mt-2">
            <button type="button" @click="isModalOpen = false" :disabled="isSaving" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">Cancelar</button>
            <button type="submit" :disabled="isSaving" class="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition flex items-center disabled:bg-slate-700 disabled:cursor-not-allowed">
              <svg v-if="isSaving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isSaving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL HISTORIAL DE COMPRAS -->
    <div v-if="isHistorialOpen && proveedorSeleccionado" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-full">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
          <div>
            <h3 class="text-lg font-bold text-slate-800">Libro de Compras y Surtidos</h3>
            <p class="text-sm text-gray-500 font-medium mt-1">Proveedor: <span class="text-slate-800">{{ proveedorSeleccionado.nombre_empresa }}</span> | NIT: {{ proveedorSeleccionado.nit }}</p>
            <p class="text-xs text-blue-600 font-semibold mt-1">💡 Haz clic sobre una factura para desplegar los artículos comprados.</p>
          </div>
          <button @click="isHistorialOpen = false" class="text-gray-400 hover:text-red-500 transition text-2xl font-semibold leading-none">&times;</button>
        </div>
        
        <div class="p-6 overflow-y-auto flex-1 bg-gray-50/50">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-slate-100 text-slate-600 text-xs uppercase border-b border-slate-200">
                <th class="px-4 py-3 font-medium">Fecha / Hora</th>
                <th class="px-4 py-3 font-medium">N° Factura</th>
                <th class="px-4 py-3 font-medium text-right">Monto Invertido</th>
              </tr>
            </thead>
            <tbody class="text-gray-700">
              <template v-for="compra in comprasDelProveedor" :key="compra.id">
                <tr @click="toggleFactura(compra.id)" class="border-b border-gray-100 hover:bg-slate-100/80 cursor-pointer transition">
                  <td class="px-4 py-3.5 text-gray-500 flex items-center select-none font-medium">
                    <span class="mr-2 text-xs transition-transform duration-200 inline-block text-slate-400"
                          :class="facturaExpandidaId === compra.id ? 'transform rotate-90 text-blue-600' : ''">▶</span>
                    {{ formatearFecha(compra.fecha) }}
                  </td>
                  <td class="px-4 py-3.5 font-bold text-slate-800">{{ compra.numero_factura }}</td>
                  <td class="px-4 py-3.5 text-right font-black text-slate-900">${{ parseFloat(compra.total).toLocaleString() }}</td>
                </tr>

                <tr v-if="facturaExpandidaId === compra.id" class="bg-blue-50/30">
                  <td colspan="3" class="px-6 py-4">
                    <div class="bg-white border border-blue-100 rounded-xl p-4 shadow-sm">
                      <h4 class="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center">
                        <span class="mr-1.5">📦</span> Artículos ingresados en esta orden:
                      </h4>
                      <table class="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr class="text-gray-400 uppercase tracking-tight border-b border-gray-100">
                            <th class="pb-2 font-semibold">Producto</th>
                            <th class="pb-2 text-center font-semibold">Cantidad</th>
                            <th class="pb-2 text-right font-semibold">Costo Unit.</th>
                            <th class="pb-2 text-right font-semibold">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50 text-slate-700">
                          <tr v-for="item in compra.detalles" :key="item.id">
                            <td class="py-2.5 font-bold text-slate-800">{{ getNombreProducto(item.producto_id) }}</td>
                            <td class="py-2.5 text-center font-medium bg-slate-50 rounded text-slate-800">{{ item.cantidad }} unid.</td>
                            <td class="py-2.5 text-right text-gray-500">${{ parseFloat(item.precio_compra).toLocaleString() }}</td>
                            <td class="py-2.5 text-right font-bold text-slate-900">${{ (item.cantidad * parseFloat(item.precio_compra)).toLocaleString() }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              </template>

              <tr v-if="comprasDelProveedor.length === 0">
                <td colspan="3" class="px-4 py-8 text-center text-gray-400">No se han registrado compras a este proveedor.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="px-6 py-4 border-t border-gray-200 bg-white flex justify-between items-center shrink-0">
          <span class="text-sm font-bold text-gray-500 uppercase tracking-wider">Inversión Total Histórica:</span>
          <span class="text-2xl font-black text-slate-900">${{ totalInvertido.toLocaleString() }}</span>
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

const listaProveedores = ref([])
const listaProductos = ref([])
const busqueda = ref('')
const isModalOpen = ref(false)
const isSaving = ref(false)

const isHistorialOpen = ref(false)
const proveedorSeleccionado = ref(null)
const comprasDelProveedor = ref([])
const facturaExpandidaId = ref(null)

const nuevoProveedor = ref({ nombre_empresa: '', nit: '', contacto: '', descripcion: '' })

const proveedoresFiltrados = computed(() => {
  if (!busqueda.value) return listaProveedores.value
  const query = busqueda.value.toLowerCase()
  return listaProveedores.value.filter(p =>
    p.nombre_empresa.toLowerCase().includes(query) || p.nit.includes(query)
  )
})

const totalInvertido = computed(() =>
  comprasDelProveedor.value.reduce((sum, compra) => sum + parseFloat(compra.total || 0), 0)
)

const toggleFactura = (id) => {
  facturaExpandidaId.value = facturaExpandidaId.value === id ? null : id
}

const getNombreProducto = (id) => {
  const prod = listaProductos.value.find(p => p.id === id)
  return prod ? prod.nombre : `Producto ID: #${id}`
}

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '-'
  return new Date(fechaStr).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
}

// ✅ Sin token manual, sin URL hardcodeada
const cargarProductos = async () => {
  try {
    const res = await api.get('/productos/')
    listaProductos.value = res.data
  } catch (error) {
    console.error("Error al cargar productos catálogo:", error)
  }
}

const cargarProveedores = async () => {
  try {
    const res = await api.get('/proveedores/')
    listaProveedores.value = res.data
  } catch (error) {
    console.error("Error al cargar proveedores:", error)
  }
}

const abrirHistorialCompras = async (proveedor) => {
  proveedorSeleccionado.value = proveedor
  isHistorialOpen.value = true
  comprasDelProveedor.value = []
  facturaExpandidaId.value = null

  try {
    const res = await api.get('/compras/')
    comprasDelProveedor.value = res.data
      .filter(c => c.proveedor_id === proveedor.id)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  } catch (error) {
    console.error("Error al cargar el historial de compras del proveedor:", error)
  }
}

const guardarProveedor = async () => {
  isSaving.value = true
  try {
    const nitFinal = nuevoProveedor.value.nit && nuevoProveedor.value.nit.trim() !== ''
      ? nuevoProveedor.value.nit
      : `S/N-${Date.now().toString().slice(-6)}`

    const payload = {
      nombre_empresa: nuevoProveedor.value.nombre_empresa,
      nit: nitFinal,
      contacto: nuevoProveedor.value.contacto || null,
      descripcion: nuevoProveedor.value.descripcion || null
    }

    await api.post('/proveedores/', payload) // ✅ Limpio

    showToast(`Proveedor '${payload.nombre_empresa}' registrado con éxito.`, "success")
    isModalOpen.value = false
    nuevoProveedor.value = { nombre_empresa: '', nit: '', contacto: '', descripcion: '' }
    cargarProveedores()
  } catch (error) {
    showToast(error.response?.data?.detail || "Error al guardar proveedor. Verifica que el NIT no exista ya.", "error")
  } finally {
    isSaving.value = false
  }
}

const eliminarProveedor = async (id) => {
  if (!confirm("¿Estás seguro de eliminar este proveedor?")) return
  try {
    await api.delete(`/proveedores/${id}`) // ✅ Limpio
    showToast("Proveedor eliminado correctamente.", "success")
    cargarProveedores()
  } catch (error) {
    showToast(error.response?.data?.detail || "No se pudo eliminar. Puede tener compras asociadas.", "error")
  }
}

onMounted(() => {
  cargarProveedores()
  cargarProductos()
})
</script>