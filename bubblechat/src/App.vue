<template>
  <div>
    <LoadingWhale :show="isLoading" />
    <div class="min-h-screen bg-base-100">
      <SessionManager 
        :language="language"
        :t="t"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, provide, computed } from 'vue';
import SessionManager from './components/SessionManager.vue';
import LoadingWhale from './components/modals/LoadingWhale.vue';
import { useTranslations } from './i18n/translations';

const isLoading = ref(true);
const language = ref(localStorage.getItem('app-language') || 'zh');
const theme = ref(localStorage.getItem('data-theme') || 'dark');
const t = computed(() => useTranslations(language.value));

// Watch for theme changes and apply them
watch(theme, (newTheme) => {
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('data-theme', newTheme);
  console.log('newTheme', newTheme);
  // 也同步到Electron存储
  // if (window.electronAPI) {
  //   window.electronAPI.setTheme(newTheme);
  // }
}, { immediate: true });

// Watch for language changes
watch(language, (newLang) => {
  localStorage.setItem('app-language', newLang);
});

// Handle settings updates from SettingsModal
const handleSettingsUpdate = (settings) => {
  if (settings?.commonSettings) {
    // Update language if provided
    if (settings.commonSettings.language) {
      language.value = settings.commonSettings.language;
    }
    
    // Update theme if provided
    if (settings.commonSettings.theme) {
      theme.value = settings.commonSettings.theme;
    }
  }
};

// Handle loading state
onMounted(() => {
  // Show loading animation for 2 seconds on initial mount
  setTimeout(() => {
    isLoading.value = false;
  }, 2000);
});

// Reset loading state on page refresh/navigation
window.addEventListener('beforeunload', () => {
  isLoading.value = true;
});

// Provide settings update handler to SessionManager
provide('onSettingsUpdate', handleSettingsUpdate);
</script>
