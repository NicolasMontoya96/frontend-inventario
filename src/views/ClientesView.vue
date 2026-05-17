<template>
  <div class="flex h-screen bg-gray-50 font-sans">
    
    <Sidebar :isOpen="isSidebarOpen" @close="isSidebarOpen = false" />

    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shadow-sm shrink-0 z-10">
        <div class="flex items-center space-x-3">
          <button @click="isSidebarOpen = true" class="lg:hidden text-slate-500 hover:text-slate-800 p-1 focus:outline-none">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <h1 class="text-xl lg:text-2xl font-semibold text-slate-800">Clientes y Carteras</h1>
        </div>
        <div class="flex items-center">
          <span class="text-xs lg:text-sm font-medium text-gray-600 mr-3 uppercase tracking-wide font-semibold hidden sm:inline-block">{{ nombreUsuario }}</span>
          <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold uppercase border border-blue-200 shadow-sm shrink-0">{{ inicialUsuario }}</div>
        </div>
      </header>

      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 lg:p-8">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div class="bg-white p-5 lg:p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-blue-500">
            <p class="text-[10px] lg:text-sm font-medium text-gray-500 uppercase tracking-wider">Total Clientes</p>
            <p class="text-2xl lg:text-3xl font-bold text-slate-800 mt-1 lg:mt-2">{{ listaClientes.length }}</p>
          </div>
          <div class="bg-white p-5 lg:p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-orange-500">
            <p class="text-[10px] lg:text-sm font-medium text-gray-500 uppercase tracking-wider">Clientes con Deuda</p>
            <p class="text-2xl lg:text-3xl font-bold text-red-600 mt-1 lg:mt-2">{{ clientesConDeuda }}</p>
          </div>
          <div class="bg-white p-5 lg:p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-red-500">
            <p class="text-[10px] lg:text-sm font-medium text-gray-500 uppercase tracking-wider">Total Cartera por Cobrar</p>
            <p class="text-2xl lg:text-3xl font-black text-slate-800 mt-1 lg:mt-2">${{ totalCartera.toLocaleString() }}</p>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="p-4 lg:p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3 bg-white">
            <div class="relative w-full sm:w-72">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
              <input type="text" v-model="busqueda" placeholder="Buscar cliente por nombre..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm">
            </div>
            <button @click="abrirModalCrear" class="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center shadow-sm">
              <span class="mr-2">+</span> Nuevo Cliente
            </button>
          </div>

          <div class="hidden lg:block overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th class="px-6 py-4 font-medium">Cliente</th>
                  <th class="px-6 py-4 font-medium">Contacto / Correo</th>
                  <th class="px-6 py-4 font-medium">Estado Cuenta</th>
                  <th class="px-6 py-4 font-medium">Saldo Deuda</th>
                  <th class="px-6 py-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="text-sm text-gray-700 divide-y divide-gray-200">
                <tr v-for="cliente in clientesFiltrados" :key="'desk-'+cliente.id" class="hover:bg-gray-50 transition">
                  <td class="px-6 py-4">
                    <p class="font-semibold text-slate-900">{{ cliente.nombre }} {{ cliente.apellido || '' }}</p>
                    <p class="text-xs text-gray-500">ID: {{ cliente.id }}</p>
                  </td>
                  <td class="px-6 py-4">
                    <p class="font-medium text-slate-700">{{ cliente.telefono || 'Sin teléfono' }}</p>
                    <p class="text-xs text-gray-400">{{ cliente.email }}</p>
                  </td>
                  <td class="px-6 py-4">
                    <span class="py-1 px-3 rounded-full text-xs font-semibold" :class="parseFloat(cliente.saldo_deuda) > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
                      {{ parseFloat(cliente.saldo_deuda) > 0 ? 'Con Deuda' : 'Al Día' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 font-bold" :class="parseFloat(cliente.saldo_deuda) > 0 ? 'text-red-600' : 'text-green-600'">
                    ${{ parseFloat(cliente.saldo_deuda).toLocaleString() }}
                  </td>
                  <td class="px-6 py-4 text-right space-x-2">
                    <button @click="abrirHistorialCompleto(cliente)" title="Ver Historial Financiero" class="text-slate-400 hover:text-blue-600 transition text-lg">👁️</button>
                    <button @click="abrirModalEditar(cliente)" title="Editar Perfil" class="text-slate-400 hover:text-slate-800 transition text-lg">✏️</button>
                    <button disabled title="Preservar historial contable" class="text-gray-300 cursor-not-allowed opacity-30 text-lg select-none">🗑️</button>
                  </td>
                </tr>
                <tr v-if="clientesFiltrados.length === 0">
                  <td colspan="5" class="px-6 py-8 text-center text-gray-500">No se encontraron clientes registrados.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="block lg:hidden divide-y divide-gray-100">
            <div v-for="cliente in clientesFiltrados" :key="'mob-'+cliente.id" class="p-4 bg-white hover:bg-slate-50 transition">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h3 class="font-bold text-slate-900 text-sm leading-tight">{{ cliente.nombre }} {{ cliente.apellido || '' }}</h3>
                  <p class="text-[10px] text-gray-500 mt-0.5">ID: {{ cliente.id }}</p>
                </div>
                <span class="py-0.5 px-2 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0" :class="parseFloat(cliente.saldo_deuda) > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
                  {{ parseFloat(cliente.saldo_deuda) > 0 ? 'Con Deuda' : 'Al Día' }}
                </span>
              </div>
              
              <div class="text-xs space-y-0.5 text-slate-600 mb-3">
                <p v-if="cliente.telefono"><span class="text-gray-400 font-medium">Tel:</span> {{ cliente.telefono }}</p>
                <p v-if="cliente.email"><span class="text-gray-400 font-medium">Email:</span> {{ cliente.email }}</p>
              </div>
              
              <div class="flex justify-between items-center pt-2.5 border-t border-gray-100">
                <div>
                  <span class="text-[9px] uppercase tracking-wider font-bold text-gray-400 block leading-none">Saldo Pendiente</span>
                  <span class="text-sm font-black mt-1 block" :class="parseFloat(cliente.saldo_deuda) > 0 ? 'text-red-600' : 'text-green-600'">
                    ${{ parseFloat(cliente.saldo_deuda).toLocaleString() }}
                  </span>
                </div>
                <div class="flex space-x-3 items-center">
                  <button @click="abrirHistorialCompleto(cliente)" class="text-xs text-blue-700 bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg font-bold active:scale-95 transition-transform">
                    👁️ Ver Estado
                  </button>
                  <button @click="abrirModalEditar(cliente)" class="text-slate-400 hover:text-slate-800 text-xl p-1 active:scale-90">✏️</button>
                </div>
              </div>
            </div>
            <div v-if="clientesFiltrados.length === 0" class="px-4 py-8 text-center text-sm text-gray-500">
              No se encontraron clientes registrados.
            </div>
          </div>

        </div>
      </main>
    </div>

    <div v-if="isFormModalOpen" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div class="px-4 lg:px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
          <h3 class="text-base lg:text-lg font-bold text-slate-800">{{ isEditing ? 'Modificar Perfil de Cliente' : 'Registrar Cliente' }}</h3>
          <button @click="isFormModalOpen = false" class="text-gray-400 hover:text-red-500 transition text-2xl font-semibold leading-none p-1">&times;</button>
        </div>
        
        <form @submit.prevent="guardarCliente" class="p-4 lg:p-6 space-y-4 overflow-y-auto">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input type="text" v-model="formCliente.nombre" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white">
            </div>
            <div>
              <label class="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input type="text" v-model="formCliente.apellido" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white">
            </div>
          </div>
          <div>
            <label class="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Correo Electrónico *</label>
            <input type="email" v-model="formCliente.email" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white">
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Teléfono / Celular</label>
              <input type="text" v-model="formCliente.telefono" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white">
            </div>
            <div>
              <label class="block text-xs lg:text-sm font-medium text-gray-700 mb-1">Saldo Base Deuda</label>
              <input type="number" v-model="formCliente.saldo_deuda" :disabled="isEditing" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 disabled:opacity-60 focus:outline-none">
            </div>
          </div>
          <div class="pt-4 flex justify-end space-x-3 border-t border-gray-100 mt-6 sticky bottom-0 bg-white">
            <button type="button" @click="isFormModalOpen = false" :disabled="isSavingCliente" class="px-4 py-2 text-xs lg:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">Cancelar</button>
            <button type="submit" :disabled="isSavingCliente || isFormClienteInvalido" class="px-4 py-2 text-xs lg:text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition shadow-sm flex items-center justify-center disabled:bg-slate-400 disabled:cursor-not-allowed">
              <svg v-if="isSavingCliente" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isSavingCliente ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="isHistorialModalOpen && clienteSeleccionado" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[93vh]">
        <div class="px-4 lg:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 shrink-0 gap-3">
          <div>
            <h3 class="text-base lg:text-lg font-bold text-slate-800">Estado de Cuenta Integral</h3>
            <p class="text-xs text-gray-500 font-medium mt-0.5">Cliente: <span class="text-slate-800 font-bold">{{ clienteSeleccionado?.nombre }} {{ clienteSeleccionado?.apellido || '' }}</span></p>
          </div>
          
          <div class="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
            <div class="flex space-x-1.5">
              <button @click="exportarReporte('pdf')" class="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1.5 rounded-lg text-[10px] lg:text-xs font-bold transition shadow-sm whitespace-nowrap">📄 PDF</button>
              <button @click="exportarReporte('excel')" class="bg-green-700 hover:bg-green-800 text-white px-2.5 py-1.5 rounded-lg text-[10px] lg:text-xs font-bold transition shadow-sm whitespace-nowrap">📊 Excel</button>
            </div>
            <span class="text-gray-300 text-lg hidden sm:inline">|</span>
            <button @click="isHistorialModalOpen = false" class="text-gray-400 hover:text-red-500 transition text-2xl font-semibold leading-none p-1">&times;</button>
          </div>
        </div>
        
        <div class="p-3 lg:p-6 overflow-y-auto flex-1 bg-gray-50/50">
          <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs lg:text-sm min-w-[500px]">
                <thead>
                  <tr class="bg-slate-50 text-slate-500 text-[10px] lg:text-xs uppercase border-b border-gray-200">
                    <th class="px-3 py-3 font-medium">Fecha y Hora</th>
                    <th class="px-3 py-3 font-medium">Tipo</th>
                    <th class="px-3 py-3 font-medium">Concepto</th>
                    <th class="px-3 py-3 font-medium text-right">Cargo (+)</th>
                    <th class="px-3 py-3 font-medium text-right">Abono (-)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 text-gray-700">
                  <tr v-for="(mov, idx) in lineaTimelineCliente" :key="idx" class="hover:bg-slate-50">
                    <td class="px-3 py-3 text-gray-500 text-[11px] font-medium">{{ formatearFecha(mov.fecha) }}</td>
                    <td class="px-3 py-3">
                      <span :class="mov.tipo === 'COMPRA' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-green-50 text-green-700 border-green-100'" class="px-2 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap">
                        {{ mov.tipo === 'COMPRA' ? 'Factura' : 'Recibo' }}
                      </span>
                    </td>
                    <td class="px-3 py-3 font-medium text-slate-600">{{ mov.concepto }}</td>
                    <td class="px-3 py-3 text-right font-semibold text-slate-800">{{ mov.tipo === 'COMPRA' ? '$' + mov.monto.toLocaleString() : '-' }}</td>
                    <td class="px-3 py-3 text-right font-bold text-green-600">{{ mov.tipo === 'ABONO' ? '$' + mov.monto.toLocaleString() : '-' }}</td>
                  </tr>
                  <tr v-if="lineaTimelineCliente.length === 0">
                    <td colspan="5" class="p-6 text-center text-gray-400">No hay transacciones comerciales registradas.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div class="px-4 lg:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center shrink-0 gap-4" :class="clienteSeleccionado?.saldo_deuda > 0 ? 'bg-red-50/60' : 'bg-white'">
          
          <div v-if="clienteSeleccionado?.saldo_deuda > 0" class="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">Nuevo Recaudo:</span>
            <div class="flex items-center gap-2">
              <div class="relative w-28 sm:w-40">
                <span class="absolute inset-y-0 left-0 flex items-center pl-2.5 text-sm">💵</span>
                <input 
                  type="number" 
                  v-model.number="montoAbono"
                  placeholder="Abonar..." 
                  :max="clienteSeleccionado?.saldo_deuda"
                  :disabled="isSavingAbono"
                  class="w-full pl-7 pr-2 py-1.5 border border-gray-300 rounded-lg text-xs sm:text-sm font-bold focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white disabled:opacity-50"
                />
              </div>
              
              <button 
                @click="procesarAbonoCliente"
                :disabled="isSavingAbono || isMontoAbonoInvalido"
                class="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition shadow-sm flex items-center shrink-0 disabled:bg-gray-300"
              >
                {{ isSavingAbono ? '...' : 'Aplicar' }}
              </button>
            </div>
          </div>
          <div v-else class="text-xs lg:text-sm font-bold text-green-600 uppercase tracking-wider flex items-center w-full sm:w-auto">
            <span class="mr-1.5 text-base">✅</span> Cliente al día
          </div>

          <div class="text-right w-full sm:w-auto flex justify-between sm:block border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-200">
            <p class="text-[10px] lg:text-xs font-bold text-gray-500 uppercase tracking-wider">Saldo Pendiente:</p>
            <p class="text-xl lg:text-2xl font-black" :class="clienteSeleccionado?.saldo_deuda > 0 ? 'text-red-600' : 'text-slate-800'">
              ${{ parseFloat(clienteSeleccionado?.saldo_deuda || 0).toLocaleString() }}
            </p>
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

const listaClientes = ref([])
const busqueda = ref('')
const { showToast } = useToast()

// NUEVO: Estado responsivo para el menú lateral móvil
const isSidebarOpen = ref(false)

const isFormModalOpen = ref(false)
const isHistorialModalOpen = ref(false)
const isEditing = ref(false)
const idClienteEditando = ref(null)

const isSavingCliente = ref(false)
const isSavingAbono = ref(false)

const clienteSeleccionado = ref(null)
const ventasCliente = ref([])
const abonosCliente = ref([])

const nombreUsuario = ref('Admin')
const inicialUsuario = computed(() => nombreUsuario.value ? nombreUsuario.value.charAt(0).toUpperCase() : 'A')

const formCliente = ref({ nombre: '', apellido: '', email: '', telefono: '', saldo_deuda: 0 })
const montoAbono = ref(null)

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isFormClienteInvalido = computed(() => {
  const nombre = formCliente.value.nombre ? formCliente.value.nombre.trim() : ''
  const email = formCliente.value.email ? formCliente.value.email.trim() : ''
  const saldo = parseFloat(formCliente.value.saldo_deuda || 0)
  return !nombre || !email || !emailRegex.test(email) || saldo < 0
})

const isMontoAbonoInvalido = computed(() => {
  const monto = parseFloat(montoAbono.value || 0)
  if (monto <= 0) return true
  if (clienteSeleccionado.value && monto > parseFloat(clienteSeleccionado.value.saldo_deuda || 0)) {
    return true
  }
  return false
})

const clientesFiltrados = computed(() => {
  if (!busqueda.value) return listaClientes.value
  return listaClientes.value.filter(c => `${c.nombre} ${c.apellido || ''}`.toLowerCase().includes(busqueda.value.toLowerCase()))
})

const totalCartera = computed(() => listaClientes.value.reduce((sum, c) => sum + parseFloat(c.saldo_deuda || 0), 0))
const clientesConDeuda = computed(() => listaClientes.value.filter(c => parseFloat(c.saldo_deuda || 0) > 0).length)

const procesarAbonoCliente = async () => {
  if (isMontoAbonoInvalido.value) {
    showToast("Monto de abono inválido o superior a la deuda actual.", "warning")
    return
  }

  isSavingAbono.value = true 
  try {
    const payload = {
      cliente_id: clienteSeleccionado.value.id,
      monto_pagado: parseFloat(montoAbono.value)
    }

    await api.post('/clientes/abonos', payload)

    showToast(`¡Abono de $${payload.monto_pagado.toLocaleString()} registrado con éxito!`, "success")
    
    await cargarClientes() 
    const clienteActualizado = listaClientes.value.find(c => c.id === clienteSeleccionado.value.id)
    await abrirHistorialCompleto(clienteActualizado)

  } catch (error) {
    console.error("Error al registrar abono:", error)
    showToast(error.response?.data?.detail || "Hubo un error al asentar el abono.", "error")
  } finally {
    isSavingAbono.value = false 
  }
}

const lineaTimelineCliente = computed(() => {
  const movs = []
  ventasCliente.value.forEach(v => {
    movs.push({ fecha: v.fecha, tipo: 'COMPRA', concepto: v.es_credito ? `Factura #${v.id} (A Crédito)` : `Factura #${v.id} (Contado)`, monto: parseFloat(v.total_venta) })
  })
  abonosCliente.value.forEach(a => {
    movs.push({ 
      fecha: a.fecha, 
      tipo: 'ABONO', 
      concepto: 'Abono en Caja', 
      monto: parseFloat(a.monto_abonado || a.monto_pagado || a.monto || 0) 
    })
  })
  return movs.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

const abrirModalCrear = () => {
  isEditing.value = false
  formCliente.value = { nombre: '', apellido: '', email: '', telefono: '', saldo_deuda: 0 }
  isFormModalOpen.value = true
}

const abrirModalEditar = (cliente) => {
  isEditing.value = true
  idClienteEditando.value = cliente.id
  formCliente.value = { nombre: cliente.nombre, apellido: cliente.apellido, email: cliente.email, telefono: cliente.telefono, saldo_deuda: parseFloat(cliente.saldo_deuda) }
  isFormModalOpen.value = true
}

const guardarCliente = async () => {
  if (isFormClienteInvalido.value) {
    showToast("Por favor, rellena los campos obligatorios correctamente.", "warning")
    return
  }
  
  isSavingCliente.value = true 
  try {
    if (isEditing.value) {
      const datosEnvio = { nombre: formCliente.value.nombre, apellido: formCliente.value.apellido || null, email: formCliente.value.email, telefono: formCliente.value.telefono || null }
      await api.patch(`/clientes/${idClienteEditando.value}`, datosEnvio)
      showToast("Perfil de cliente actualizado con éxito.", "success")
    } else {
      const datosEnvio = { nombre: formCliente.value.nombre, apellido: formCliente.value.apellido || null, email: formCliente.value.email, telefono: formCliente.value.telefono || null, saldo_deuda: parseFloat(formCliente.value.saldo_deuda || 0) }
      await api.post('/clientes/', datosEnvio)
      showToast(`Cliente '${datosEnvio.nombre}' registrado correctamente.`, "success")
    }
    isFormModalOpen.value = false
    cargarClientes()
  } catch (error) { 
    showToast(error.response?.data?.detail || "Error al procesar la solicitud del cliente.", "error") 
  } finally {
    isSavingCliente.value = false 
  }
}

const exportarReporte = async (formato) => {
  try {
    const id = clienteSeleccionado.value.id
    const endpoint = formato === 'excel' ? 'reporte-excel' : 'reporte-pdf'
    const extension = formato === 'excel' ? 'xlsx' : 'pdf'
    
    const res = await api.get(`/clientes/${id}/${endpoint}`, { responseType: 'blob' })

    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Estado_Cuenta_${clienteSeleccionado.value.nombre}.${extension}`)
    document.body.appendChild(link)
    link.click()
    
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    showToast(`Reporte ${formato.toUpperCase()} descargado con éxito.`, "success")
  } catch (error) {
    showToast(`Error al descargar el archivo en formato ${formato.toUpperCase()}.`, "error");
  }
}

const abrirHistorialCompleto = async (cliente) => {
  clienteSeleccionado.value = cliente
  isHistorialModalOpen.value = true
  montoAbono.value = null 
  ventasCliente.value = []
  abonosCliente.value = []

  try {
    const resVentas = await api.get('/ventas/')
    ventasCliente.value = resVentas.data.filter(v => v.cliente_id === cliente.id)
  } catch (e) {}
  try {
    const resAbonos = await api.get(`/clientes/${cliente.id}/abonos`)
    abonosCliente.value = resAbonos.data
  } catch (e) {}
}

const cargarClientes = async () => {
  try {
    const res = await api.get('/clientes/')
    listaClientes.value = res.data
  } catch (e) {}
}

const formatearFecha = (f) => f ? new Date(f).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : '-'

onMounted(() => { 
  cargarClientes() 
  const usuarioGuardado = localStorage.getItem('usuario') || localStorage.getItem('username') || localStorage.getItem('nombre')
  if (usuarioGuardado) nombreUsuario.value = usuarioGuardado
})
</script>