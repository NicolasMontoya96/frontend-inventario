<template>
  <div class="flex h-screen bg-gray-50 font-sans">
    
    <Sidebar/>

    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
        <h1 class="text-2xl font-semibold text-slate-800">Inventario de Productos</h1>
        <div class="flex items-center">
          <span class="text-sm font-medium text-gray-600 mr-4 uppercase tracking-wide font-semibold">{{ nombreUsuario }}</span>
          <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold uppercase border border-blue-200 shadow-sm">{{ inicialUsuario }}</div>
        </div>
      </header>

      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-4xl">
          <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-blue-500">
            <p class="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Productos (Catálogo)</p>
            <p class="text-3xl font-bold text-slate-800 mt-2">{{ productosFiltrados.length }}</p>
          </div>
          <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-red-500">
            <p class="text-sm font-medium text-gray-500 uppercase tracking-wider">Productos en Stock Crítico (≤ 5)</p>
            <p class="text-3xl font-bold text-red-600 mt-2">{{ productosEnPeligro }}</p>
            <p class="text-xs text-gray-400 mt-1">Tipos de artículos que deben reabastecerse.</p>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="p-6 border-b border-gray-200 flex justify-between items-center bg-white">
            <div class="relative w-72">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
              <input type="text" v-model="busqueda" placeholder="Buscar producto por nombre..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm">
            </div>
            <button @click="isModalOpen = true" class="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center shadow-sm">
              <span class="mr-2">+</span> Nuevo Producto
            </button>
          </div>

          <div class="overflow-x-auto">
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
                <tr v-for="producto in productosFiltrados" :key="producto.id" class="hover:bg-gray-50 transition">
                  <td class="px-6 py-4">
                    <p class="font-semibold text-slate-900">{{ producto.nombre }}</p>
                    <p class="text-xs text-gray-500">ID: {{ producto.id }}</p>
                  </td>
                  <td class="px-6 py-4">
                    <span class="bg-blue-100 text-blue-700 py-1 px-2 rounded-md text-xs font-bold">
                      {{ getNombreCategoria(producto.categoria_id) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 font-medium">${{ parseFloat(producto.precio_venta).toLocaleString() }}</td>
                  <td class="px-6 py-4 font-bold" :class="producto.stock <= 5 ? 'text-red-600' : 'text-slate-700'">
                    {{ producto.stock }} unid.
                  </td>
                  <td class="px-6 py-4">
                    <span class="py-1 px-3 rounded-full text-xs font-semibold flex inline-flex items-center"
                          :class="producto.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                      <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="producto.stock > 0 ? 'bg-green-500' : 'bg-red-500'"></span> 
                      {{ producto.stock > 0 ? 'Activo' : 'Agotado' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button class="text-slate-400 hover:text-blue-600 mr-3 transition">✏️</button>
                    <button @click="eliminarProducto(producto.id)" class="text-slate-400 hover:text-red-600 transition">🗑️</button>
                  </td>
                </tr>
                <tr v-if="productosFiltrados.length === 0">
                  <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    No se encontraron productos registrados en el inventario.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 class="text-lg font-bold text-slate-800">Registrar Producto</h3>
          <button @click="cerrarModalProducto" class="text-gray-400 hover:text-red-500 transition text-2xl font-semibold leading-none">&times;</button>
        </div>
        
        <form @submit.prevent="guardarProducto" class="p-6 space-y-4">
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Artículo *</label>
              <input type="text" v-model="nuevoProducto.nombre" required placeholder="Ej. Camisa Polo" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea v-model="nuevoProducto.descripcion" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"></textarea>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="flex justify-between items-center mb-1">
                <label class="block text-sm font-medium text-gray-700">Categoría *</label>
                <button type="button" @click="isCategoriaRapidaOpen = true" class="text-xs text-blue-600 hover:text-blue-800 font-medium transition">+ Nueva</button>
              </div>
              <select v-model="nuevoProducto.categoria_id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm bg-white">
                <option value="" disabled>Seleccione...</option>
                <option v-for="cat in listaCategorias" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
              </select>
            </div>
            <div>
              <div class="flex justify-between items-center mb-1">
                <label class="block text-sm font-medium text-gray-700">Proveedor *</label>
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
              <label class="block text-sm font-medium text-gray-700 mb-1">Precio de Costo *</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                <input type="number" step="0.01" v-model="nuevoProducto.precio_costo" required placeholder="A cómo compras" class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-semibold text-slate-800">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Precio de Venta *</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                <input type="number" step="0.01" v-model="nuevoProducto.precio_venta" required placeholder="A cómo vendes" class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-semibold text-slate-800">
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Stock Inicial *</label>
            <input type="number" v-model="nuevoProducto.stock" required placeholder="Cantidad disponible" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm">
          </div>

          <div class="border-t border-gray-200 pt-4 mt-2">
            <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Especificaciones (Opcional)</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Color</label>
                <input type="text" v-model="nuevoProducto.color" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm">
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Talla / Tamaño</label>
                <input type="text" v-model="nuevoProducto.talla" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm">
              </div>
            </div>
          </div>

          <div class="pt-4 flex justify-end space-x-3 border-t border-gray-100 mt-6">
            <button type="button" @click="cerrarModalProducto" :disabled="isSavingProducto" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">Cancelar</button>
            
            <button type="submit" :disabled="isSavingProducto" class="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition shadow-sm flex items-center disabled:bg-slate-700 disabled:cursor-not-allowed">
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

    <div v-if="isCategoriaRapidaOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60]">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 class="text-md font-bold text-slate-800">Categoría Rápida</h3>
          <button type="button" @click="cerrarModalCategoria" class="text-gray-400 hover:text-red-500 text-xl font-bold leading-none">&times;</button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Nombre de la Categoría *</label>
            <input type="text" v-model="formCategoriaRapida.nombre" placeholder="Ej. Perfumería, Accesorios" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900">
          </div>
          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-4">
            <button type="button" @click="cerrarModalCategoria" :disabled="isSavingCategoria" class="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Cancelar</button>
            
            <button type="button" @click="guardarCategoriaRapida" :disabled="isSavingCategoria" class="px-4 py-2 text-sm text-white bg-slate-900 rounded-lg hover:bg-slate-800 font-bold shadow-sm flex items-center disabled:bg-slate-700 disabled:cursor-not-allowed">
              <svg v-if="isSavingCategoria" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isSavingCategoria ? 'Creando...' : 'Crear y Seleccionar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isProveedorRapidoOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60]">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 class="text-md font-bold text-slate-800">Proveedor Rápido</h3>
          <button type="button" @click="cerrarModalProveedor" class="text-gray-400 hover:text-red-500 text-xl font-bold leading-none">&times;</button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Empresa / Nombre *</label>
            <input type="text" v-model="formProveedorRapido.nombre_empresa" placeholder="Ej. Distribuidora del Valle" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900">
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">NIT (Opcional)</label>
            <input type="text" v-model="formProveedorRapido.nit" placeholder="Ej. Dejar vacío si no tiene" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900">
          </div>
          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-4">
            <button type="button" @click="cerrarModalProveedor" :disabled="isSavingProveedor" class="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Cancelar</button>
            
            <button type="button" @click="guardarProveedorRapido" :disabled="isSavingProveedor" class="px-4 py-2 text-sm text-white bg-slate-900 rounded-lg hover:bg-slate-800 font-bold shadow-sm flex items-center disabled:bg-slate-700 disabled:cursor-not-allowed">
              <svg v-if="isSavingProveedor" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
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
import api from '../api/axios' // MODIFICADO: Importamos nuestra instancia centralizada
import Sidebar from '../components/Sidebar.vue'
import { useToast } from '../composables/useToast' 

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

const nuevoProducto = ref({ nombre: '', descripcion: '', precio_costo: '', precio_venta: '', stock: '', categoria_id: '', proveedor_id: '', color: '', talla: '' })

// --- MODIFICADO: COMPUTADOS BLINDADOS CONTRA ARREGLOS VACÍOS U UNDEFINED ---
const productosFiltrados = computed(() => {
  if (!listaProductos.value || !Array.isArray(listaProductos.value)) return []
  if (!busqueda.value) return listaProductos.value
  return listaProductos.value.filter(p => p.nombre.toLowerCase().includes(busqueda.value.toLowerCase()))
})

const productosEnPeligro = computed(() => {
  if (!listaProductos.value || !Array.isArray(listaProductos.value)) return 0
  return listaProductos.value.filter(p => p.stock <= 5).length
})

// --- RESOLVER NOMBRE DE CATEGORÍA ---
const getNombreCategoria = (id) => {
  if (!listaCategorias.value || !Array.isArray(listaCategorias.value)) return `#${id}`
  const cat = listaCategorias.value.find(c => c.id === id)
  return cat ? cat.nombre : `#${id}`
}

// --- FUNCIONES DE CIERRE CON RESETEO ---
const cerrarModalProducto = () => {
  isModalOpen.value = false
  nuevoProducto.value = { nombre: '', descripcion: '', precio_costo: '', precio_venta: '', stock: '', categoria_id: '', proveedor_id: '', color: '', talla: '' }
}

const cerrarModalCategoria = () => {
  isCategoriaRapidaOpen.value = false
  formCategoriaRapida.value = { nombre: '', descripcion: 'Creada desde producto rápido' }
}

const cerrarModalProveedor = () => {
  isProveedorRapidoOpen.value = false
  formProveedorRapido.value = { nombre_empresa: '', nit: '', contacto: '', descripcion: '' }
}

// --- CARGA DE DATOS CENTRALIZADA ---
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
    showToast("Categoría rápida creada e insertada.", "success")
  } catch (error) { 
    console.error(error)
    showToast("Error al crear la categoría. Es posible que el nombre ya exista.", "error") 
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
    showToast("Proveedor rápido creado e insertado.", "success")
  } catch (error) {
    console.error(error)
    showToast("Error al registrar proveedor rápido. Es posible que este NIT ya exista.", "error")
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
      precio_costo: parseFloat(nuevoProducto.value.precio_costo),
      precio_venta: parseFloat(nuevoProducto.value.precio_venta),
      stock: parseInt(nuevoProducto.value.stock),
      categoria_id: parseInt(nuevoProducto.value.categoria_id),
      proveedor_id: parseInt(nuevoProducto.value.proveedor_id),
      especificaciones: specs 
    }

    await api.post('/productos/', datosEnvio)
    isModalOpen.value = false
    nuevoProducto.value = { nombre: '', descripcion: '', precio_costo: '', precio_venta: '', stock: '', categoria_id: '', proveedor_id: '', color: '', talla: '' }
    showToast(`Producto '${datosEnvio.nombre}' registrado con éxito.`, "success")
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
    showToast("No se pudo eliminar el artículo. Es posible que esté enlazado a facturas existentes.", "error") 
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