<template>
  <div class="flex flex-col items-center justify-center h-full p-8">
    <h2 class="text-2xl font-bold mb-4">{{ t('about.title') }}</h2>
    <p class="mb-4">{{ t('about.description') }}</p>
    <div class="text-sm text-base-content/70">
      <p>Version: 0.1.0</p>        
    </div>
  </div>
</template>

<script setup>
defineProps({
  language: {
    type: String,
    required: true
  },
  t: {
    type: Function,
    required: true
  }
});
</script>
