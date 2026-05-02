<template>
  <div>
    <LandingHero
      @open-free-chat="$emit('open-free-chat')"
      @open-settings="$emit('open-settings')"
    />

    <nav class="sticky top-0 z-30 backdrop-blur bg-paper/80 border-b border-paper-deep">
      <div class="canvas flex items-center gap-6 py-3 text-sm">
        <span class="font-serif font-bold text-ink-strong mr-auto">
          {{ BRAND.name }}
        </span>
        <a
          v-for="industry in INDUSTRIES"
          :key="industry.id"
          :href="`#${industry.id}`"
          class="text-ink-soft hover:text-ink transition-colors"
        >
          {{ industry.label }}
        </a>
        <button class="btn-ghost !py-1.5 !px-3 text-xs" @click="$emit('open-settings')">
          API 设置
        </button>
      </div>
    </nav>

    <main>
      <IndustrySection
        v-for="(industry, idx) in INDUSTRIES"
        :key="industry.id"
        :industry="industry"
        :scenarios="scenariosByIndustry[industry.id] || []"
        :global-start-index="industryStartIndices[idx]"
        @open-scenario="(id) => $emit('open-scenario', id)"
      />
    </main>

    <footer class="canvas py-16 text-xs text-ink-mute border-t border-paper-deep">
      <div class="flex items-center justify-between">
        <span>{{ BRAND.footer }}</span>
        <span>{{ scenarioCount }} 个场景 · 模型由 DeepSeek 提供</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { BRAND, INDUSTRIES } from '../../config/brand.js';
import { SCENARIOS_BY_INDUSTRY, SCENARIOS } from '../../config/scenarios/index.js';
import LandingHero from './LandingHero.vue';
import IndustrySection from './IndustrySection.vue';

defineEmits(['open-scenario', 'open-free-chat', 'open-settings']);

const scenariosByIndustry = SCENARIOS_BY_INDUSTRY;
const scenarioCount = SCENARIOS.length;

// 让卡片编号跨段累加，便于 No. 01 → No. 12 的杂志感连续编号
const industryStartIndices = computed(() => {
  let acc = 1;
  const out = [];
  for (const industry of INDUSTRIES) {
    out.push(acc);
    acc += (scenariosByIndustry[industry.id] || []).length;
  }
  return out;
});
</script>
