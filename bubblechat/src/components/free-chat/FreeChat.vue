<template>
  <div class="min-h-screen flex flex-col">
    <header class="sticky top-0 z-30 backdrop-blur bg-paper/80 border-b border-paper-deep">
      <div class="canvas flex items-center gap-4 py-3">
        <button class="btn-ghost !py-1.5 !px-3 text-xs" @click="$emit('back')">
          ← 返回展厅
        </button>
        <span class="font-serif font-bold text-ink-strong text-lg">自由对话</span>
        <div class="ml-auto flex items-center gap-2">
          <select
            v-model="modelId"
            class="text-xs px-3 py-1.5 rounded-full bg-white border border-paper-deep text-ink-soft focus:outline-none focus:border-ink"
          >
            <option v-for="m in PROVIDER.models" :key="m.id" :value="m.id">
              {{ m.name }}
            </option>
          </select>
          <button class="btn-ghost !py-1.5 !px-3 text-xs" @click="clear">清空</button>
        </div>
      </div>
    </header>

    <main class="canvas flex-1 py-8 flex flex-col">
      <div ref="scroller" class="flex-1 overflow-y-auto pr-1 space-y-6">
        <div v-if="messages.length === 0" class="text-ink-mute italic mt-16">
          这里是无脚本的自由发挥区——拿任何甲方现场抛出的问题来试都行。
        </div>

        <div
          v-for="msg in messages"
          :key="msg.id"
          class="flex gap-4"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-2xl rounded-2xl px-5 py-4"
            :class="
              msg.role === 'user'
                ? 'bg-ink-strong text-paper'
                : 'bg-white border border-paper-deep text-ink'
            "
          >
            <div v-if="msg.role === 'assistant'" class="prose-body" v-html="renderMarkdown(msg.content)" />
            <div v-else class="whitespace-pre-wrap text-sm leading-relaxed">{{ msg.content }}</div>
          </div>
        </div>

        <div v-if="streaming" class="flex justify-start">
          <div class="max-w-2xl rounded-2xl px-5 py-4 bg-white border border-paper-deep">
            <div v-if="stream.reasoningContent.value" class="text-xs text-ink-mute mb-2 font-mono">
              {{ stream.reasoningContent.value }}
            </div>
            <div class="prose-body" v-html="renderMarkdown(stream.content.value || '…')" />
          </div>
        </div>
      </div>

      <form @submit.prevent="send" class="mt-6 flex gap-3 items-end">
        <textarea
          v-model="draft"
          rows="1"
          @keydown.enter.exact.prevent="send"
          class="flex-1 px-4 py-3 rounded-2xl bg-white border border-paper-deep focus:outline-none focus:border-ink text-sm resize-none"
          placeholder="问点什么…（Enter 发送，Shift+Enter 换行）"
        ></textarea>
        <button class="btn-primary" type="submit" :disabled="!draft.trim() && !streaming">
          {{ streaming ? '停止' : '发送' }}
        </button>
      </form>

      <div
        v-if="errorVisible"
        class="mt-3 text-sm rounded-xl border border-signal-warn/30 bg-signal-warn/5 text-signal-warn px-4 py-3"
      >
        <template v-if="stream.errorMessage.value === 'API_KEY_MISSING'">
          没有检测到 API Key。
          <button class="ink-link ml-1" @click="$emit('open-settings')">前往设置</button>
        </template>
        <template v-else>
          {{ stream.errorMessage.value }}
        </template>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useChatStream } from '../../composables/useChatStream.js';
import { PROVIDER, MODEL_TIERS } from '../../config/apiProviders.js';
import { renderMarkdown } from '../../utils/markdown.js';

defineEmits(['back', 'open-settings']);

const messages = ref([]);
const draft = ref('');
const stream = useChatStream();
const errorVisible = ref(false);
const modelId = ref(MODEL_TIERS.flash.id);
const scroller = ref(null);

const streaming = computed(() => stream.isStreaming.value);

const scrollToBottom = () => {
  nextTick(() => {
    if (scroller.value) {
      scroller.value.scrollTop = scroller.value.scrollHeight;
    }
  });
};

watch([messages, () => stream.content.value], scrollToBottom, { deep: true });

const send = async () => {
  if (streaming.value) {
    stream.stop();
    return;
  }
  const text = draft.value.trim();
  if (!text) return;
  errorVisible.value = false;
  messages.value.push({ id: Date.now() + ':u', role: 'user', content: text });
  draft.value = '';
  scrollToBottom();

  const conversation = messages.value.map((m) => ({ role: m.role, content: m.content }));
  try {
    const result = await stream.run({
      messages: [
        { role: 'system', content: '你是 AsapSeek · Deepseek 生产力工作台中的对话助手，回答简洁、专业、有用。' },
        ...conversation,
      ],
      modelId: modelId.value,
    });
    messages.value.push({
      id: Date.now() + ':a',
      role: 'assistant',
      content: result.content || '',
    });
  } catch {
    errorVisible.value = true;
  }
};

const clear = () => {
  if (streaming.value) stream.stop();
  messages.value = [];
  stream.reset();
  errorVisible.value = false;
};
</script>
