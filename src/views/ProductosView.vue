<template>
  <div class="flex h-screen bg-gray-50 font-sans">
    
    <Sidebar :isOpen="isSidebarOpen" @close="isSidebarOpen = false" />

    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shadow-sm shrink-0 z-10">
        <div class="flex items-center space-x-3">
          <button @click="isSidebarOpen = true" class="lg:hidden text-slate-500 hover:text-slate-800 p-1 focus:outline-none">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <h1 class="text-xl lg:text-2xl font-semibold text-slate-800">Inventario</h1>
        </div>
        <div class="flex items-center">
          <span class="text-xs lg:text-sm font-medium text-gray-600 mr-3 uppercase tracking-wide font-semibold hidden sm:inline-block">{{ nombreUsuario }}</span>
          <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold uppercase border border-blue-200 shadow-sm shrink-0">{{ inicialUsuario }}</div>
        </div>
      </header>

      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 lg:p-8">
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8 max-w-4xl">
          <div class="bg-white p-5 lg:p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-blue-500">
            <p class="text-[10px] lg:text-sm font-medium text-gray-500 uppercase tracking-wider">Total Productos (Catálogo)</p>
            <p class="text-2xl lg:text-3xl font-bold text-slate-800 mt-1 lg:mt-2">{{ productosFiltrados.length }}</p>
          </div>
          <div class="bg-white p-5 lg:p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-red-500">
            <p class="text-[10px] lg:text-sm font-medium text-gray-500 uppercase tracking-wider">Stock Crítico (≤ 5)</p>
            <p class="text-2xl lg:text-3xl font-bold text-red-600 mt-1 lg:mt-2">{{ productosEnPeligro }}</p>
            <p class="text-[10px] lg:text-xs text-gray-400 mt-1">Artículos por reabastecer.</p>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="p-4 lg:p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3 bg-white">
            <div class="relative w-full sm:w-72">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
              <input type="text" v-model="busqueda" placeholder="Buscar producto..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm">
            </div>
            <button @click="isModalOpen = true" class="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center shadow-sm">
              <span class="mr-2">+</span> Nuevo Producto
            </button>
          </div>

          <div class="hidden lg:block overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th class="px-6 py-4 font-medium">Producto</th>
                  <th class="px-6 py-4 font-medium">Categoría</th>
                  <th class="px-6 py-4 font-medium">Precio Venta</th>
                  <th class="px-6 py-4 font-medium">Stock</th>
                  <th class="px-6 py-4 font-medium">Estado</th>
                  <th class="px-6 py-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="text-sm text-gray-700 divide-y divide-gray-200">
                <tr v-for="producto in productosFiltrados" :key="'desk-'+producto.id" class="hover:bg-gray-50 transition">
                  <td class="px-6 py-4">
                    <p class="font-semibold text-slate-900">{{ producto.nombre }}</p>
                    <p class="text-xs text-gray-500">ID: {{ producto.id }}</p>
                  </td>
                  <td class="px-6 py-4">
                    <span class="bg-blue-100 text-blue-700 py-1 px-2 rounded-md text-xs font-bold">{{ getNombreCategoria(producto) }}</span>
                  </td>
                  <td class="px-6 py-4 font-medium">${{ parseFloat(producto.precio_venta).toLocaleString() }}</td>
                  <td class="px-6 py-4 font-bold" :class="producto.stock <= 5 ? 'text-red-600' : 'text-slate-700'">{{ producto.stock }} unid.</td>
                  <td class="px-6 py-4">
                    <span class="py-1 px-3 rounded-full text-xs font-semibold flex inline-flex items-center" :class="producto.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                      <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="producto.stock > 0 ? 'bg-green-500' : 'bg-red-500'"></span> 
                      {{ producto.stock > 0 ? 'Activo' : 'Agotado' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button class="text-slate-400 hover:text-blue-600 mr-3 transition text-base">✏️</button>
                    <button @click="eliminarProducto(producto.id)" class="text-slate-400 hover:text-red-600 transition text-base">🗑️</button>
                  </td>
                </tr>
                <tr v-if="productosFiltrados.length === 0">
                  <td colspan="6" class="px-6 py-8 text-center text-gray-500">No se encontraron productos registrados en el inventario.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="block lg:hidden divide-y divide-gray-100">
            <div v-for="producto in productosFiltrados" :key="'mob-'+producto.id" class="p-4 bg-white hover:bg-slate-50 transition">
              <div class="flex justify-between items-start mb-2">
                <div class="pr-2">
                  <h3 class="font-bold text-slate-900 text-sm leading-tight">{{ producto.nombre }}</h3>
                  <p class="text-[10px] text-gray-500 mt-0.5">ID: {{ producto.id }}</p>
                </div>
                <span class="bg-blue-100 text-blue-700 py-0.5 px-2 rounded-md text-[10px] font-bold whitespace-nowrap shrink-0">{{ getNombreCategoria(producto) }}</span>
              </div>
              
              <div class="flex justify-between items-center mb-3">
                <span class="font-black text-slate-800">${{ parseFloat(producto.precio_venta).toLocaleString() }}</span>
                <span class="font-bold text-sm" :class="producto.stock <= 5 ? 'text-red-600' : 'text-slate-700'">{{ producto.stock }} unid.</span>
              </div>
              
              <div class="flex justify-between items-center pt-3 border-t border-gray-50">
                <span class="py-1 px-2 rounded-full text-[10px] font-semibold flex items-center" :class="producto.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                  <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="producto.stock > 0 ? 'bg-green-500' : 'bg-red-500'"></span> 
                  {{ producto.stock > 0 ? 'Activo' : 'Agotado' }}
                </span>
                <div class="flex space-x-4">
                  <button class="text-slate-400 hover:text-blue-600 transition text-lg active:scale-90">✏️</button>
                  <button @click="eliminarProducto(producto.id)" class="text-slate-400 hover:text-red-600 transition text-lg active:scale-90">🗑️</button>
                </div>
              </div>
            </div>
            <div v-if="productosFiltrados.length === 0" class="px-4 py-8 text-center text-sm text-gray-500">
              No se encontraron productos registrados.
            </div>
          </div>

        </div>
      </main>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div class="px-4 lg:px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
          <h3 class="text-base lg:text-lg font-bold text-slate-800">Registrar Producto</h3>
          <button @click="cerrarModalProducto" class="text-gray-400 hover:text-red-500 transition text-2xl font-semibold leading-none">&times;</button>
        </div>
        
        <div class="overflow-y-auto p-4 lg:p-6">
          <form @submit.prevent="guardarProducto" class="space-y-4">
            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Nombre del Artículo *</label>
                <input type="text" v-model="nuevoProducto.nombre" required placeholder="Ej. Camisa Polo" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm">
              </div>
              <div>
                <label class="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea v-model="nuevoProducto.descripcion" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"></textarea>
              </div>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div class="flex justify-between items-center mb-1">
                  <label class="block text-xs lg:text-sm font-medium text-gray-700">Categoría *</label>
                  <button type="button" @click="isCategoriaRapidaOpen = true" class="text-xs text-blue-600 hover:text-blue-800 font-medium transition">+ Nueva</button>
                </div>
                <select v-model="nuevoProducto.categoria_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm bg-white">
                  <option value="" disabled>Seleccione...</option>
                  <option v-for="cat in listaCategorias" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
                </select>
              </div>
              <div>
                <div class="flex justify-between items-center mb-1">
                  <label class="block text-xs lg:text-sm font-medium text-gray-700">Proveedor *</label>
                  <button type="button" @click="isProveedorRapidoOpen = true" class="text-xs text-blue-600 hover:text-blue-800 font-medium transition">+ Nuevo</button>
                </div>
                <select v-model="nuevoProducto.proveedor_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm bg-white">
                  <option value="" disabled>Seleccione...</option>
                  <option v-for="prov in listaProveedores" :key="prov.id" :value="prov.id">{{ prov.nombre_empresa }}</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Costo *</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                  <input type="number" step="0.01" v-model="nuevoProducto.precio_compra" required class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-semibold text-slate-800">
                </div>
              </div>
              <div>
                <label class="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Venta *</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                  <input type="number" step="0.01" v-model="nuevoProducto.precio_venta" required class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-semibold text-slate-800">
                </div>
              </div>
            </div>

            <div>
              <label class="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Stock Inicial *</label>
              <input type="number" v-model="nuevoProducto.stock" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm">
            </div>

            <div class="border-t border-gray-200 pt-4 mt-2">
              <h4 class="text-[10px] lg:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Especificaciones (Opcional)</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[10px] lg:text-xs font-medium text-gray-600 mb-1">Color</label>
                  <input type="text" v-model="nuevoProducto.color" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm">
                </div>
                <div>
                  <label class="block text-[10px] lg:text-xs font-medium text-gray-600 mb-1">Talla / Tamaño</label>
                  <input type="text" v-model="nuevoProducto.talla" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm">
                </div>
              </div>
            </div>

            <div class="pt-4 flex justify-end space-x-3 border-t border-gray-100 mt-6 sticky bottom-0 bg-white">
              <button type="button" @click="cerrarModalProducto" :disabled="isSavingProducto" class="px-4 py-2 text-xs lg:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">Cancelar</button>
              
              <button type="submit" :disabled="isSavingProducto" class="px-4 py-2 text-xs lg:text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition shadow-sm flex items-center disabled:bg-slate-700 disabled:cursor-not-allowed">
                <svg v-if="isSavingProducto" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isSavingProducto ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="isCategoriaRapidaOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
        <div class="px-4 lg:px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 class="text-sm lg:text-md font-bold text-slate-800">Categoría Rápida</h3>
          <button type="button" @click="cerrarModalCategoria" class="text-gray-400 hover:text-red-500 text-xl font-bold leading-none">&times;</button>
        </div>
        <div class="p-4 lg:p-6 space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Nombre de la Categoría *</label>
            <input type="text" v-model="formCategoriaRapida.nombre" placeholder="Ej. Perfumería" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900">
          </div>
          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-4">
            <button type="button" @click="cerrarModalCategoria" :disabled="isSavingCategoria" class="px-3 py-2 text-xs lg:text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Cancelar</button>
            <button type="button" @click="guardarCategoriaRapida" :disabled="isSavingCategoria" class="px-3 py-2 text-xs lg:text-sm text-white bg-slate-900 rounded-lg hover:bg-slate-800 font-bold shadow-sm flex items-center disabled:bg-slate-700 disabled:cursor-not-allowed">
              {{ isSavingCategoria ? 'Creando...' : 'Crear y Seleccionar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isProveedorRapidoOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
        <div class="px-4 lg:px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 class="text-sm lg:text-md font-bold text-slate-800">Proveedor Rápido</h3>
          <button type="button" @click="cerrarModalProveedor" class="text-gray-400 hover:text-red-500 text-xl font-bold leading-none">&times;</button>
        </div>
        <div class="p-4 lg:p-6 space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Empresa / Nombre *</label>
            <input type="text" v-model="formProveedorRapido.nombre_empresa" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900">
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">NIT (Opcional)</label>
            <input type="text" v-model="formProveedorRapido.nit" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900">
          </div>
          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-4">
            <button type="button" @click="cerrarModalProveedor" :disabled="isSavingProveedor" class="px-3 py-2 text-xs lg:text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Cancelar</button>
            <button type="button" @click="guardarProveedorRapido" :disabled="isSavingProveedor" class="px-3 py-2 text-xs lg:text-sm text-white bg-slate-900 rounded-lg hover:bg-slate-800 font-bold shadow-sm flex items-center disabled:bg-slate-700 disabled:cursor-not-allowed">
              {{ isSavingProveedor ? 'Creando...' : 'Crear y Seleccionar' }}
            </button>
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

// NUEVO: Estado para el menú móvil
const isSidebarOpen = ref(false)

const busqueda = ref('')
const listaProductos = ref([])
const listaCategorias = ref([])
const listaProveedores = ref([]) 
const { showToast } = useToast() 

const isModalOpen = ref(false)
const isSavingProducto = ref(false)
const isSavingCategoria = ref(false)
const isSavingProveedor = ref(false)

const nombreUsuario = ref('Admin')
const inicialUsuario = computed(() => nombreUsuario.value ? nombreUsuario.value.charAt(0).toUpperCase() : 'A')

const isCategoriaRapidaOpen = ref(false)
const formCategoriaRapida = ref({ nombre: '', descripcion: 'Creada desde producto rápido' })

const isProveedorRapidoOpen = ref(false)
const formProveedorRapido = ref({ nombre_empresa: '', nit: '', contacto: '', descripcion: '' })

const nuevoProducto = ref({ nombre: '', descripcion: '', precio_compra: '', precio_venta: '', stock: '', categoria_id: '', proveedor_id: '', color: '', talla: '' })

const productosFiltrados = computed(() => {
  if (!listaProductos.value || !Array.isArray(listaProductos.value)) return []
  if (!busqueda.value) return listaProductos.value
  return listaProductos.value.filter(p => p.nombre.toLowerCase().includes(busqueda.value.toLowerCase()))
})

const productosEnPeligro = computed(() => {
  if (!listaProductos.value || !Array.isArray(listaProductos.value)) return 0
  return listaProductos.value.filter(p => p.stock <= 5).length
})

const getNombreCategoria = (producto) => {
  const id = producto.categoria_id || producto.category_id || (producto.categoria && producto.categoria.id)
  if (!id) return 'Sin categoría'
  if (!listaCategorias.value || !Array.isArray(listaCategorias.value)) return `#${id}`
  const cat = listaCategorias.value.find(c => Number(c.id) === Number(id))
  return cat ? cat.nombre : `Cat #${id}`
}

const cerrarModalProducto = () => {
  isModalOpen.value = false
  nuevoProducto.value = { nombre: '', descripcion: '', precio_compra: '', precio_venta: '', stock: '', categoria_id: '', proveedor_id: '', color: '', talla: '' }
}

const cerrarModalCategoria = () => {
  isCategoriaRapidaOpen.value = false
  formCategoriaRapida.value = { nombre: '', descripcion: 'Creada desde producto rápido' }
}

const cerrarModalProveedor = () => {
  isProveedorRapidoOpen.value = false
  formProveedorRapido.value = { nombre_empresa: '', nit: '', contacto: '', descripcion: '' }
}

const cargarProductos = async () => {
  try {
    const res = await api.get('/productos/')
    listaProductos.value = res.data
  } catch (error) { console.error(error) }
}

const cargarCategorias = async () => {
  try {
    const res = await api.get('/categorias/')
    listaCategorias.value = res.data
  } catch (error) { console.error(error) }
}

const cargarProveedores = async () => {
  try {
    const res = await api.get('/proveedores/')
    listaProveedores.value = res.data
  } catch (error) { console.error(error) }
}

const guardarCategoriaRapida = async () => {
  if (!formCategoriaRapida.value.nombre) {
    showToast("El nombre de la categoría es obligatorio.", "warning")
    return
  }
  
  isSavingCategoria.value = true 
  try {
    const res = await api.post('/categorias/', formCategoriaRapida.value)
    listaCategorias.value.push(res.data)
    nuevoProducto.value.categoria_id = res.data.id
    isCategoriaRapidaOpen.value = false
    formCategoriaRapida.value = { nombre: '', descripcion: 'Creada desde producto rápido' }
    showToast("Categoría rápida creada.", "success")
  } catch (error) { 
    showToast("Error al crear la categoría.", "error") 
  } finally {
    isSavingCategoria.value = false
  }
}

const guardarProveedorRapido = async () => {
  if (!formProveedorRapido.value.nombre_empresa) {
    showToast("El nombre de la empresa es obligatorio.", "warning")
    return
  }
  
  isSavingProveedor.value = true 
  try {
    const nitFinal = formProveedorRapido.value.nit && formProveedorRapido.value.nit.trim() !== '' 
                     ? formProveedorRapido.value.nit 
                     : `S/N-${Date.now().toString().slice(-6)}`

    const payload = {
      nombre_empresa: formProveedorRapido.value.nombre_empresa,
      nit: nitFinal,
      contacto: formProveedorRapido.value.contacto || null,
      descripcion: formProveedorRapido.value.descripcion || 'Creado desde acceso rápido'
    }
    
    const res = await api.post('/proveedores/', payload)
    listaProveedores.value.push(res.data)
    nuevoProducto.value.proveedor_id = res.data.id 
    
    isProveedorRapidoOpen.value = false
    formProveedorRapido.value = { nombre_empresa: '', nit: '', contacto: '', descripcion: '' }
    showToast("Proveedor rápido creado.", "success")
  } catch (error) {
    showToast("Error al registrar proveedor.", "error")
  } finally {
    isSavingProveedor.value = false 
  }
}

const guardarProducto = async () => {
  isSavingProducto.value = true 
  try {
    const specs = {}
    if (nuevoProducto.value.color) specs.color = nuevoProducto.value.color
    if (nuevoProducto.value.talla) specs.talla = nuevoProducto.value.talla

    const datosEnvio = {
      nombre: nuevoProducto.value.nombre,
      descripcion: nuevoProducto.value.descripcion || null,
      precio_compra: parseFloat(nuevoProducto.value.precio_compra),
      precio_venta: parseFloat(nuevoProducto.value.precio_venta),
      stock: parseInt(nuevoProducto.value.stock),
      categoria_id: parseInt(nuevoProducto.value.categoria_id),
      proveedor_id: parseInt(nuevoProducto.value.proveedor_id),
      especificaciones: specs 
    }

    await api.post('/productos/', datosEnvio)
    isModalOpen.value = false
    nuevoProducto.value = { nombre: '', descripcion: '', precio_compra: '', precio_venta: '', stock: '', categoria_id: '', proveedor_id: '', color: '', talla: '' }
    showToast(`Producto registrado con éxito.`, "success")
    cargarProductos()
  } catch (error) { 
    showToast(error.response?.data?.detail || "Error al procesar el guardado del producto.", "error") 
  } finally {
    isSavingProducto.value = false 
  }
}

const eliminarProducto = async (id) => {
  if(!confirm("¿Estás seguro de eliminar este producto?")) return;
  try {
    await api.delete(`/productos/${id}`)
    showToast("Producto eliminado del inventario correctamente.", "success")
    cargarProductos() 
  } catch (error) { 
    showToast("No se pudo eliminar el artículo.", "error") 
  }
}

onMounted(() => {
  cargarProductos()
  cargarCategorias()
  cargarProveedores()

  const usuarioGuardado = localStorage.getItem('usuario') || localStorage.getItem('username') || localStorage.getItem('nombre')
  if (usuarioGuardado) {
    nombreUsuario.value = usuarioGuardado
  }
})
</script>