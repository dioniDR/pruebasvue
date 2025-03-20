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
      <li><router-link to="/nueva-ruta">Nueva Ruta</router-link></li>
      <li><router-link to="/qr-scanner">Escáner QR</router-link></li> <!-- ✅ Nueva opción agregada -->
    </ul>
  </nav>

  <main>
    <router-view /> <!-- ✅ Se carga el componente dinámicamente según la ruta -->
  </main>
</template>
