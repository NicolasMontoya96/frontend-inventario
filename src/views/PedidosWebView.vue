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
            <h1 class="text-xl lg:text-2xl font-semibold text-slate-800">Pedidos Web</h1>
          </div>
          <button @click="cargarPedidos" class="lg:hidden text-slate-500 hover:text-slate-800 p-1" title="Actualizar">
            🔄
          </button>
        </div>

        <nav class="flex space-x-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
          <button v-for="opcion in filtrosEstado" :key="opcion.valor"
                  @click="filtroActual = opcion.valor"
                  class="px-4 py-2 text-sm font-medium rounded-lg transition whitespace-nowrap"
                  :class="filtroActual === opcion.valor ? 'bg-slate-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'">
            {{ opcion.etiqueta }}
          </button>
        </nav>
      </header>

      <div class="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-8">
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div class="p-4 lg:p-6 border-b border-gray-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <h2 class="text-base lg:text-lg font-bold text-slate-800 shrink-0">
              {{ pedidosFiltrados.length }} pedido{{ pedidosFiltrados.length === 1 ? '' : 's' }}
            </h2>
            <div class="flex items-center gap-3 lg:ml-auto">
              <div class="relative flex-1 lg:flex-none lg:w-72">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                <input
                  v-model="terminoBusqueda"
                  type="text"
                  placeholder="Buscar por referencia, cliente o teléfono..."
                  class="w-full border border-gray-200 rounded-lg pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                >
                <button
                  v-if="terminoBusqueda"
                  @click="terminoBusqueda = ''"
                  class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                  title="Limpiar búsqueda"
                >&times;</button>
              </div>
              <button @click="cargarPedidos" class="hidden lg:flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 font-medium shrink-0">
                🔄 Actualizar
              </button>
            </div>
          </div>

          <div v-if="cargando" class="p-12 text-center text-gray-500">Cargando pedidos…</div>

          <div v-else-if="errorCarga" class="p-12 text-center text-red-500">
            No se pudieron cargar los pedidos. {{ errorCarga }}
          </div>

          <template v-else>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse min-w-[860px]">
                <thead>
                  <tr class="bg-gray-50 text-gray-500 text-[10px] lg:text-xs uppercase tracking-wider border-b border-gray-200">
                    <th class="px-4 py-3 font-medium">Referencia</th>
                    <th class="px-4 py-3 font-medium">Fecha</th>
                    <th class="px-4 py-3 font-medium">Cliente</th>
                    <th class="px-4 py-3 font-medium">Ciudad</th>
                    <th class="px-4 py-3 font-medium">Estado</th>
                    <th class="px-4 py-3 font-medium text-right">Total</th>
                    <th class="px-4 py-3 font-medium text-center">Detalle</th>
                  </tr>
                </thead>
                <tbody class="text-xs lg:text-sm text-gray-700 divide-y divide-gray-200">
                  <tr v-for="pedido in pedidosFiltrados" :key="pedido.id" class="hover:bg-gray-50">
                    <td class="px-4 py-3 font-mono text-slate-600">
                      {{ pedido.referencia_pago.slice(0, 8) }}…
                    </td>
                    <td class="px-4 py-3 text-gray-500">{{ formatearFecha(pedido.fecha) }}</td>
                    <td class="px-4 py-3">
                      <span class="font-semibold text-slate-900 block">{{ pedido.nombre_cliente }}</span>
                      <span class="text-gray-500 text-[11px]">{{ pedido.telefono_cliente }}</span>
                    </td>
                    <td class="px-4 py-3 text-gray-600">
                      <span v-if="pedido.ciudad">{{ pedido.ciudad }}, {{ pedido.departamento }}</span>
                      <span v-else class="text-gray-400">—</span>
                    </td>
                    <td class="px-4 py-3">
                      <span :class="claseEstado(pedido.estado)" class="px-2 py-1 rounded text-[10px] font-bold uppercase">
                        {{ etiquetaEstado(pedido.estado) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right font-black text-slate-900">
                      ${{ parseFloat(pedido.total_pedido).toLocaleString() }}
                    </td>
                    <td class="px-4 py-3 text-center">
                      <button @click="abrirDetalle(pedido)" class="text-blue-600 hover:text-blue-800 p-1.5 bg-blue-50 rounded-lg transition text-sm border border-blue-100">
                        👁️
                      </button>
                    </td>
                  </tr>
                  <tr v-if="pedidosFiltrados.length === 0">
                    <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                      No hay pedidos{{ filtroActual ? ` en estado "${etiquetaEstado(filtroActual)}"` : '' }}{{ terminoBusqueda ? ` que coincidan con "${terminoBusqueda}"` : '' }}.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div v-if="pedidoSeleccionado" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div class="px-4 lg:px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h3 class="text-base lg:text-lg font-bold text-slate-800">Pedido #{{ pedidoSeleccionado.id }}</h3>
            <p class="text-[10px] lg:text-xs text-gray-500 font-mono">{{ pedidoSeleccionado.referencia_pago }}</p>
          </div>
          <button @click="pedidoSeleccionado = null" class="text-gray-400 hover:text-red-500 transition text-2xl font-semibold leading-none">&times;</button>
        </div>

        <div class="p-4 lg:p-6 overflow-x-auto">
          <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Cliente</p>
              <p class="text-slate-800 font-medium">{{ pedidoSeleccionado.nombre_cliente }}</p>
              <p class="text-gray-500">{{ pedidoSeleccionado.telefono_cliente }}</p>
              <p class="text-gray-500" v-if="pedidoSeleccionado.email_cliente">{{ pedidoSeleccionado.email_cliente }}</p>
            </div>
            <div>
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Envío</p>
              <!-- Pedidos nuevos traen la dirección ya separada por campo;
                   los pedidos de antes de este cambio solo tienen el texto
                   combinado en direccion_envio, así que lo usamos como
                   respaldo para no dejar esos pedidos viejos sin dirección. -->
              <template v-if="pedidoSeleccionado.direccion">
                <p class="text-slate-800">{{ pedidoSeleccionado.direccion }}</p>
                <p class="text-slate-500" v-if="pedidoSeleccionado.referencia_direccion">{{ pedidoSeleccionado.referencia_direccion }}</p>
                <p class="text-slate-500">{{ pedidoSeleccionado.ciudad }}, {{ pedidoSeleccionado.departamento }}</p>
              </template>
              <p class="text-slate-800" v-else>{{ pedidoSeleccionado.direccion_envio }}</p>
              <p class="text-slate-500 text-[11px] mt-1" v-if="pedidoSeleccionado.transportadora || pedidoSeleccionado.numero_guia">
                {{ pedidoSeleccionado.transportadora }}<span v-if="pedidoSeleccionado.transportadora && pedidoSeleccionado.numero_guia"> &middot; </span><span v-if="pedidoSeleccionado.numero_guia">Guía: {{ pedidoSeleccionado.numero_guia }}</span>
              </p>
            </div>
          </div>

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
              <tr v-for="item in pedidoSeleccionado.detalles" :key="item.id">
                <td class="px-3 py-2 font-semibold text-slate-800">{{ item.nombre_producto }}</td>
                <td class="px-3 py-2 text-center text-slate-600">{{ item.cantidad }}</td>
                <td class="px-3 py-2 text-right text-slate-600">${{ parseFloat(item.precio_unitario).toLocaleString() }}</td>
                <td class="px-3 py-2 text-right font-bold text-slate-900">${{ (item.cantidad * parseFloat(item.precio_unitario)).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>

          <div class="flex justify-between items-center pt-4 border-t border-gray-200">
            <span :class="claseEstado(pedidoSeleccionado.estado)" class="px-2 py-1 rounded text-[10px] font-bold uppercase">
              {{ etiquetaEstado(pedidoSeleccionado.estado) }}
            </span>
            <div class="text-right">
              <span class="text-sm text-gray-600 mr-3">Total:</span>
              <span class="text-xl lg:text-2xl font-black text-slate-900">${{ parseFloat(pedidoSeleccionado.total_pedido).toLocaleString() }}</span>
            </div>
          </div>

          <!-- Seguimiento del pedido: solo aplica una vez que ya se pagó.
               Son pasos manuales (vos los marcas), no hay integración con
               ninguna transportadora. -->
          <div v-if="pedidoSeleccionado.estado === 'pagado' || pedidoSeleccionado.estado === 'enviado'" class="pt-4 mt-4 border-t border-gray-200">
            <p v-if="errorAccionEnvio" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-3">{{ errorAccionEnvio }}</p>

            <template v-if="pedidoSeleccionado.estado === 'pagado'">
              <button
                v-if="!mostrarFormEnvio"
                @click="mostrarFormEnvio = true"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition"
              >
                📦 Marcar como enviado
              </button>
              <div v-else class="flex flex-col gap-2.5 bg-blue-50 border border-blue-100 rounded-lg p-3.5">
                <p class="text-xs font-semibold text-blue-900">Datos de envío (opcional)</p>
                <input
                  v-model="formEnvio.transportadora"
                  type="text"
                  placeholder="Transportadora (ej: Servientrega)"
                  class="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                <input
                  v-model="formEnvio.numero_guia"
                  type="text"
                  placeholder="Número de guía"
                  class="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                <div class="flex gap-2">
                  <button
                    @click="confirmarEnvio"
                    :disabled="marcandoEnvio"
                    class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {{ marcandoEnvio ? 'Guardando...' : 'Confirmar envío' }}
                  </button>
                  <button
                    @click="mostrarFormEnvio = false"
                    :disabled="marcandoEnvio"
                    class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </template>

            <button
              v-else-if="pedidoSeleccionado.estado === 'enviado'"
              @click="marcarEntregado"
              :disabled="marcandoEntrega"
              class="w-full bg-slate-700 hover:bg-slate-800 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {{ marcandoEntrega ? 'Guardando...' : '✅ Marcar como entregado' }}
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

const isSidebarOpen = ref(false)
const pedidos = ref([])
const cargando = ref(true)
const errorCarga = ref('')
const filtroActual = ref('')
const terminoBusqueda = ref('')
const pedidoSeleccionado = ref(null)

const filtrosEstado = [
  { valor: '', etiqueta: 'Todos' },
  { valor: 'pendiente', etiqueta: 'Pendientes' },
  { valor: 'pagado', etiqueta: 'Pagados' },
  { valor: 'enviado', etiqueta: 'Enviados' },
  { valor: 'entregado', etiqueta: 'Entregados' },
  { valor: 'fallido', etiqueta: 'Fallidos' },
  { valor: 'expirado', etiqueta: 'Expirados' },
]

const pedidosFiltrados = computed(() => {
  let resultado = pedidos.value
  if (filtroActual.value) {
    resultado = resultado.filter((p) => p.estado === filtroActual.value)
  }
  const termino = terminoBusqueda.value.trim().toLowerCase()
  if (termino) {
    // Compara contra referencia, nombre del cliente y teléfono a la vez —
    // no hace falta que el admin sepa en cuál de los tres está buscando.
    resultado = resultado.filter((p) =>
      p.referencia_pago?.toLowerCase().includes(termino) ||
      p.nombre_cliente?.toLowerCase().includes(termino) ||
      p.telefono_cliente?.toLowerCase().includes(termino)
    )
  }
  return resultado
})

const etiquetaEstado = (estado) => {
  const mapa = {
    pendiente: 'Pendiente',
    pagado: 'Pagado',
    enviado: 'Enviado',
    entregado: 'Entregado',
    fallido: 'Fallido',
    expirado: 'Expirado',
  }
  return mapa[estado] || estado
}

const claseEstado = (estado) => {
  const mapa = {
    pendiente: 'bg-amber-100 text-amber-800',
    pagado: 'bg-green-100 text-green-800',
    enviado: 'bg-blue-100 text-blue-800',
    entregado: 'bg-slate-200 text-slate-700',
    fallido: 'bg-red-100 text-red-800',
    expirado: 'bg-gray-200 text-gray-600',
  }
  return mapa[estado] || 'bg-gray-100 text-gray-600'
}

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '-'
  return new Date(fechaStr).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
}

const mostrarFormEnvio = ref(false)
const formEnvio = ref({ transportadora: '', numero_guia: '' })
const marcandoEnvio = ref(false)
const marcandoEntrega = ref(false)
const errorAccionEnvio = ref('')

const abrirDetalle = (pedido) => {
  pedidoSeleccionado.value = pedido
  mostrarFormEnvio.value = false
  formEnvio.value = { transportadora: '', numero_guia: '' }
  errorAccionEnvio.value = ''
}

// Reemplaza el pedido tanto en el modal como en la lista de la tabla, para
// que los dos queden sincronizados sin tener que recargar todo desde el
// backend otra vez.
const actualizarPedidoLocal = (pedidoActualizado) => {
  pedidoSeleccionado.value = pedidoActualizado
  const indice = pedidos.value.findIndex((p) => p.id === pedidoActualizado.id)
  if (indice !== -1) pedidos.value[indice] = pedidoActualizado
}

const confirmarEnvio = async () => {
  errorAccionEnvio.value = ''
  marcandoEnvio.value = true
  try {
    const res = await api.post(`/pedidos-web/${pedidoSeleccionado.value.referencia_pago}/enviar`, {
      transportadora: formEnvio.value.transportadora.trim() || null,
      numero_guia: formEnvio.value.numero_guia.trim() || null,
    })
    actualizarPedidoLocal(res.data)
    mostrarFormEnvio.value = false
  } catch (error) {
    errorAccionEnvio.value = error.response?.data?.detail || 'No se pudo marcar el pedido como enviado.'
  } finally {
    marcandoEnvio.value = false
  }
}

const marcarEntregado = async () => {
  errorAccionEnvio.value = ''
  marcandoEntrega.value = true
  try {
    const res = await api.post(`/pedidos-web/${pedidoSeleccionado.value.referencia_pago}/entregar`)
    actualizarPedidoLocal(res.data)
  } catch (error) {
    errorAccionEnvio.value = error.response?.data?.detail || 'No se pudo marcar el pedido como entregado.'
  } finally {
    marcandoEntrega.value = false
  }
}

const cargarPedidos = async () => {
  cargando.value = true
  errorCarga.value = ''
  try {
    const res = await api.get('/pedidos-web/')
    pedidos.value = res.data
  } catch (error) {
    console.error('Error cargando pedidos web:', error)
    errorCarga.value = error.response?.data?.detail || 'Error de conexión con el servidor.'
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarPedidos()
})
</script>