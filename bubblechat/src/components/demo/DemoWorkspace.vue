<template>
  <div class="min-h-screen flex flex-col">
    <!-- 顶栏 -->
    <header class="sticky top-0 z-30 backdrop-blur bg-paper/80 border-b border-paper-deep">
      <div class="canvas flex items-center gap-4 py-3">
        <button class="btn-ghost !py-1.5 !px-3 text-xs" @click="$emit('back')">
          ← 返回展厅
        </button>
        <div class="hidden sm:flex items-center gap-3 text-sm">
          <span class="pill" :class="{ 'pill-pro': isPro }">
            {{ industryLabel }}
          </span>
          <span class="font-serif font-bold text-ink-strong text-lg">
            {{ scenario.title }}
          </span>
        </div>
        <div class="ml-auto flex items-center gap-2">
          <select
            v-model="selectedModelId"
            class="text-xs px-3 py-1.5 rounded-full bg-white border border-paper-deep text-ink-soft focus:outline-none focus:border-ink"
          >
            <option v-for="m in PROVIDER.models" :key="m.id" :value="m.id">
              {{ m.name }}
            </option>
          </select>
          <button class="btn-ghost !py-1.5 !px-3 text-xs" @click="$emit('open-free-chat')">
            自由对话
          </button>
        </div>
      </div>
    </header>

    <!-- 主体 -->
    <div class="canvas py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- 左：输入区 -->
      <section class="lg:col-span-5 space-y-5">
        <div>
          <p class="text-xs tracking-[0.25em] uppercase text-ink-mute mb-2">
            INPUT · 输入
          </p>
          <p class="text-sm text-ink-soft leading-relaxed">
            {{ scenario.subtitle }}
          </p>
        </div>

        <textarea
          v-model="inputText"
          class="w-full h-72 p-4 rounded-2xl bg-white border border-paper-deep focus:outline-none focus:border-ink text-sm leading-relaxed resize-none"
          placeholder="点击「载入示例」一键塞入预埋数据，或直接输入自己的内容…"
        ></textarea>

        <div class="flex flex-wrap items-center gap-3">
          <button class="btn-ghost" @click="loadDemo">
            载入示例
          </button>
          <button class="btn-ghost" @click="reset" :disabled="inputText === scenario.demoInput">
            重置为示例
          </button>
          <button
            class="btn-primary ml-auto"
            :disabled="!inputText.trim() || stream.isLoading.value"
            @click="run"
          >
            <template v-if="stream.isStreaming.value && !stream.isLoading.value">
              停止
            </template>
            <template v-else-if="stream.isLoading.value">
              请稍候…
            </template>
            <template v-else>
              开始演示 →
            </template>
          </button>
        </div>

        <div
          v-if="errorVisible"
          class="text-sm rounded-xl border border-signal-warn/30 bg-signal-warn/5 text-signal-warn px-4 py-3"
        >
          <template v-if="stream.errorMessage.value === 'API_KEY_MISSING'">
            没有检测到 API Key。
            <button class="ink-link ml-1" @click="$emit('open-settings')">前往设置</button>
          </template>
          <template v-else>
            {{ stream.errorMessage.value }}
          </template>
        </div>
      </section>

      <!-- 右：输出区 -->
      <section class="lg:col-span-7 space-y-5">
        <div class="flex items-center gap-3">
          <p class="text-xs tracking-[0.25em] uppercase text-ink-mute">OUTPUT · 输出</p>
          <span
            v-if="stream.isStreaming.value"
            class="text-xs text-accent flex items-center gap-1.5"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
            流式生成中
          </span>
          <span
            v-if="stream.usage.value"
            class="ml-auto text-xs text-ink-mute font-mono"
          >
            {{ stream.usage.value.total_tokens }} tokens
          </span>
        </div>

        <ReasoningPanel
          v-if="scenario.showReasoning"
          :text="stream.reasoningContent.value"
          :streaming="stream.isStreaming.value && !stream.content.value"
        />

        <div
          class="rounded-2xl bg-white border border-paper-deep p-6 min-h-[280px]"
        >
          <div
            v-if="!stream.content.value && !stream.isLoading.value && !stream.isStreaming.value"
            class="text-ink-mute text-sm italic"
          >
            等待输出 · 输入区准备就绪后点击「开始演示」
          </div>

          <div v-if="stream.isLoading.value && !stream.content.value" class="flex gap-2">
            <span class="w-2 h-2 rounded-full bg-ink-faint animate-bounce"></span>
            <span class="w-2 h-2 rounded-full bg-ink-faint animate-bounce" style="animation-delay: 0.15s"></span>
            <span class="w-2 h-2 rounded-full bg-ink-faint animate-bounce" style="animation-delay: 0.3s"></span>
          </div>

          <OutputRenderer
            v-if="stream.content.value"
            :raw="stream.content.value"
            :renderer="scenario.outputRenderer"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onUnmounted } from 'vue';
import { useChatStream } from '../../composables/useChatStream.js';
import { PROVIDER, MODEL_TIERS, getModelByTier } from '../../config/apiProviders.js';
import { INDUSTRY_BY_ID } from '../../config/brand.js';
import ReasoningPanel from './ReasoningPanel.vue';
import OutputRenderer from './OutputRenderer.vue';

const props = defineProps({
  scenario: { type: Object, required: true },
});

const emit = defineEmits(['back', 'open-free-chat', 'open-settings']);

const inputText = ref(props.scenario.demoInput || '');
const stream = useChatStream();
const errorVisible = ref(false);

const selectedModelId = ref(getModelByTier(props.scenario.modelTier).id);

const isPro = computed(() => props.scenario.modelTier === 'pro');
const industryLabel = computed(
  () => INDUSTRY_BY_ID[props.scenario.industry]?.label || props.scenario.industry,
);

watch(
  () => props.scenario.id,
  () => {
    inputText.value = props.scenario.demoInput || '';
    selectedModelId.value = getModelByTier(props.scenario.modelTier).id;
    stream.reset();
    errorVisible.value = false;
  },
);

const loadDemo = () => {
  inputText.value = props.scenario.demoInput || '';
};

const reset = () => {
  inputText.value = props.scenario.demoInput || '';
  stream.reset();
  errorVisible.value = false;
};

const run = async () => {
  if (stream.isStreaming.value) {
    stream.stop();
    return;
  }
  errorVisible.value = false;
  const userPrompt = (props.scenario.userPromptTemplate || '{{input}}').replace(
    '{{input}}',
    inputText.value,
  );
  const messages = [
    { role: 'system', content: props.scenario.systemPrompt },
    { role: 'user', content: userPrompt },
  ];
  try {
    await stream.run({ messages, modelId: selectedModelId.value });
  } catch {
    errorVisible.value = true;
  }
};

onUnmounted(() => {
  if (stream.isStreaming.value) stream.stop();
});
</script>
