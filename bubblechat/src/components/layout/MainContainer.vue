<template>
  <div class="flex-1">
    <ChatContainer 
      v-if="activeView === 'chat'"
       :activeSessionId="activeSessionId"
      :messages="messages"
      :language="language"
      :isLoading="isLoading"
      :provider="provider"
      :model="model"
      :settings="settings"
      @send-message="(message, response, activeSessionId) => $emit('send-message', message, response, activeSessionId)"
      @error="$emit('error', $event, activeSessionId)"
      @clear-chat="$emit('clear-chat')"
    />
    <SettingsContainer
      v-else-if="activeView === 'settings'"
      :settings="settings"
      :language="language"
      @update-settings="$emit('update-settings', $event)"
    />
    <ApiSelectorContainer
      v-else-if="activeView === 'apiSelector'"
      :language="language"
      :current-provider="provider"
      :current-model="model"
      :settings="settings"
      @update-api="handleAPIUpdate"
      @view-change="$emit('view-change', $event)"
    />
    <AboutContainer
      v-else-if="activeView === 'about'"
      :language="language"
      :t="t"
    />
  </div>
</template>

<script setup>
import ChatContainer from './containers/ChatContainer.vue';
import SettingsContainer from './containers/SettingsContainer.vue';
import ApiSelectorContainer from './containers/ApiSelectorContainer.vue';
import AboutContainer from './containers/AboutContainer.vue';

defineProps({
  activeSessionId: {
    type: String,
    required: true
  },
  activeView: {
    type: String,
    required: true
  },
  messages: {
    type: Array,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  isLoading: {
    type: Boolean,
    required: true
  },
  provider: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  settings: {
    type: Object,
    required: true
  },
  t: {
    type: Function,
    required: true
  }
});

const emit = defineEmits(['send-message', 
'error', 
'clear-chat', 
'update-settings', 
'update-api', 
'view-change']);

const handleAPIUpdate = async ({ selection, settings }) => {
  try {
    console.log('selection:', selection);
    console.log('settings:', settings);
    
    emit('update-api', selection);
    emit('update-settings', { apiSettings: settings });
  } catch (error) {
    console.error('Failed to save API settings:', error);
    alert('Failed to save API settings: ' + error.message);
    // Reset to previous value if save failed    
  }
};
</script>
