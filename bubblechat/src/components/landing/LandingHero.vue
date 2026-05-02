<template>
  <header class="relative pt-20 pb-24 lg:pt-28 lg:pb-32">
    <div class="canvas">
      <div class="flex items-center justify-between text-xs tracking-[0.2em] uppercase text-ink-mute">
        <span>{{ BRAND.subtitle }}</span>
        <span>v0.1 · 2026</span>
      </div>

      <h1 class="mt-12 font-serif font-black leading-[1.05] text-ink-strong text-[56px] sm:text-[72px] lg:text-[96px]">
        {{ BRAND.heroLine1 }}<br />
        <span class="italic font-bold text-ink">{{ BRAND.heroLine2 }}</span>
      </h1>

      <p class="mt-8 max-w-2xl text-lg sm:text-xl text-ink-soft leading-relaxed">
        {{ BRAND.tagline }}。<br />
        把模型的能力，分场景拆成可立即上手的演示——
        <span class="ink-link">自媒体</span>、<span class="ink-link">电商</span>、<span class="ink-link">私募基金</span>。
      </p>

      <div class="mt-12 flex flex-wrap items-center gap-3">
        <button class="btn-primary" @click="$emit('open-free-chat')">
          自由对话
          <span aria-hidden="true">→</span>
        </button>
        <button class="btn-ghost" @click="$emit('open-settings')">
          API 设置
        </button>
        <a href="#self-media" class="btn-ghost">
          浏览 12 个场景
          <span aria-hidden="true">↓</span>
        </a>
      </div>

      <div class="mt-20 editorial-rule"></div>

      <dl class="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 text-sm text-ink-soft">
        <div>
          <dt class="text-xs uppercase tracking-wider text-ink-mute">行业</dt>
          <dd class="mt-1 font-medium text-ink">3 个</dd>
        </div>
        <div>
          <dt class="text-xs uppercase tracking-wider text-ink-mute">场景</dt>
          <dd class="mt-1 font-medium text-ink">12 张卡片</dd>
        </div>
        <div>
          <dt class="text-xs uppercase tracking-wider text-ink-mute">模型</dt>
          <dd class="mt-1 font-medium text-ink">V4-flash · V4-pro</dd>
        </div>
        <div>
          <dt class="text-xs uppercase tracking-wider text-ink-mute">数据</dt>
          <dd class="mt-1 font-medium text-ink">本地 · BYO Key</dd>
        </div>
      </dl>
    </div>
  </header>
</template>

<script setup>
import { BRAND } from '../../config/brand.js';

defineEmits(['open-free-chat', 'open-settings']);
</script>
