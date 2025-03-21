import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import QrScannerView from '../views/QrScannerView.vue'
import QrGeneratorView from '../views/QrGeneratorView.vue'
import ModalWindowView from '../views/ModalWindowView.vue';  // ✅ Importación correcta


const routes = [
  { path: '/', component: HomeView },
  { path: '/qr-scanner', component: QrScannerView },
  { path: '/qr-generator', component: QrGeneratorView },
  { path: '/modal-window', component: ModalWindowView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
