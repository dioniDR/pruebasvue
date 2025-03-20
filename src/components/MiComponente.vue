<script setup>
const mensaje = "Este es un nuevo componente agregado dinámicamente.";
</script>

<template>
  <div class="mi-componente">
    <h2>{{ mensaje }}</h2>
    <p>Ahora tenemos un componente adicional en nuestra aplicación Vue 3.</p>
  </div>
</template>

<style scoped>
.mi-componente {
  padding: 1rem;
  border: 2px solid #42b983;
  border-radius: 8px;
  text-align: center;
  margin-top: 1rem;
}
h2 {
  color: #42b983;
}
</style>
