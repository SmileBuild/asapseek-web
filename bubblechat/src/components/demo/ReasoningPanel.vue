<template>
  <aside class="reasoning-panel" :class="{ 'is-empty': !text, 'is-collapsed': collapsed }">
    <button
      type="button"
      class="reasoning-header"
      @click="collapsed = !collapsed"
      :aria-expanded="!collapsed"
      :title="collapsed ? '展开思考过程' : '收起思考过程'"
    >
      <span class="reasoning-dot" :class="{ pulsing: streaming }"></span>
      <h4 class="font-mono text-xs uppercase tracking-[0.2em]">
        模型思考过程
      </h4>
      <span v-if="text && collapsed" class="reasoning-meta">
        {{ characterCount }} 字 · 点击展开
      </span>
      <span v-else-if="text" class="reasoning-meta">
        {{ characterCount }} 字
      </span>
      <span v-else class="reasoning-meta">V4-pro</span>
      <span class="reasoning-chevron" :class="{ rotated: collapsed }">▾</span>
    </button>

    <div v-show="!collapsed" class="reasoning-body">
      <div v-if="text" class="reasoning-text font-mono text-[12.5px]">{{ text }}<span v-if="streaming" class="caret">▌</span></div>
      <div v-else class="text-paper/40 italic text-sm">点击「运行」后，DeepSeek 的推理过程会在这里逐字呈现。</div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  text: { type: String, default: '' },
  streaming: { type: Boolean, default: false },
});

const collapsed = ref(false);
const characterCount = computed(() => props.text?.length || 0);

// 主输出开始流式时，自动收起思考面板，避免遮挡下方 output；
// 用户仍可手动展开。新一次运行重置为展开。
let mainContentStarted = false;
watch(
  () => props.streaming,
  (s, prev) => {
    if (s && !prev) {
      collapsed.value = false;
      mainContentStarted = false;
    }
  },
);
defineExpose({ collapse: () => (collapsed.value = true) });
</script>

<style scoped>
.reasoning-panel {
  background: linear-gradient(180deg, #1c1a14 0%, #0f0d08 100%);
  color: #f4eee0;
  border-radius: 16px;
  box-shadow: 0 18px 40px -28px rgba(11, 10, 7, 0.55);
  overflow: hidden;
}
.reasoning-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.9rem 1.25rem;
  color: #f4eee0;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  border-bottom: 1px solid rgba(244, 238, 224, 0.08);
}
.reasoning-panel.is-collapsed .reasoning-header {
  border-bottom-color: transparent;
}
.reasoning-meta {
  margin-left: auto;
  font-family: 'JetBrains Mono', 'SF Mono', monospace;
  font-size: 10.5px;
  color: rgba(244, 238, 224, 0.55);
}
.reasoning-chevron {
  font-size: 0.95rem;
  color: rgba(244, 238, 224, 0.55);
  transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1);
}
.reasoning-chevron.rotated {
  transform: rotate(-90deg);
}
.reasoning-body {
  padding: 1.1rem 1.25rem 1.4rem;
  max-height: 240px;
  overflow-y: auto;
}
.reasoning-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #8b5cf6;
  box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.6);
  flex-shrink: 0;
}
.reasoning-dot.pulsing {
  animation: pulse 1.4s ease-in-out infinite;
}
@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.6);
  }
  50% {
    box-shadow: 0 0 0 7px rgba(139, 92, 246, 0);
  }
}
.reasoning-text {
  white-space: pre-wrap;
  line-height: 1.7;
  color: rgba(244, 238, 224, 0.9);
}
.caret {
  display: inline-block;
  margin-left: 2px;
  animation: blink 0.9s steps(2, end) infinite;
  color: #8b5cf6;
}
@keyframes blink {
  to {
    opacity: 0;
  }
}
.is-empty {
  background: linear-gradient(180deg, #2c2a23 0%, #1a1812 100%);
}
</style>
