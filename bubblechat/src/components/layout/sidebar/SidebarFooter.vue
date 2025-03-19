<template>
  <footer class="mt-auto border-t border-base-300 bg-base-100/50">
    <ul class="menu menu-sm w-full rounded-none">
      <li>
        <button @click="$emit('update-api')" class="flex h-12 px-4 hover:bg-base-300">
          <CommandLineIcon class="h-5 w-5 mr-2" />
          {{ t('common.api') }}
          <br>
          {{ apiDisplay }}
        </button>
      </li>
      <li>
        <button @click="$emit('update-settings')" class="flex h-12 px-4 hover:bg-base-300">
          <Cog6ToothIcon class="h-5 w-5 mr-2" />
          {{ t('common.settings') }}
        </button>
      </li>
      <li>
        <button @click="$emit('show-about')" class="flex h-12 px-4 hover:bg-base-300">
          <InformationCircleIcon class="h-5 w-5 mr-2" />
          {{ t('common.about') }}
        </button>
      </li>
    </ul>

  </footer>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getAPIDisplay } from '../../../config/apiProviders';

import {
  CommandLineIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
} from '@heroicons/vue/24/outline';

const props = defineProps({
  language: {
    type: String,
    required: true
  },
  t: {
    type: Function,
    required: true
  },
  provider: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update-settings', 'update-api', 'show-about']);

const isAPISelectorOpen = ref(false);

// API state management
const currentAPI = ref({
  provider: 'deepseek',
  model: 'deepseek-chat'
});

const apiDisplay = computed(() => {
  console.log('provider:', props.provider);
  console.log('model:', props.model);
  
  currentAPI.value.provider = props.provider;
  currentAPI.value.model = props.model;
  return getAPIDisplay(props.provider, props.model)
}

);

// Load current API settings on mount
onMounted(async () => {
  try {
    // const savedAPI = await window.electron.getCurrentAPI();
    // if (savedAPI) {
    //   currentAPI.value = savedAPI;
    // }
  } catch (error) {
    console.error('Failed to load API settings:', error);
  }
});

</script>
