import { createRouter, createWebHistory } from 'vue-router'

// Importamos los componentes
import HomeView from '../views/HomeView.vue'
import MiComponente from '../components/MiComponente.vue'
import OtroComponente from '../components/OtroComponente.vue'
import NuevoComponente from '../components/NuevoComponente.vue'  // ✅ Nuevo componente

const routes = [
  { path: '/', component: HomeView },
  { path: '/mi-componente', component: MiComponente },
  { path: '/otro-componente', component: OtroComponente },
  { path: '/nueva-ruta', component: NuevoComponente }  // ✅ Nueva ruta
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
