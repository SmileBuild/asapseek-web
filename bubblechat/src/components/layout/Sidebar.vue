<template>
  <aside class="h-screen w-64 flex flex-col bg-base-300">
    <!-- Brand Logo and Header -->
    <div class="shrink-0">
      <SidebarHeader />
    </div>
    
    <!-- Chat Section - Flex grow and allow scroll -->
    <div class="flex-1 min-h-0">
      <SidebarChat
        :sessions="sessions"
        :active-session-id="activeSessionId"
        :language="language"
        :t="t"
        @new-chat="$emit('new-chat')"
        @select-session="$emit('select-session', $event)"
        @update-session="$emit('update-session', $event)"
        @remove-session="$emit('remove-session', $event)"
        @toggle-pin="$emit('toggle-pin', $event)"
      />
    </div>

    <!-- Footer Menu - Fixed at bottom -->
    <div class="shrink-0">
      <SidebarFooter
        :language="language"
        :provider="provider"
        :model="model"
        :t="t"
        @update-settings="$emit('update-settings', $event)"
        @update-api="$emit('update-api', $event)"        
        @show-about="$emit('show-about')"
      />
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue';
import { useTranslations } from '../../i18n/translations';
import SidebarHeader from './sidebar/SidebarHeader.vue';
import SidebarChat from './sidebar/SidebarChat.vue';
import SidebarFooter from './sidebar/SidebarFooter.vue';

const props = defineProps({
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
  provider:{
    type: String,
    required: true
  },
  model:{
    type: String,
    required: true
  }
});

// Translation helper
const t = computed(() => useTranslations(props.language));

defineEmits([
  'new-chat', 
  'select-session', 
  'show-about', 
  'remove-session', 
  'update-session', 
  'update-settings', 
  'update-api',
  'toggle-pin'
]);
</script>
