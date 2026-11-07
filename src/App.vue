<script setup lang="ts">
import ParticleBackground from '@/components/ParticleBackground.vue';
import Sidebar from '@/components/Sidebar.vue';
import { RouterView } from 'vue-router';
</script>

<template>
  <ParticleBackground class="bg"/>
  <div class="app-shell">
    <Sidebar />
    <main class="app-content">
      <RouterView />
    </main>
  </div>
</template>
<style scoped>
:global(:root) {
  --sg-page-bg: #1b1816;
  --sg-surface: #241e1b;
  --sg-surface-raised: #2d2521;
  --sg-surface-hover: #4a3831;
  --sg-border: #4a3831;
  --sg-accent: #c77b62;
  --sg-accent-soft: #dc9a80;
  --sg-accent-light: #efc2ae;
  --sg-text: #fffaf7;
  --sg-text-soft: #eedbd2;
  --sg-text-muted: #c9a090;
  --sg-shadow-soft: rgb(10 7 6 / 24%);
  --sg-shadow-strong: rgb(10 7 6 / 48%);
}

:global(body) {
  margin: 0;
  font-family: 'Inter', sans-serif;
  color: var(--sg-text);
}

.bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background-color: var(--sg-page-bg);
}

.app-shell {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
}

.app-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

@media (min-width: 768px) {
  .app-shell {
    flex-direction: row;
  }
}
</style>