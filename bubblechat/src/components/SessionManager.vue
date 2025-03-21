<template>
  <div class="flex min-h-screen bg-background">
    <Sidebar
      :sessions="sortedSessions"
      :activeSessionId="activeSessionId"
      :language="language"
      :provider="currentAPI.provider"
      :model="currentAPI.model"
      @new-chat="createNewChat"
      @select-session="selectSession"
      @show-about="() => (activeView = 'about')"
      @update-session="updateSession"
      @update-settings="() => (activeView = 'settings')"
      @update-api="() => (activeView = 'apiSelector')"
      @remove-session="removeSession"
      @toggle-pin="togglePin"
    />
    <MainContainer
      :activeView="activeView"
      :messages="currentMessages"
      :language="language"
      :isLoading="isLoading"
      :provider="currentAPI.provider"
      :model="currentAPI.model"
      :settings="apiSettings"
      :t="t"
      @send-message="handleSendMessage"
      @error="handleError"
      @clear-chat="clearCurrentChat"
      @update-settings="handleSettingsSave"
      @update-api="handleAPIChange"
      @view-change="activeView = $event"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from "vue";
import Sidebar from "./layout/Sidebar.vue";
import MainContainer from "./layout/MainContainer.vue";

// View and API State
const activeView = ref("chat");
const apiSettings = ref({});
const currentAPI = ref({
  provider: "deepseek",
  model: "deepseek-chat",
});

// State
const STORAGE_KEY = "bubblechat-sessions";
const sessions = ref([]);
const activeSessionId = ref("1");
const isLoading = ref(false);

const props = defineProps({
  language: {
    type: String,
    required: true,
  },
  t: {
    type: Function,
    required: true,
  },
});

const emit = defineEmits(["show-about", "error"]);

// Get settings update handler from parent
const onSettingsUpdate = inject("onSettingsUpdate");

// Computed property for sorted sessions
const sortedSessions = computed(() => {
  return [...sessions.value].sort((a, b) => {
    if (a.isPinned === b.isPinned) {
      return new Date(b.timestamp) - new Date(a.timestamp);
    }
    return a.isPinned ? -1 : 1;
  });
});

// Storage methods
const loadSessions = () => {
  try {
    const savedSessions = localStorage.getItem(STORAGE_KEY);
    return savedSessions ? JSON.parse(savedSessions) : [];
  } catch (error) {
    console.error("Error loading sessions:", error);
    return [];
  }
};

const saveSessions = (newSessions) => {
  console.log("Saving sessions:", newSessions);
  try {
    var cache = [];
    var str = JSON.stringify(newSessions, function (key, value) {
      if (typeof value === "object" && value !== null) {
        if (cache.indexOf(value) !== -1) {
          // 移除
          return;
        }
        // 收集所有的值
        cache.push(value);
      }
      return value;
    });
    cache = null; // 清空变量，便于垃圾回收机制回收
    localStorage.setItem(STORAGE_KEY, str);
  } catch (error) {
    console.error("Error saving sessions:", error);
  }
};

const updateStorageSession = (currentSessions, sessionId, updates) => {
  try {
    const sessionIndex = currentSessions.findIndex((s) => s.id === sessionId);
    if (sessionIndex === -1) return null;

    const updatedSessions = [...currentSessions];
    updatedSessions[sessionIndex] = {
      ...updatedSessions[sessionIndex],
      ...updates,
    };

    saveSessions(updatedSessions);
    return updatedSessions;
  } catch (error) {
    console.error("Error updating session:", error);
    return null;
  }
};

const deleteStorageSession = (currentSessions, sessionId) => {
  try {
    const updatedSessions = currentSessions.filter(
      (session) => session.id !== sessionId
    );
    saveSessions(updatedSessions);
    return updatedSessions;
  } catch (error) {
    console.error("Error deleting session:", error);
    return currentSessions;
  }
};

// Computed
const currentMessages = computed(() => {
  const session = sessions.value.find((s) => s.id === activeSessionId.value);
  return session ? session.messages : [];
});

// Load sessions and API settings on mount

const loadCreateChat = () => {
  const savedSessions = loadSessions();
  if (savedSessions.length > 0) {
    sessions.value = savedSessions;
    activeSessionId.value = savedSessions[0].id;
  } else {
    createNewChat();
  }
}

onMounted(() => {
  // Load saved sessions
  loadCreateChat()

  // Load saved API settings
  const savedApiSettings = localStorage.getItem("api-settings");
  if (savedApiSettings) {
    const parsedSettings = JSON.parse(savedApiSettings);
    // Initialize apiSettings with the current provider's settings if they exist
    apiSettings.value = parsedSettings[currentAPI.value.provider] || {};
  }

  // 获取最新的currentAPI
  const selection = JSON.parse(localStorage.getItem("providers.currentAPI"));
  if (selection) {
    currentAPI.value = selection;
  }
  console.log("selection:", selection);
});

// Watch for sessions changes
watch(
  sessions,
  (newSessions) => {
    saveSessions(newSessions);
  },
  { deep: true }
);

// Methods
const createNewChat = () => {
  const newSession = {
    id: Date.now().toString(),
    title: "New Chat",
    timestamp: new Date(),
    messages: [],
    isPinned: false,
  };
  sessions.value.unshift(newSession);
  activeSessionId.value = newSession.id;
  activeView.value = "chat"; // Switch to chat view when creating new chat
};

const updateSession = (update) => {
  const updatedSessions = updateStorageSession(sessions.value, update.id, {
    ...("title" in update ? { title: update.title } : {}),
    ...("isPinned" in update ? { isPinned: update.isPinned } : {}),
    timestamp: new Date(),
  });
  if (updatedSessions) {
    sessions.value = updatedSessions;
  }
};

const togglePin = (sessionId) => {
  const session = sessions.value.find((s) => s.id === sessionId);
  if (session) {
    updateSession({
      id: sessionId,
      isPinned: !session.isPinned,
    });
  }
};

const removeSession = (sessionId) => {
  sessions.value = deleteStorageSession(sessions.value, sessionId);
  if (activeSessionId.value === sessionId) {
    activeSessionId.value = sessions.value[0]?.id;
  }
};

const selectSession = (id) => {
  activeSessionId.value = id;
  activeView.value = "chat"; // Switch to chat view when selecting a session
};

const handleSettingsSave = (settings) => {
  // Handle common settings update
  if (settings.commonSettings && onSettingsUpdate) {
    onSettingsUpdate(settings);
    // Switch back to chat view after saving common settings
    activeView.value = "chat";
  }

  // Handle API settings update
  if (settings.apiSettings) {
    apiSettings.value = settings.apiSettings[currentAPI.value.provider] || {};
  }
};

const handleAPIChange = (selection) => {
  currentAPI.value = selection;
  // Update the active API settings based on the new provider
  apiSettings.value = localStorage.getItem("api-settings")
    ? JSON.parse(localStorage.getItem("api-settings"))[selection.provider] || {}
    : {};
};

const addMessage = (sessionId, message) => {
  console.log("Adding message===:", message);
  const sessionIndex = sessions.value.findIndex((s) => s.id === sessionId);
  if (sessionIndex === -1) return;

  const newMessage = {
    id: Date.now().toString(),
    ...message,
    timestamp: new Date(),
  };

  sessions.value[sessionIndex].messages.push(newMessage);

  // Update session title if it's the first message
  if (
    sessions.value[sessionIndex].messages.length === 1 &&
    message.sender === "user"
  ) {
    const newTitle =
      message.content.slice(0, 30) + (message.content.length > 30 ? "..." : "");
    sessions.value = updateStorageSession(sessions.value, sessionId, {
      title: newTitle,
      timestamp: new Date(),
    });
  }
};

const handleSendMessage = (message, response) => {
  const savedSessions = loadSessions();
  if (savedSessions.length > 0) {
    
  } else {
    createNewChat();
  }
  if (!activeSessionId.value) return;
  if (message !== null && !response) {
    // Initial user message
    addMessage(activeSessionId.value, {
      content: message,
      sender: "user",
    });
    isLoading.value = true;
  } else if (response) {
    // API response
    addMessage(activeSessionId.value, response);
    isLoading.value = false;
  }
};

const handleError = (errorMessage) => {
  isLoading.value = false;
  addMessage(activeSessionId.value, {
    content: `Error: ${errorMessage}`,
    sender: "error",
  });
};

const clearCurrentChat = () => {
  const sessionIndex = sessions.value.findIndex(
    (s) => s.id === activeSessionId.value
  );
  if (sessionIndex !== -1) {
    sessions.value[sessionIndex].messages = [];
  }
};
</script>
