<template>
  <div class="flex h-screen bg-gray-50 font-sans">
    
    <Sidebar/>

    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm shrink-0">
        <h1 class="text-2xl font-semibold text-slate-800">Panel Principal (Dashboard)</h1>
        <div class="flex items-center">
          <span class="text-sm font-medium text-gray-600 mr-4 uppercase tracking-wide font-semibold">{{ nombreUsuario }}</span>
          <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold uppercase border border-blue-200 shadow-sm">{{ inicialUsuario }}</div>
        </div>
      </header>

      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">
        
        <h2 class="text-lg font-bold text-slate-800 mb-6">Métricas Globales del Negocio</h2>
        
        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-pulse">
          <div v-for="i in 4" :key="i" class="bg-white h-28 rounded-xl border border-gray-200 p-6">
            <div class="h-3 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div class="h-7 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-blue-500 hover:shadow-md transition">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ventas Brutas</p>
            <p class="text-3xl font-black text-slate-800">${{ totalFacturado.toLocaleString() }}</p>
          </div>
          
          <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-green-500 hover:shadow-md transition">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Caja Fuerte (Recaudo)</p>
            <p class="text-3xl font-black text-green-600">${{ totalRecaudado.toLocaleString() }}</p>
          </div>
          
          <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-red-500 hover:shadow-md transition">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Cartera por Cobrar</p>
            <p class="text-3xl font-black text-red-600">${{ totalEnDeuda.toLocaleString() }}</p>
          </div>

          <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-orange-500 hover:shadow-md transition">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Alertas de Stock</p>
            <p class="text-3xl font-black text-orange-500">
              {{ productosEnPeligro }} {{ productosEnPeligro === 1 ? 'Producto' : 'Variedades' }}
            </p>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div class="mb-4">
            <h3 class="text-base font-bold text-slate-800">Curva de Rendimiento Comercial</h3>
            <p class="text-xs text-gray-400">Historial diario consolidado de ventas brutas ingresadas al sistema</p>
          </div>
          
          <div v-if="isLoading" class="h-80 flex items-center justify-center border border-dashed border-gray-200 rounded-xl bg-gray-50 animate-pulse">
            <div class="text-center">
              <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p class="text-xs text-gray-400 font-medium">Sincronizando balances contables...</p>
            </div>
          </div>

          <div class="h-80 relative" v-else-if="chartData.labels.length > 0">
            <Line :data="chartData" :options="chartOptions" />
          </div>
          
          <div class="h-80 flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/50" v-else>
            <span class="text-3xl mb-2">📊</span>
            <p class="text-sm font-medium">Esperando transacciones de venta para trazar gráfica...</p>
          </div>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import Sidebar from '../components/Sidebar.vue'
import { useToast } from '../composables/useToast' // INYECTADO: Importación de Toasts globales

// --- Componentes e Inyecciones de Chart.js ---
import { Line } from 'vue-chartjs'
import { 
  Chart as ChartJS, 
  Title, 
  Tooltip, 
  Legend, 
  LineElement, 
  LinearScale, 
  PointElement, 
  CategoryScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale)

const listaVentas = ref([])
const listaProductos = ref([])
const listaClientes = ref([]) 
const { showToast } = useToast() // INYECTADO: Instancia del disparador de notificaciones

// INYECTADO: Variable reactiva para controlar el estado de carga de la pantalla
const isLoading = ref(true)

// --- DATOS DE USUARIO PARA EL TOP BAR ---
const nombreUsuario = ref('Admin')
const inicialUsuario = computed(() => nombreUsuario.value ? nombreUsuario.value.charAt(0).toUpperCase() : 'A')

// --- CÁLCULOS FINANCIEROS AJUSTADOS AL ESCENARIO REAL ---
const totalFacturado = computed(() => listaVentas.value.reduce((sum, v) => sum + parseFloat(v.total_venta || 0), 0))
const totalEnDeuda = computed(() => listaClientes.value.reduce((sum, c) => sum + parseFloat(c.saldo_deuda || 0), 0))
const totalRecaudado = computed(() => totalFacturado.value - totalEnDeuda.value)

const productosEnPeligro = computed(() => listaProductos.value.filter(p => p.stock <= 5).length)

// --- PROCESAMIENTO CORREGIDO PARA EL GRÁFICO (MÉTODO LOCAL TIME COLOMBIA) ---
const chartData = computed(() => {
  const mapeoFechas = {}

  const ventasOrdenadas = [...listaVentas.value].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))

  ventasOrdenadas.forEach(v => {
    if (!v.fecha) return
    
    const dateObj = new Date(v.fecha)
    const anio = dateObj.getFullYear()
    const mes = String(dateObj.getMonth() + 1).padStart(2, '0')
    const dia = String(dateObj.getDate()).padStart(2, '0')
    const diaString = `${anio}-${mes}-${dia}`
    
    if (!mapeoFechas[diaString]) {
      mapeoFechas[diaString] = 0
    }
    mapeoFechas[diaString] += parseFloat(v.total_venta || 0)
  })

  return {
    labels: Object.keys(mapeoFechas), 
    datasets: [
      {
        label: 'Ventas Diarias ($)',
        backgroundColor: '#3b82f6', 
        borderColor: '#1e293b',     
        pointBackgroundColor: '#3b82f6',
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 3,
        tension: 0.2, 
        data: Object.values(mapeoFechas) 
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: { font: { weight: 'bold', family: 'sans-serif' } }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value) {
          return '$' + value.toLocaleString() 
        }
      }
    }
  }
}

// --- CARGA SIMULTÁNEA DE MÉTRICAS COMPLETA ---
const cargarMetricas = async () => {
  isLoading.value = true // Activa el esqueleto de carga antes de arrancar
  try {
    const token = localStorage.getItem('token')
    const config = { headers: { 'Authorization': `Bearer ${token}` } }
    
    const [resVentas, resProductos, resClientes] = await Promise.all([
      axios.get('http://127.0.0.1:8000/ventas/', config),
      axios.get('http://127.0.0.1:8000/productos/', config),
      axios.get('http://127.0.0.1:8000/clientes/', config)
    ])
    
    listaVentas.value = resVentas.data
    listaProductos.value = resProductos.data
    listaClientes.value = resClientes.data
  } catch (error) {
    console.error("Error al cargar métricas del Dashboard:", error)
    // INYECTADO: Toast informativo si la API de FastAPI no responde
    showToast("Error de comunicación: No se pudieron sincronizar los datos de negocio.", "error")
  } finally {
    isLoading.value = false 
  }
}

onMounted(() => {
  cargarMetricas()
  
  const usuarioGuardado = localStorage.getItem('usuario') || localStorage.getItem('username') || localStorage.getItem('nombre')
  if (usuarioGuardado) {
    nombreUsuario.value = usuarioGuardado
  }
})
</script>