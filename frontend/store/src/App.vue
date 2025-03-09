<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <RouterView />
</template>

<style>
/* 重置默认样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

#app {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  left: 0;
  right: 0;
  overflow-x: hidden;
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 0.5rem;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 0.25rem;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 全局变量 */
:root {
  --header-height: 4rem;
  --sidebar-width: 18rem;
  --max-content-width: 90rem;
  --border-radius: 0.75rem;
  --box-shadow: 0 0.125rem 0.75rem rgba(0, 0, 0, 0.04);
}
</style>
