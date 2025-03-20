// src/components/JsonManager.vue
<template>
  <div>
    <button @click="saveJson">Guardar JSON</button>
    <button @click="loadJson">Cargar JSON</button>
  </div>
</template>

<script>
import { defineProps, defineEmits } from 'vue';
export default {
  props: ['jsonData'],
  emits: ['update-json'],
  setup(props, { emit }) {
    const saveJson = () => {
      const dataStr = JSON.stringify(props.jsonData);
      localStorage.setItem('qrData', dataStr);
    };

    const loadJson = () => {
      const data = localStorage.getItem('qrData');
      if (data) emit('update-json', JSON.parse(data));
    };

    return { saveJson, loadJson };
  }
};
</script>