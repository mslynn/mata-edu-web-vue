<template>
  <div>
    <h1>{{ message }}</h1>
    <button @click="increment">Count: {{ count }}</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const message = ref('Hello Vue 3!')
const count = ref(0)

const increment = () => {
  count.value++
}
</script>

<style scoped>
h1 {
  color: #42b883;
}

button {
  padding: 10px 20px;
  margin: 10px 0;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #369870;
}
</style>
