<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Maximize, RefreshCw } from '@lucide/vue';

type CloudApp = {
  id: string;
  name: string;
  url: string;
  image: string;
};

const apps = ref<CloudApp[]>([]);
const isLoading = ref(true);
const loadError = ref('');
const selectedApp = ref<CloudApp | null>(null);
const iframeRef = ref<HTMLIFrameElement | null>(null);
const iframeKey = ref(0);
const search = ref('');
const filteredApps = computed(() => {
  const query = search.value.trim().toLowerCase();
  return apps.value.filter((app) => app.name.toLowerCase().includes(query));
});

function isCloudApp(value: unknown): value is CloudApp {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'name' in value &&
    typeof value.name === 'string' &&
    'url' in value &&
    typeof value.url === 'string' &&
    'image' in value &&
    typeof value.image === 'string'
  );
}

async function loadApps() {
  try {
    const response = await fetch('/json/cloud-apps.json');
    if (!response.ok) {
      throw new Error(`Cloud app catalog request failed with status ${response.status}`);
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Cloud app catalog must be a JSON array');
    }

    const parsedApps = data.filter(isCloudApp);
    if (parsedApps.length !== data.length) {
      throw new Error('Cloud app catalog contains an invalid entry');
    }
    apps.value = parsedApps;
  } catch (error) {
    console.error('Failed to load cloud app catalog:', error);
    loadError.value = 'Could not load cloud apps. Try refreshing.';
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  void loadApps();
});

function launchApp(app: CloudApp) {
  selectedApp.value = app;
}

function reloadApp() {
  iframeKey.value += 1;
}

async function enterFullscreen() {
  const frame = iframeRef.value;
  if (!frame) return;

  try {
    await frame.requestFullscreen();
  } catch (error) {
    console.error('Failed to enter fullscreen for cloud app:', error);
  }
}

function openRandomApp() {
  const availableApps = filteredApps.value;
  if (availableApps.length === 0) return;

  const app = availableApps[Math.floor(Math.random() * availableApps.length)];
  if (app) launchApp(app);
}
</script>

<template>
  <div class="cloudPage">
    <div v-if="!selectedApp" class="cloudContent">
      <div class="cloudToolbar">
        <label class="visuallyHidden" for="cloudSearch">Search cloud apps</label>
        <input
          id="cloudSearch"
          v-model="search"
          class="lumin-search"
          type="search"
          placeholder="Search..."
          autocomplete="off"
        />
        <button
          class="lumin-btn"
          type="button"
          :disabled="isLoading || filteredApps.length === 0"
          @click="openRandomApp"
        >
          Random
        </button>
      </div>
      <div v-if="!isLoading && !loadError" class="cloudGrid" aria-label="Cloud apps">
        <button
          v-for="app in filteredApps"
          :key="app.id"
          class="lumin-card"
          type="button"
          :aria-label="`Open ${app.name}`"
          @click="launchApp(app)"
        >
          <img
            class="lumin-card-image"
            :src="app.image"
            alt=""
            draggable="false"
          />
          <div class="lumin-card-overlay">
            <span class="lumin-card-title">{{ app.name }}</span>
          </div>
        </button>
        <p v-if="filteredApps.length === 0" class="cloudNoResults" role="status">
          No apps found.
        </p>
      </div>
    </div>

    <div
      v-if="selectedApp"
      class="cloudPlayer"
      role="dialog"
      :aria-label="`${selectedApp.name} player`"
    >
      <div class="cloudAppWindow">
        <iframe
          :key="iframeKey"
          ref="iframeRef"
          class="cloudFrame"
          :src="selectedApp.url"
          :title="selectedApp.name"
          allow="fullscreen; clipboard-read; clipboard-write"
        ></iframe>
        <div class="cloudAppTab">
          <div class="cloudAppInfo">
            <img class="cloudAppIcon" :src="selectedApp.image" :alt="`${selectedApp.name} logo`" />
            <span class="cloudAppName">{{ selectedApp.name }}</span>
          </div>
          <div class="cloudAppActions">
            <button
              class="cloudAppAction"
              type="button"
              aria-label="Fullscreen"
              title="Fullscreen"
              @click="enterFullscreen"
            >
              <Maximize aria-hidden="true" />
            </button>
            <button
              class="cloudAppAction"
              type="button"
              aria-label="Reload app"
              title="Reload app"
              @click="reloadApp"
            >
              <RefreshCw aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cloudPage {
  position: relative;
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  box-sizing: border-box;
  padding: 20px clamp(12px, 3vw, 32px) 32px;
  animation: fadeIn 200ms ease-out both;
}

.cloudPage::-webkit-scrollbar {
  display: none;
}

.cloudContent {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.cloudToolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 28px;
}

.visuallyHidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.lumin-search {
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
  height: 48px;
  padding: 0 18px;
  border: 2px solid var(--sg-border);
  border-radius: 14px;
  background: var(--sg-surface-raised);
  color: var(--sg-text);
  font-family: inherit;
  font-size: 16px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.22);
  transition: border-color 0.15s, box-shadow 0.15s;
}

.lumin-search::placeholder {
  color: var(--sg-text-muted);
}

.lumin-search:focus {
  outline: none;
  box-shadow:
    0 0 0 3px color-mix(in srgb, var(--sg-accent) 28%, transparent),
    0 6px 16px rgba(0, 0, 0, 0.22);
}

.lumin-btn {
  height: 48px;
  padding: 0 20px;
  border: 2px solid var(--sg-accent);
  border-radius: 12px;
  background: var(--sg-accent);
  color: var(--sg-text);
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.lumin-btn:focus-visible {
  outline: 2px solid var(--sg-accent-light);
  outline-offset: 2px;
}

.lumin-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.cloudStatus {
  margin: 8px 0;
  color: var(--sg-text-muted);
  text-align: center;
}

.cloudGrid {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 12px;
}

.lumin-card {
  position: relative;
  display: block;
  min-width: 0;
  width: 100%;
  aspect-ratio: 1;
  padding: 0;
  overflow: hidden;
  border: 2px solid var(--sg-border);
  border-radius: 12px;
  background: #160022;
  color: var(--sg-text);
  font-family: inherit;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.16s ease-out, border-color 0.16s ease-out, box-shadow 0.16s ease-out;
}

.lumin-card-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lumin-card:hover:not(:disabled),
.lumin-card:focus-visible:not(:disabled) {
  transform: translateY(-3px) scale(1.03);
  border-color: var(--sg-accent);
  box-shadow: 0 10px 22px var(--sg-shadow-strong);
  outline: none;
}

.lumin-card:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.lumin-card-overlay {
  position: absolute;
  inset: auto 0 0;
  padding: 20px 12px 12px;
  background: linear-gradient(to top, rgb(8 6 22 / 90%) 0%, rgb(8 6 22 / 0%) 60%);
  opacity: 0;
  transition: opacity 0.16s ease-out;
}

.lumin-card:hover:not(:disabled) .lumin-card-overlay,
.lumin-card:focus-visible:not(:disabled) .lumin-card-overlay {
  opacity: 1;
}

.lumin-card-title {
  font-size: 12px;
}

.cloudNoResults {
  grid-column: 1 / -1;
  margin: 8px 0;
  color: var(--sg-text-muted);
  text-align: center;
}

.cloudPlayer {
  position: absolute;
  inset: 0;
  z-index: 1;
  box-sizing: border-box;
  padding: 5rem;
  overflow: hidden;
  background: transparent;
}

.cloudAppWindow {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;
  overflow: hidden;
  border: 2px solid var(--sg-border);
  border-radius: 12px;
  background: var(--sg-surface);
}

.cloudFrame {
  display: block;
  flex: 1;
  min-width: 0;
  min-height: 0;
  width: 100%;
  border: 0;
}

.cloudAppTab {
  display: flex;
  flex: 0 0 48px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-sizing: border-box;
  padding: 0 8px 0 12px;
  border-top: 2px solid var(--sg-border);
  background: var(--sg-surface);
  color: var(--sg-text);
}

.cloudAppInfo,
.cloudAppActions {
  display: flex;
  align-items: center;
}

.cloudAppInfo {
  min-width: 0;
  gap: 10px;
}

.cloudAppIcon {
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  border-radius: 6px;
  object-fit: cover;
}

.cloudAppName {
  overflow: hidden;
  font-size: 14px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cloudAppActions {
  flex: 0 0 auto;
  gap: 4px;
}

.cloudAppAction {
  display: inline-flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--sg-text-soft);
  cursor: pointer;
}

.cloudAppAction:hover {
  background: var(--sg-surface-hover);
  color: var(--sg-text);
}

.cloudAppAction:focus-visible {
  outline: 2px solid var(--sg-accent-light);
  outline-offset: 2px;
}

.cloudAppAction :deep(svg) {
  width: 18px;
  height: 18px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cloudPage {
    animation: none;
  }

  .lumin-card {
    transition: none;
  }

  .lumin-card-overlay {
    transition: none;
  }

  .lumin-card:hover,
  .lumin-card:focus-visible {
    transform: none;
  }
}

@media (hover: none) {
  .lumin-card-overlay {
    opacity: 1;
  }
}

@media (max-width: 640px) {
  .cloudGrid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 360px) {
  .cloudGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
