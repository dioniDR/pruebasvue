// src/components/CameraScanner.vue
<template>
  <div class="camera-container">
    <video ref="video" autoplay playsinline></video>
    <button @click="startCamera">Iniciar Cámara</button>
    <button @click="stopCamera" :disabled="!scanning">Detener</button>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, defineEmits } from 'vue';
import jsQR from '../lib/jsQR.js';

export default {
  emits: ['qr-scanned'],
  setup(_, { emit }) {
    const video = ref(null);
    const scanning = ref(false);
    let stream = null;
    let canvas = document.createElement('canvas').getContext('2d');

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.value.srcObject = stream;
        scanning.value = true;
        scan();
      } catch (error) {
        console.error("Error al acceder a la cámara:", error);
      }
    };

    const stopCamera = () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        scanning.value = false;
      }
    };

    const scan = () => {
      if (!scanning.value) return;
      canvas.drawImage(video.value, 0, 0, canvas.canvas.width, canvas.canvas.height);
      let imageData = canvas.getImageData(0, 0, canvas.canvas.width, canvas.canvas.height);
      let qr = jsQR(imageData.data, imageData.width, imageData.height);
      if (qr) emit('qr-scanned', qr.data);
      requestAnimationFrame(scan);
    };

    onUnmounted(stopCamera);
    return { video, scanning, startCamera, stopCamera };
  }
};
</script>

<style>
.camera-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>