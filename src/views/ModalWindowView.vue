<template>
  <div class="app-container">
    <button @click="addWindow" class="add-window-btn">Crear Nueva Ventana</button>
    
    <!-- Contenedor para las ventanas modales -->
    <div class="windows-container">
      <ModalWindow 
        v-for="window in windows" 
        :key="window.id"
        :title="window.title"
        :initialTop="window.top"
        :initialLeft="window.left"
        :initialWidth="window.width"
        :initialHeight="window.height"
        :zIndex="window.zIndex"
        @close="closeWindow(window.id)"
        @click="focusWindow(window.id)"
      >
        <!-- Aquí puedes poner cualquier contenido dentro de la ventana -->
        <div>
          <h2>Contenido de ejemplo</h2>
          <p>Esta es una ventana redimensionable y movible.</p>
          <p>ID: {{ window.id }}</p>
          
          <!-- Aquí podrías incluir tus componentes -->
          <!-- <tu-componente /> -->
        </div>
      </ModalWindow>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import ModalWindow from '@/components/ModalWindow.vue';

export default {
  name: 'App',
  components: {
    ModalWindow
  },
  setup() {
    const windows = ref([]);
    const windowCounter = ref(0);
    const zIndexCounter = ref(1000);
    
    const addWindow = () => {
      windowCounter.value++;
      zIndexCounter.value++;
      
      // Calcular posición para escalonar las ventanas
      const offset = (windowCounter.value - 1) * 30;
      
      windows.value.push({
        id: windowCounter.value,
        title: `Ventana ${windowCounter.value}`,
        top: 100 + offset,
        left: 100 + offset,
        width: 500,
        height: 400,
        zIndex: zIndexCounter.value
      });
    };
    
    const closeWindow = (id) => {
      const index = windows.value.findIndex(w => w.id === id);
      if (index !== -1) {
        windows.value.splice(index, 1);
      }
    };
    
    const focusWindow = (id) => {
      zIndexCounter.value++;
      const window = windows.value.find(w => w.id === id);
      if (window) {
        window.zIndex = zIndexCounter.value;
      }
    };
    
    return {
      windows,
      addWindow,
      closeWindow,
      focusWindow
    };
  }
}
</script>

<style>
.app-container {
  font-family: Arial, sans-serif;
  height: 100vh;
  padding: 20px;
  background-color: #f0f2f5;
  position: relative;
  overflow: hidden;
}

.windows-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.add-window-btn {
  padding: 10px 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 20px;
  z-index: 9999;
  position: relative;
}

.add-window-btn:hover {
  background-color: #45a049;
}
</style>