<template>
  <transition name="drawer">
    <div v-if="open" class="drawer-root">
      <div class="drawer-backdrop" @click="$emit('close')"></div>

      <aside class="drawer-panel">
        <div class="flex items-baseline justify-between mb-8">
          <h2 class="font-serif text-2xl font-bold text-ink-strong">API 设置</h2>
          <button class="btn-ghost !py-1 !px-3 text-xs" @click="$emit('close')">关闭</button>
        </div>

        <div class="space-y-6 text-sm">
          <div>
            <label class="block text-xs uppercase tracking-[0.2em] text-ink-mute mb-2">
              DeepSeek API Key
            </label>
            <input
              v-model="form.apiKey"
              type="password"
              autocomplete="off"
              class="w-full px-4 py-3 rounded-xl bg-white border border-paper-deep focus:outline-none focus:border-ink font-mono text-sm"
              placeholder="sk-..."
            />
            <p class="text-xs text-ink-mute mt-2">
              仅保存在本地浏览器（localStorage）。前端直连 DeepSeek API，不经任何中间服务。
            </p>
          </div>

          <div>
            <label class="block text-xs uppercase tracking-[0.2em] text-ink-mute mb-2">
              Base URL
            </label>
            <input
              v-model="form.baseUrl"
              type="text"
              class="w-full px-4 py-3 rounded-xl bg-white border border-paper-deep focus:outline-none focus:border-ink font-mono text-sm"
            />
            <p class="text-xs text-ink-mute mt-2">
              默认即 DeepSeek 官方接入点 · 通常无需修改
            </p>
          </div>

          <div>
            <label class="block text-xs uppercase tracking-[0.2em] text-ink-mute mb-2">
              默认模型
            </label>
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="m in PROVIDER.models"
                :key="m.id"
                type="button"
                class="rounded-xl border p-4 text-left transition-colors"
                :class="
                  form.defaultModel === m.id
                    ? 'border-ink bg-paper-soft'
                    : 'border-paper-deep bg-white hover:border-ink-faint'
                "
                @click="form.defaultModel = m.id"
              >
                <div class="font-serif font-bold text-ink-strong">{{ m.name }}</div>
                <div class="text-xs text-ink-soft mt-1 leading-relaxed">{{ m.description }}</div>
              </button>
            </div>
          </div>
        </div>

        <div class="mt-10 flex items-center gap-3">
          <button class="btn-primary" @click="save">保存</button>
          <button class="btn-ghost" @click="$emit('close')">取消</button>
          <span v-if="savedFlash" class="text-xs text-signal-good ml-auto">已保存 ✓</span>
        </div>
      </aside>
    </div>
  </transition>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import { PROVIDER, MODEL_TIERS } from '../../config/apiProviders.js';
import { STORAGE_KEYS } from '../../config/brand.js';

const props = defineProps({
  open: { type: Boolean, default: false },
});
const emit = defineEmits(['close', 'saved']);

const form = reactive({
  apiKey: '',
  baseUrl: PROVIDER.defaultBaseUrl,
  defaultModel: MODEL_TIERS.flash.id,
});

const savedFlash = ref(false);

const loadFromStorage = () => {
  form.apiKey = localStorage.getItem(STORAGE_KEYS.apiKey) || '';
  form.baseUrl =
    localStorage.getItem(STORAGE_KEYS.baseUrl) || PROVIDER.defaultBaseUrl;
  form.defaultModel =
    localStorage.getItem(STORAGE_KEYS.defaultModel) || MODEL_TIERS.flash.id;
};

watch(
  () => props.open,
  (next) => {
    if (next) {
      loadFromStorage();
      savedFlash.value = false;
    }
  },
  { immediate: true },
);

const save = () => {
  localStorage.setItem(STORAGE_KEYS.apiKey, form.apiKey.trim());
  localStorage.setItem(STORAGE_KEYS.baseUrl, form.baseUrl.trim() || PROVIDER.defaultBaseUrl);
  localStorage.setItem(STORAGE_KEYS.defaultModel, form.defaultModel);
  savedFlash.value = true;
  emit('saved');
  setTimeout(() => emit('close'), 600);
};
</script>

<style scoped>
.drawer-root {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  justify-content: flex-end;
}
.drawer-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(11, 10, 7, 0.4);
  backdrop-filter: blur(2px);
}
.drawer-panel {
  position: relative;
  width: min(440px, 100%);
  height: 100%;
  background: var(--paper);
  padding: 2.5rem;
  overflow-y: auto;
  box-shadow: -20px 0 40px -20px rgba(11, 10, 7, 0.3);
}
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 200ms ease;
}
.drawer-enter-active .drawer-panel,
.drawer-leave-active .drawer-panel {
  transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-enter-from .drawer-panel,
.drawer-leave-to .drawer-panel {
  transform: translateX(20px);
}
</style>
