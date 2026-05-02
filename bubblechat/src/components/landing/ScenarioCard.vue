<template>
  <button
    type="button"
    class="magazine-card text-left"
    :class="sizeClass"
    @click="$emit('open', scenario.id)"
  >
    <div class="flex items-center justify-between mb-6">
      <span class="pill" :class="{ 'pill-pro': scenario.modelTier === 'pro' }">
        {{ scenario.modelTier === 'pro' ? 'V4-pro · 思考可见' : 'V4-flash' }}
      </span>
      <span class="text-xs text-ink-faint font-mono">No. {{ index }}</span>
    </div>

    <h3 class="font-serif font-bold text-ink-strong leading-tight"
        :class="isFeatured ? 'text-3xl' : 'text-2xl'">
      {{ scenario.title }}
    </h3>

    <p class="mt-3 text-ink-soft text-sm leading-relaxed line-clamp-3">
      {{ scenario.subtitle }}
    </p>

    <div class="mt-auto pt-6 flex flex-wrap items-center gap-2">
      <span
        v-for="tag in scenario.tags"
        :key="tag"
        class="text-xs text-ink-mute tracking-wide"
      >
        #{{ tag }}
      </span>
      <span class="ml-auto text-xs text-ink-soft group-hover:text-ink">
        进入演示 →
      </span>
    </div>
  </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  scenario: { type: Object, required: true },
  index: { type: Number, required: true },
  // 杂志网格里 spans 的尺寸提示：'sm' | 'md' | 'lg'
  size: { type: String, default: 'md' },
});

defineEmits(['open']);

const isFeatured = computed(() => props.size === 'lg');

const sizeClass = computed(() => {
  switch (props.size) {
    case 'lg':
      return 'sm:col-span-2 sm:row-span-2 min-h-[300px]';
    case 'sm':
      return 'min-h-[200px]';
    default:
      return 'min-h-[230px]';
  }
});
</script>
