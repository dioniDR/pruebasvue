<template>
  <div>
    <h1>Escáner QR</h1>
        <video id="video" ref="video" autoplay playsinline></video> <!-- ✅ Agregamos id -->

    <CameraScanner />
  </div>
</template>

<script setup>
import CameraScanner from '../components/CameraScanner.vue';
</script>

<style>
h1 {
  text-align: center;
  margin-bottom: 20px;
}
</style>
