<template>
  <div class="output-renderer">
    <!-- markdown / thinking 类输出（thinking 类的"思考过程"由独立 ReasoningPanel 处理，
         这里只渲染最终结论） -->
    <div
      v-if="renderer === 'markdown' || renderer === 'thinking'"
      class="prose-body"
      v-html="html"
    />

    <!-- list：识别 1. 2. 3. 这种枚举型输出，单条卡片化展示 -->
    <ol v-else-if="renderer === 'list'" class="space-y-3">
      <li
        v-for="(item, idx) in listItems"
        :key="idx"
        class="rounded-xl border border-paper-deep bg-white px-4 py-3 flex gap-3 items-start"
      >
        <span class="font-mono text-xs text-ink-mute w-6 shrink-0 pt-0.5">
          {{ String(idx + 1).padStart(2, '0') }}
        </span>
        <span class="prose-body flex-1" v-html="renderInline(item)"></span>
      </li>
      <li
        v-if="listItems.length === 0 && raw"
        class="prose-body"
        v-html="html"
      />
    </ol>

    <!-- compare：识别二/三段对比内容（标记 ## 标题）并左右排版 -->
    <div
      v-else-if="renderer === 'compare'"
      class="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <article
        v-for="(seg, idx) in compareSegments"
        :key="idx"
        class="rounded-xl border border-paper-deep bg-white p-4"
      >
        <h4 class="font-serif font-bold text-ink-strong text-base mb-2">
          {{ seg.title || `版本 ${idx + 1}` }}
        </h4>
        <div class="prose-body" v-html="renderInline(seg.body)"></div>
      </article>
      <div
        v-if="compareSegments.length === 0 && raw"
        class="md:col-span-2 prose-body"
        v-html="html"
      />
    </div>

    <!-- table：直接复用 markdown table，prose-body 已样式化 -->
    <div v-else-if="renderer === 'table'" class="prose-body" v-html="html" />

    <!-- 兜底 -->
    <div v-else class="prose-body" v-html="html" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { renderMarkdown } from '../../utils/markdown.js';

const props = defineProps({
  raw: { type: String, default: '' },
  renderer: { type: String, default: 'markdown' },
});

const html = computed(() => renderMarkdown(props.raw));

const renderInline = (text) => renderMarkdown(text || '');

const listItems = computed(() => {
  if (!props.raw) return [];
  return props.raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => /^(\d+\.|-|\*)\s+/.test(line))
    .map((line) => line.replace(/^(\d+\.|-|\*)\s+/, ''));
});

const compareSegments = computed(() => {
  if (!props.raw) return [];
  const parts = props.raw.split(/\n##+\s+/);
  if (parts.length < 2) return [];
  const [head, ...rest] = parts;
  const segments = [];
  if (head.trim()) {
    segments.push({ title: '', body: head.trim() });
  }
  for (const part of rest) {
    const [firstLine, ...bodyLines] = part.split('\n');
    segments.push({ title: firstLine.trim(), body: bodyLines.join('\n').trim() });
  }
  return segments;
});
</script>
