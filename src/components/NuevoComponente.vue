<script setup>
const mensaje = "¡Bienvenido a la nueva ruta!";
</script>

<template>
  <div class="nuevo-componente">
    <h2>{{ mensaje }}</h2>
    <p>Este es un nuevo componente accesible desde una ruta específica.</p>
  </div>
</template>

<style scoped>
.nuevo-componente {
  padding: 1rem;
  border: 2px solid #4CAF50;
  border-radius: 8px;
  text-align: center;
  margin-top: 1rem;
}
h2 {
  color: #4CAF50;
}
</style>
