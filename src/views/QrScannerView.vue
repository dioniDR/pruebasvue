<template>
  <div>
    <h1>Escáner QR</h1>
    <CameraScanner @qr-scanned="addQrCode" />
    <JsonManager :jsonData="jsonData" @update-json="updateJsonData" />

    <div class="lists">
      <div v-for="(list, index) in jsonData" :key="index" class="qr-list">
        <h2>Lista {{ index + 1 }}</h2>
        <QrList :codes="list" />
      </div>
    </div>

    <button @click="addNewList">Agregar Nueva Lista</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CameraScanner from '../components/CameraScanner.vue'
import JsonManager from '../components/JsonManager.vue'
import QrList from '../components/QrList.vue'

const jsonData = ref([])

const addQrCode = (code) => {
  if (jsonData.value.length === 0) jsonData.value.push([])
  jsonData.value[0].push(code)
}

const updateJsonData = (newData) => {
  jsonData.value = newData
}

const addNewList = () => {
  jsonData.value.push([])
}
</script>

<style>
.lists {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.qr-list {
  margin: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}
button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  margin-top: 10px;
}
</style>
