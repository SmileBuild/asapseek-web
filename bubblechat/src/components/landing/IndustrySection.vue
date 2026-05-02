<template>
  <section :id="industry.id" class="scroll-anchor py-24 lg:py-32 border-t border-paper-deep">
    <div class="canvas">
      <div class="flex items-baseline justify-between mb-12">
        <div>
          <p class="text-xs tracking-[0.25em] uppercase text-ink-mute">
            {{ industry.eyebrow }}
          </p>
          <h2 class="mt-3 font-serif text-4xl lg:text-5xl font-bold text-ink-strong">
            {{ industry.label }}
          </h2>
        </div>
        <p class="hidden md:block max-w-md text-right text-ink-soft text-sm leading-relaxed">
          {{ industry.blurb }}
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
        <ScenarioCard
          v-for="(scenario, idx) in scenarios"
          :key="scenario.id"
          :scenario="scenario"
          :index="globalStartIndex + idx"
          :size="resolveSize(idx, scenarios.length)"
          @open="(id) => $emit('open-scenario', id)"
        />
        <div
          v-if="scenarios.length === 0"
          class="col-span-3 py-16 text-center text-ink-mute italic"
        >
          这里的卡片正在路上 · 阶段二填充中
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import ScenarioCard from './ScenarioCard.vue';

const props = defineProps({
  industry: { type: Object, required: true },
  scenarios: { type: Array, required: true },
  globalStartIndex: { type: Number, default: 1 },
});

defineEmits(['open-scenario']);

// 杂志网格：每段第 1 张设为大块，其余正常。卡片只有 1 张时也用大块。
function resolveSize(idx, total) {
  if (total === 1) return 'lg';
  if (idx === 0 && total >= 3) return 'lg';
  return 'md';
}
</script>
