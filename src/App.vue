<script setup>
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />
    </div>
  </header>

  <!-- Menú de navegación -->
  <nav>
    <ul>
      <li><router-link to="/">Inicio</router-link></li>
      <li><router-link to="/mi-componente">Mi Componente</router-link></li>
      <li><router-link to="/otro-componente">Otro Componente</router-link></li>
      <li><router-link to="/nueva-ruta">Nueva Ruta</router-link></li> <!-- ✅ Nueva ruta -->
    </ul>
  </nav>

  <main>
    <router-view /> <!-- ✅ Aquí se cargan dinámicamente los componentes según la ruta -->
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav ul {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding: 1rem;
  background: #42b983;
}

nav a {
  color: white;
  text-decoration: none;
  font-weight: bold;
}

nav a:hover {
  text-decoration: underline;
}
</style>
