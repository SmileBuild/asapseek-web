<template>
  <div class="flex flex-col h-full">
    <!-- New Chat Button -->
    <div class="p-4 bg-base-100/50 shrink-0">
      <button @click="$emit('new-chat')" class="btn btn-primary btn-block gap-2">
        <PlusIcon class="h-5 w-5" />
        {{ t('common.newChat') }}
      </button>
    </div>

    <!-- Chat List - Allow scroll in flex container -->
    <div class="flex-1 min-h-0">
      <ChatList
        :sessions="sessions"
        :active-session-id="activeSessionId"
        :language="language"
        :t="t"
        @select-session="$emit('select-session', $event)"
        @update-session="$emit('update-session', $event)"
        @remove-session="$emit('remove-session', $event)"
        @toggle-pin="$emit('toggle-pin', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { PlusIcon } from '@heroicons/vue/24/outline';
import ChatList from './ChatList.vue';

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

defineEmits(['new-chat', 'select-session', 'update-session', 'remove-session', 'toggle-pin']);
</script>
