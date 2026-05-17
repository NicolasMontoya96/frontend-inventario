<template>
  <div class="flex h-screen bg-gray-50 font-sans">
    
    <Sidebar/>

    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
        <h1 class="text-2xl font-bold text-slate-800">Centro de Inteligencia y Reportes</h1>
        <div class="flex items-center">
          <span class="text-sm font-medium text-slate-600 mr-4">Usuario Admin</span>
          <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">A</div>
        </div>
      </header>

      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">
        <p class="text-sm text-slate-600 mb-8 font-medium">
          Genera, audita y descarga balances en tiempo real para la toma de decisiones estratégicas de la tienda.
        </p>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div class="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mb-4">
                📦
              </div>
              <h3 class="text-lg font-black text-slate-800">Valorización de Inventario</h3>
              <p class="text-xs text-slate-600 mt-2 leading-relaxed">
                Calcula el stock físico de todos los artículos multiplicado por su precio de venta para conocer el capital activo retenido en mercancía.
              </p>
            </div>
            
            <div class="mt-6 pt-4 border-t border-gray-100 flex space-x-2">
              <button @click="descargarInventario('pdf')" class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-xl text-[11px] font-bold transition shadow-sm">
                📄 PDF
              </button>
              <button @click="descargarInventario('excel')" class="flex-1 bg-green-700 hover:bg-green-800 text-white py-2 px-3 rounded-xl text-[11px] font-bold transition shadow-sm">
                📊 Excel
              </button>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div class="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mb-4">
                📈
              </div>
              <h3 class="text-lg font-black text-slate-800">Ventas por Rango</h3>
              <p class="text-xs text-slate-600 mt-2 leading-relaxed mb-4">
                Agrupa la facturación total y los métodos de pago registrados entre los días seleccionados del calendario.
              </p>

              <div class="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-gray-150 mb-1">
                <div>
                  <label class="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Desde:</label>
                  <input type="date" v-model="fechaInicio" class="w-full text-[11px] px-2 py-1 border border-gray-300 rounded-lg text-slate-700 bg-white">
                </div>
                <div>
                  <label class="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Hasta:</label>
                  <input type="date" v-model="fechaFin" class="w-full text-[11px] px-2 py-1 border border-gray-300 rounded-lg text-slate-700 bg-white">
                </div>
              </div>
            </div>
            
            <div class="mt-4 pt-4 border-t border-gray-100 flex space-x-2">
              <button @click="descargarVentas('pdf')" class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-xl text-[11px] font-bold transition shadow-sm">
                📄 PDF
              </button>
              <button @click="descargarVentas('excel')" class="flex-1 bg-green-700 hover:bg-green-800 text-white py-2 px-3 rounded-xl text-[11px] font-bold transition shadow-sm">
                📊 Excel
              </button>
            </div>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div class="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl mb-4">
                💸
              </div>
              <h3 class="text-lg font-black text-slate-800">Consolidado de Deudores</h3>
              <p class="text-xs text-slate-600 mt-2 leading-relaxed">
                Extrae masivamente la lista de todos los clientes que tienen deudas activas con el negocio, ordenados automáticamente de mayor a menor saldo.
              </p>
            </div>
            
            <div class="mt-6 pt-4 border-t border-gray-100 flex space-x-2">
              <button @click="descargarDeudores('pdf')" class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-xl text-[11px] font-bold transition shadow-sm">
                📄 PDF
              </button>
              <button @click="descargarDeudores('excel')" class="flex-1 bg-green-700 hover:bg-green-800 text-white py-2 px-3 rounded-xl text-[11px] font-bold transition shadow-sm">
                📊 Excel
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import Sidebar from '../components/Sidebar.vue'

const hoy = new Date().toISOString().split('T')[0]
const fechaInicio = ref(hoy)
const fechaFin = ref(hoy)

// --- REPORTE 1: VALORIZACIÓN DE INVENTARIO ---
const descargarInventario = async (formato) => {
  try {
    const token = localStorage.getItem('token')
    const endpoint = formato === 'excel' ? 'inventario-excel' : 'inventario-pdf'
    const ext = formato === 'excel' ? 'xlsx' : 'pdf'

    const res = await axios.get(`http://127.0.0.1:8000/clientes/global/${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      responseType: 'blob' 
    })

    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Valorizacion_Inventario_Global.${ext}`)
    document.body.appendChild(link)
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (e) { alert("Error al descargar inventario.") }
}

// --- REPORTE 2: BALANCE DE VENTAS POR FECHAS ---
const descargarVentas = async (formato) => {
  try {
    const token = localStorage.getItem('token')
    const endpoint = formato === 'excel' ? 'ventas-excel' : 'ventas-pdf'
    const ext = formato === 'excel' ? 'xlsx' : 'pdf'

    const res = await axios.get(`http://127.0.0.1:8000/clientes/global/${endpoint}`, {
      params: { fecha_inicio: fechaInicio.value, fecha_fin: fechaFin.value },
      headers: { 'Authorization': `Bearer ${token}` },
      responseType: 'blob'
    })

    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Reporte_Ventas_${fechaInicio.value}_a_${fechaFin.value}.${ext}`)
    document.body.appendChild(link)
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (e) { alert("Error al procesar el reporte de ventas.") }
}

// --- REPORTE 3: CONSOLIDADO DE CARTERA (DEUDORES) ---
const descargarDeudores = async (formato) => {
  try {
    const token = localStorage.getItem('token')
    const endpoint = formato === 'excel' ? 'deudores-excel' : 'deudores-pdf'
    const ext = formato === 'excel' ? 'xlsx' : 'pdf'

    const res = await axios.get(`http://127.0.0.1:8000/clientes/global/${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      responseType: 'blob'
    })

    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Consolidado_Deudores_Cartera.${ext}`)
    document.body.appendChild(link)
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (e) { alert("Error al descargar el listado consolidado de deudores.") }
}
</script>