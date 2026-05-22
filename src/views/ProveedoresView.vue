<template>
  <div class="flex h-screen bg-gray-50 font-sans">
    
    <Sidebar :isOpen="isSidebarOpen" @close="isSidebarOpen = false" />

    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shadow-sm shrink-0 z-10">
        <div class="flex items-center space-x-3">
          <button @click="isSidebarOpen = true" class="lg:hidden text-slate-500 hover:text-slate-800 p-1 focus:outline-none">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <h1 class="text-xl lg:text-2xl font-semibold text-slate-800">Proveedores</h1>
        </div>
        <div class="flex items-center">
          <span class="text-xs lg:text-sm font-medium text-gray-600 mr-3 uppercase tracking-wide font-semibold hidden sm:inline-block">{{ nombreUsuario }}</span>
          <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shadow-sm shrink-0">{{ inicialUsuario }}</div>
        </div>
      </header>

      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 lg:p-8">
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8 max-w-4xl">
          <div class="bg-white p-5 lg:p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-blue-500">
            <p class="text-[10px] lg:text-sm font-medium text-gray-500 uppercase tracking-wider">Total Proveedores</p>
            <p class="text-2xl lg:text-3xl font-bold text-slate-800 mt-1 lg:mt-2">{{ listaProveedores.length }}</p>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="p-4 lg:p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3 bg-white">
            <div class="relative w-full sm:w-72">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
              <input type="text" v-model="busqueda" placeholder="Buscar por empresa o NIT..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm">
            </div>
            <button @click="abrirModalNuevo" class="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center shadow-sm">
              <span class="mr-2">+</span> Nuevo Proveedor
            </button>
          </div>

          <!-- TABLA DESKTOP -->
          <div class="hidden lg:block overflow-x-auto">
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
                <tr v-for="prov in proveedoresFiltrados" :key="'desk-'+prov.id" class="hover:bg-gray-50 transition">
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
                    <!-- ✅ Editar conectado -->
                    <button @click="abrirModalEditar(prov)" title="Editar proveedor" class="text-slate-400 hover:text-slate-800 transition text-lg">✏️</button>
                    <button @click="eliminarProveedor(prov.id)" class="text-slate-400 hover:text-red-600 transition text-lg">🗑️</button>
                  </td>
                </tr>
                <tr v-if="proveedoresFiltrados.length === 0">
                  <td colspan="5" class="px-6 py-8 text-center text-gray-500">No hay proveedores registrados.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- TARJETAS MÓVIL -->
          <div class="block lg:hidden divide-y divide-gray-100">
            <div v-for="prov in proveedoresFiltrados" :key="'mob-'+prov.id" class="p-4 bg-white hover:bg-slate-50 transition">
              <div class="mb-2">
                <h3 class="font-bold text-slate-900 text-base leading-tight">{{ prov.nombre_empresa }}</h3>
                <p class="text-xs text-gray-500 mt-1 italic">{{ prov.descripcion || 'Sin descripción' }}</p>
              </div>
              <div class="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg my-3 border border-gray-100">
                <div>
                  <span class="text-gray-400 block text-[10px] uppercase font-bold">NIT</span>
                  <span class="font-mono text-slate-700 font-semibold">{{ prov.nit }}</span>
                </div>
                <div>
                  <span class="text-gray-400 block text-[10px] uppercase font-bold">Contacto / Tel</span>
                  <span class="text-slate-700 font-semibold truncate block">{{ prov.contacto || 'No registrado' }}</span>
                </div>
              </div>
              <div class="flex justify-between items-center pt-2">
                <button @click="abrirHistorialCompras(prov)" class="text-xs text-blue-600 font-bold bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 active:scale-95 transition-transform">
                  👁️ Libro de Facturas
                </button>
                <div class="flex space-x-4">
                  <!-- ✅ Editar conectado en móvil -->
                  <button @click="abrirModalEditar(prov)" class="text-slate-400 hover:text-slate-800 text-xl active:scale-90">✏️</button>
                  <button @click="eliminarProveedor(prov.id)" class="text-slate-400 hover:text-red-600 text-xl active:scale-90">🗑️</button>
                </div>
              </div>
            </div>
            <div v-if="proveedoresFiltrados.length === 0" class="px-4 py-8 text-center text-sm text-gray-500">
              No se encontraron proveedores.
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- ✅ MODAL CREAR / EDITAR — reutilizado con modoEdicion -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div class="px-4 lg:px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
          <h3 class="text-base lg:text-lg font-bold text-slate-800">
            {{ modoEdicion ? 'Editar Proveedor' : 'Registrar Proveedor' }}
          </h3>
          <button @click="cerrarModal" class="text-gray-400 hover:text-red-500 transition text-2xl font-semibold leading-none">&times;</button>
        </div>
        <form @submit.prevent="guardarProveedor" class="p-4 lg:p-6 space-y-4 overflow-y-auto">
          <div>
            <label class="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Razón Social / Empresa *</label>
            <input type="text" v-model="formProveedor.nombre_empresa" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm">
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs lg:text-sm font-medium text-gray-700 mb-1">NIT</label>
              <input type="text" v-model="formProveedor.nit" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm">
            </div>
            <div>
              <label class="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Teléfono / Contacto</label>
              <input type="text" v-model="formProveedor.contacto" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm">
            </div>
          </div>
          <div>
            <label class="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Descripción / Notas</label>
            <textarea v-model="formProveedor.descripcion" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"></textarea>
          </div>
          <div class="pt-4 flex justify-end space-x-3 border-t border-gray-100 mt-2 sticky bottom-0 bg-white">
            <button type="button" @click="cerrarModal" :disabled="isSaving" class="px-4 py-2 text-xs lg:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">Cancelar</button>
            <button type="submit" :disabled="isSaving" class="px-4 py-2 text-xs lg:text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition flex items-center justify-center disabled:bg-slate-700 disabled:cursor-not-allowed">
              <svg v-if="isSaving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isSaving ? 'Guardando...' : (modoEdicion ? 'Actualizar' : 'Guardar') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL HISTORIAL DE COMPRAS — sin cambios -->
    <div v-if="isHistorialOpen && proveedorSeleccionado" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[95vh]">
        <div class="px-4 lg:px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
          <div>
            <h3 class="text-base lg:text-lg font-bold text-slate-800">Libro de Compras y Surtidos</h3>
            <p class="text-xs lg:text-sm text-gray-500 font-medium mt-0.5">Proveedor: <span class="text-slate-800 font-bold">{{ proveedorSeleccionado.nombre_empresa }}</span></p>
            <p class="text-[10px] text-blue-600 font-bold mt-1">💡 Toca una factura para ver sus artículos.</p>
          </div>
          <button @click="isHistorialOpen = false" class="text-gray-400 hover:text-red-500 transition text-2xl font-semibold leading-none p-1">&times;</button>
        </div>
        
        <div class="p-2 sm:p-6 overflow-y-auto flex-1 bg-gray-50/50">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs lg:text-sm min-w-[450px]">
              <thead>
                <tr class="bg-slate-100 text-slate-600 text-[10px] lg:text-xs uppercase border-b border-slate-200">
                  <th class="px-3 py-3 font-medium">Fecha / Hora</th>
                  <th class="px-3 py-3 font-medium">N° Factura</th>
                  <th class="px-3 py-3 font-medium text-right">Monto</th>
                </tr>
              </thead>
              <tbody class="text-gray-700">
                <template v-for="compra in comprasDelProveedor" :key="compra.id">
                  <tr @click="toggleFactura(compra.id)" class="border-b border-gray-100 hover:bg-slate-100/80 cursor-pointer transition">
                    <td class="px-3 py-3 text-gray-500 flex items-center select-none font-medium">
                      <span class="mr-1.5 text-[9px] transition-transform duration-200 inline-block text-slate-400"
                            :class="facturaExpandidaId === compra.id ? 'transform rotate-90 text-blue-600' : ''">▶</span>
                      {{ formatearFecha(compra.fecha) }}
                    </td>
                    <td class="px-3 py-3 font-bold text-slate-800">{{ compra.numero_factura }}</td>
                    <td class="px-3 py-3 text-right font-black text-slate-900">${{ parseFloat(compra.total).toLocaleString() }}</td>
                  </tr>
                  <tr v-if="facturaExpandidaId === compra.id" class="bg-blue-50/30">
                    <td colspan="3" class="px-2 sm:px-4 py-3">
                      <div class="bg-white border border-blue-100 rounded-xl p-3 shadow-sm overflow-x-auto">
                        <h4 class="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center">
                          <span class="mr-1">📦</span> Items en esta orden:
                        </h4>
                        <table class="w-full text-left text-[11px] border-collapse min-w-[350px]">
                          <thead>
                            <tr class="text-gray-400 uppercase tracking-tight border-b border-gray-100">
                              <th class="pb-1.5 font-semibold">Producto</th>
                              <th class="pb-1.5 text-center font-semibold">Cant.</th>
                              <th class="pb-1.5 text-right font-semibold">Costo U.</th>
                              <th class="pb-1.5 text-right font-semibold">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-gray-50 text-slate-700">
                            <tr v-for="item in compra.detalles" :key="item.id">
                              <td class="py-2 font-bold text-slate-800">{{ item.nombre_producto || getNombreProducto(item.producto_id) }}</td>
                              <td class="py-2 text-center font-medium"><span class="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">{{ item.cantidad }} u.</span></td>
                              <td class="py-2 text-right text-gray-500">${{ parseFloat(item.precio_compra).toLocaleString() }}</td>
                              <td class="py-2 text-right font-bold text-slate-900">${{ (item.cantidad * parseFloat(item.precio_compra)).toLocaleString() }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                </template>
                <tr v-if="comprasDelProveedor.length === 0">
                  <td colspan="3" class="px-3 py-8 text-center text-gray-400">No se han registrado compras a este proveedor.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="px-4 lg:px-6 py-4 border-t border-gray-200 bg-white flex justify-between items-center shrink-0">
          <span class="text-xs lg:text-sm font-bold text-gray-500 uppercase tracking-wider">Histórico:</span>
          <span class="text-xl lg:text-2xl font-black text-slate-900">${{ totalInvertido.toLocaleString() }}</span>
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
const nombreUsuario = ref('Admin')
const inicialUsuario = computed(() => nombreUsuario.value ? nombreUsuario.value.charAt(0).toUpperCase() : 'A')

const listaProveedores = ref([])
const listaProductos   = ref([])
const busqueda         = ref('')
const isModalOpen      = ref(false)
const isSaving         = ref(false)

// ✅ Un solo formulario para crear y editar
const modoEdicion        = ref(false)
const proveedorEditandoId = ref(null)
const formProveedor = ref({ nombre_empresa: '', nit: '', contacto: '', descripcion: '' })

const isHistorialOpen      = ref(false)
const proveedorSeleccionado = ref(null)
const comprasDelProveedor  = ref([])
const facturaExpandidaId   = ref(null)

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

// ✅ Abrir modal en modo CREAR
const abrirModalNuevo = () => {
  modoEdicion.value = false
  proveedorEditandoId.value = null
  formProveedor.value = { nombre_empresa: '', nit: '', contacto: '', descripcion: '' }
  isModalOpen.value = true
}

// ✅ Abrir modal en modo EDITAR — precarga los datos del proveedor
const abrirModalEditar = (prov) => {
  modoEdicion.value = true
  proveedorEditandoId.value = prov.id
  formProveedor.value = {
    nombre_empresa: prov.nombre_empresa,
    nit: prov.nit || '',
    contacto: prov.contacto || '',
    descripcion: prov.descripcion || ''
  }
  isModalOpen.value = true
}

const cerrarModal = () => {
  isModalOpen.value = false
  modoEdicion.value = false
  proveedorEditandoId.value = null
  formProveedor.value = { nombre_empresa: '', nit: '', contacto: '', descripcion: '' }
}

// ✅ Guardar: POST si es nuevo, PATCH si es edición
const guardarProveedor = async () => {
  if (!formProveedor.value.nombre_empresa) return
  isSaving.value = true
  try {
    if (modoEdicion.value) {
      // EDITAR — solo envía los campos que tienen valor
      const payload = {
        nombre_empresa: formProveedor.value.nombre_empresa,
        nit: formProveedor.value.nit || null,
        contacto: formProveedor.value.contacto || null,
        descripcion: formProveedor.value.descripcion || null
      }
      await api.patch(`/proveedores/${proveedorEditandoId.value}`, payload)
      showToast(`Proveedor '${payload.nombre_empresa}' actualizado correctamente.`, 'success')
    } else {
      // CREAR — autogenera NIT si no se proporcionó
      const nitFinal = formProveedor.value.nit && formProveedor.value.nit.trim() !== ''
        ? formProveedor.value.nit
        : `S/N-${Date.now().toString().slice(-6)}`
      const payload = {
        nombre_empresa: formProveedor.value.nombre_empresa,
        nit: nitFinal,
        contacto: formProveedor.value.contacto || null,
        descripcion: formProveedor.value.descripcion || null
      }
      await api.post('/proveedores/', payload)
      showToast(`Proveedor '${payload.nombre_empresa}' registrado con éxito.`, 'success')
    }
    cerrarModal()
    cargarProveedores()
  } catch (error) {
    showToast(error.response?.data?.detail || 'Error al guardar proveedor.', 'error')
  } finally {
    isSaving.value = false
  }
}

const eliminarProveedor = async (id) => {
  if (!confirm('¿Estás seguro de eliminar este proveedor?')) return
  try {
    await api.delete(`/proveedores/${id}`)
    showToast('Proveedor eliminado correctamente.', 'success')
    cargarProveedores()
  } catch (error) {
    showToast(error.response?.data?.detail || 'No se pudo eliminar. Puede tener compras asociadas.', 'error')
  }
}

const toggleFactura = (id) => {
  facturaExpandidaId.value = facturaExpandidaId.value === id ? null : id
}

const getNombreProducto = (id) => {
  const prod = listaProductos.value.find(p => Number(p.id) === Number(id))
  return prod ? prod.nombre : `Artículo #${id}`
}

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '-'
  return new Date(fechaStr).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
}

const cargarProductos = async () => {
  try {
    const res = await api.get('/productos/')
    listaProductos.value = res.data
  } catch (error) { console.error('Error al cargar productos:', error) }
}

const cargarProveedores = async () => {
  try {
    const res = await api.get('/proveedores/')
    listaProveedores.value = res.data
  } catch (error) { console.error('Error al cargar proveedores:', error) }
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
  } catch (error) { console.error('Error al cargar historial:', error) }
}

onMounted(() => {
  cargarProveedores()
  cargarProductos()
  const usuarioGuardado = localStorage.getItem('usuario') || localStorage.getItem('username') || localStorage.getItem('nombre')
  if (usuarioGuardado) nombreUsuario.value = usuarioGuardado
})
</script>