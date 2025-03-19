<template>
  <!-- Chat Sessions List -->
  <div class="h-full overflow-y-auto scrollbar-none hover:scrollbar-thumb-base-300">
    <ul class="menu menu-sm w-full p-0">
      <ChatItem
        v-for="session in sessions"
        :key="session.id"
        :session="session"
        :is-active="session.id === activeSessionId"
        :language="language"
        :t="t"
        @select="$emit('select-session', session.id)"
        @update="(title) => $emit('update-session', { id: session.id, title })"
        @remove="$emit('remove-session', session.id)"
        @toggle-pin="$emit('toggle-pin', session.id)"
      />
    </ul>
  </div>
</template>

<script setup>
import ChatItem from './ChatItem.vue';

defineProps({
  sessions: {
    type: Array,
    default: () => []
  },
  activeSessionId: {
    type: String,
    default: null
  },
  language: {
    type: String,
    required: true
  },
  t: {
    type: Function,
    required: true
  }
});

defineEmits(['select-session', 'update-session', 'remove-session', 'toggle-pin']);
</script>
