import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import ProductosView from '../views/ProductosView.vue'
import ClientesView from '../views/ClientesView.vue'
import MovimientosView from '../views/MovimientosView.vue'
import VentasView from '../views/VentasView.vue'
import ComprasView from '../views/ComprasView.vue' 
import LoginView from '../views/LoginView.vue' 
import ProveedoresView from '../views/ProveedoresView.vue' 
import ReportesView from '../views/ReportesView.vue'
import DevolucionesView from '../views/DevolucionesView.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView
  },
  {
    path: '/productos',
    name: 'productos',
    component: ProductosView
  },
  // ¡AQUÍ ESTÁ LA COLA QUE FALTA! Registramos proveedores formalmente
  {
    path: '/proveedores',
    name: 'proveedores',
    component: ProveedoresView
  },
  {
    path: '/clientes',
    name: 'clientes',
    component: ClientesView
  },
  {
    path: '/ventas',
    name: 'ventas',
    component: VentasView
  },
  {
    path: '/devoluciones',
    name: 'devoluciones',
    component: DevolucionesView
  },
  {
    path: '/movimientos',
    name: 'movimientos',
    component: MovimientosView
  },
  {
    path: '/compras',
    name: 'compras',
    component: ComprasView
  },
  {
    path: '/reportes',
    name: 'reportes',
    component: ReportesView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// GUARDIÁN ACTUALIZADO: Cambiamos los viejos next() por los "return" modernos de Vue 3
router.beforeEach((to) => {
  const isAuthenticated = !!localStorage.getItem('token')
  
  if (to.name !== 'login' && !isAuthenticated) {
    // Si no está logueado y va a otra pantalla -> Al Login
    return { name: 'login' }
  }
  
  if (to.name === 'login' && isAuthenticated) {
    // Si ya está logueado e intenta ir al Login -> Al Dashboard
    return { name: 'dashboard' }
  }
  
  // En cualquier otro caso, permite continuar sin problemas
})

export default router
