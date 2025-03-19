<template>
  <div class="p-6">
    <h3 class="font-bold text-lg mb-4">{{ t('settings.commonSettings') }}</h3>
    
    <!-- Settings Form -->
    <div class="form-control gap-4">
      <!-- Language Selection -->
      <div>
        <label class="label">{{ t('settings.language') }}</label>
        <select class="select select-bordered w-full" v-model="settings.language">
          <option value="en">English</option>
          <option value="zh">中文</option>
        </select>
      </div>
      
      <!-- Theme Selection -->
      <div>
        <label class="label">{{ t('settings.theme') }}</label>
        <select class="select select-bordered w-full" v-model="settings.theme">
          <option value="light">{{ t('settings.light') }}</option>
          <option value="dark">{{ t('settings.dark') }}</option>
          <option value="coffee">{{ t('settings.coffee') }}</option>
          <option value="retro">{{ t('settings.retro') }}</option>            
          <option value="synthwave">{{ t('settings.synthwave') }}</option>
          <option value="cyberpunk">{{ t('settings.cyberpunk') }}</option>
          <option value="sunset">{{ t('settings.sunset') }}</option>
          <option value="business">{{ t('settings.business') }}</option>
        </select>
      </div>
    </div>

    <!-- Save Button -->
    <div class="mt-6">
      <button class="btn btn-primary" @click="save">{{ t('common.save') }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useTranslations } from '../../../i18n/translations';

const props = defineProps({
  language: {
    type: String,
    required: true
  }
});

// Translation helper
const t = computed(() => useTranslations(props.language));

const emit = defineEmits(['update-settings']);

const settings = ref({
  language: localStorage.getItem('app-language') || 'en',
  theme: localStorage.getItem('data-theme') || 'dark'
});

const save = () => {
  // Wrap settings in the expected structure
  emit('update-settings', {
    commonSettings: settings.value
  });
  
  // Update localStorage
  localStorage.setItem('app-language', settings.value.language);
  localStorage.setItem('data-theme', settings.value.theme);
  
  // Update daisyUI theme
  document.documentElement.setAttribute('data-theme', settings.value.theme);
};

// Initialize settings on mount
onMounted(() => {
  settings.value = {
    language: localStorage.getItem('app-language') || 'en',
    theme: localStorage.getItem('data-theme') || 'dark'
  };
  // Set initial theme
  document.documentElement.setAttribute('data-theme', settings.value.theme);
});
</script>
