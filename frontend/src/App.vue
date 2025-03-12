<template>
  <div class="app-container">
    <router-view />
    <FloatingAction />
  </div>
</template>

<script setup lang="ts">
import FloatingAction from '@/components/common/FloatingAction.vue'
</script>

<style>
.app-container {
  min-height: 100vh;
  position: relative;
}
</style>
