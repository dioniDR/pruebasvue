// src/components/QrList.vue
<template>
  <ul>
    <li v-for="(code, index) in codes" :key="index">{{ code }}</li>
  </ul>
</template>

<script>
import { defineProps } from 'vue';
export default {
  props: ['codes']
};
</script>
