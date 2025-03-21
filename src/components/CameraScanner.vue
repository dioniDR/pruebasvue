<template>
  <div class="camera-container">
    <div id="lector-qr" class="video-wrapper"></div>
    <div v-if="resultado" class="resultado">
      <h3>Resultado:</h3>
      <pre>{{ resultado }}</pre>
    </div>
    <div class="botones">
      <button @click="startCamera">Iniciar Cámara</button>
      <button @click="stopCamera" :disabled="!scanning">Detener</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import { crearLector, detenerLector } from '@/lib/moduloqr.js';

const scanning = ref(false);
const resultado = ref(null);

const startCamera = () => {
  scanning.value = true;
  crearLector('#lector-qr', (codigo) => {
    console.log('Código QR detectado:', codigo);
    resultado.value = codigo;
  });
};

const stopCamera = () => {
  if (scanning.value) {
    detenerLector();
    scanning.value = false;
    resultado.value = null;
  }
};

onUnmounted(stopCamera);
</script>

<style>
.camera-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 500px;
  margin: 0 auto;
}

.video-wrapper {
  width: 100%;
  height: 300px;
  border: 1px solid #ccc;
  margin-bottom: 20px;
  overflow: hidden;
}

.resultado {
  margin: 15px 0;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 5px;
  width: 100%;
}

pre {
  white-space: pre-wrap;
  word-break: break-word;
}

.botones {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #4CAF50;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #45a049;
}

/* Estilos para el video creado por la función crearLector */
#lector-qr video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>