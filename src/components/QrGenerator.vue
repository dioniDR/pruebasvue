<template>
  <div>
    <h1>Generador de QR</h1>
    <div ref="qrContainer"></div>
    <button @click="generarQR">Generar QR</button>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { crearQR } from '@/lib/moduloqr.js'; // ✅ Importamos la función del módulo

const qrContainer = ref(null);

const generarQR = () => {
  crearQR(qrContainer.value, 'https://ejemplo.com'); // ✅ Generamos un QR dinámico
};

onMounted(generarQR);
</script>
