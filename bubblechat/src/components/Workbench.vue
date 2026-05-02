<template>
  <div>
    <LandingView
      v-if="view === 'landing'"
      @open-scenario="openScenario"
      @open-free-chat="openFreeChat"
      @open-settings="openSettings"
    />

    <DemoWorkspace
      v-else-if="view === 'demo' && currentScenario"
      :scenario="currentScenario"
      @back="backToLanding"
      @open-free-chat="openFreeChat"
      @open-settings="openSettings"
    />

    <FreeChat
      v-else-if="view === 'free-chat'"
      @back="backToLanding"
      @open-settings="openSettings"
    />

    <SettingsDrawer :open="settingsOpen" @close="settingsOpen = false" />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import LandingView from './landing/LandingView.vue';
import DemoWorkspace from './demo/DemoWorkspace.vue';
import FreeChat from './free-chat/FreeChat.vue';
import SettingsDrawer from './settings/SettingsDrawer.vue';
import { getScenarioById } from '../config/scenarios/index.js';

// view: 'landing' | 'demo' | 'free-chat'
const view = ref('landing');
const currentScenarioId = ref(null);
const settingsOpen = ref(false);

const currentScenario = computed(() =>
  currentScenarioId.value ? getScenarioById(currentScenarioId.value) : null,
);

// hash 路由：#/ , #/demo/<id> , #/chat
const parseHash = () => {
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  if (!hash) return { v: 'landing', id: null };
  if (hash === 'chat') return { v: 'free-chat', id: null };
  if (hash.startsWith('demo/')) {
    return { v: 'demo', id: hash.slice('demo/'.length) };
  }
  return { v: 'landing', id: null };
};

const writeHash = () => {
  let next = '#/';
  if (view.value === 'free-chat') next = '#/chat';
  if (view.value === 'demo' && currentScenarioId.value) {
    next = `#/demo/${currentScenarioId.value}`;
  }
  if (window.location.hash !== next) {
    window.history.replaceState(null, '', next);
  }
};

const syncFromHash = () => {
  const { v, id } = parseHash();
  if (v === 'demo') {
    const scenario = getScenarioById(id);
    if (scenario) {
      view.value = 'demo';
      currentScenarioId.value = id;
      return;
    }
  }
  if (v === 'free-chat') {
    view.value = 'free-chat';
    currentScenarioId.value = null;
    return;
  }
  view.value = 'landing';
  currentScenarioId.value = null;
};

const openScenario = (id) => {
  currentScenarioId.value = id;
  view.value = 'demo';
  writeHash();
  window.scrollTo({ top: 0 });
};

const openFreeChat = () => {
  view.value = 'free-chat';
  currentScenarioId.value = null;
  writeHash();
  window.scrollTo({ top: 0 });
};

const openSettings = () => {
  settingsOpen.value = true;
};

const backToLanding = () => {
  view.value = 'landing';
  currentScenarioId.value = null;
  writeHash();
};

onMounted(() => {
  syncFromHash();
  window.addEventListener('hashchange', syncFromHash);
});

onUnmounted(() => {
  window.removeEventListener('hashchange', syncFromHash);
});
</script>
