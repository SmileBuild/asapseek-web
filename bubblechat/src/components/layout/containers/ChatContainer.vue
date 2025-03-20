<template>
  <main class="flex-1 flex flex-col h-screen overflow-hidden bg-base-100">
    <!-- Chat Header -->
    <div class="p-4 border-b border-base-200 flex justify-between items-center">
      <div></div>
      <button
        v-if="messages.length > 0"
        @click="exportChat"
        class="btn btn-sm btn-outline"
      >
        <ArrowUpTrayIcon class="h-4 w-4 mr-2" />
        {{ t("chat.exportButton") }}
      </button>
    </div>

    <!-- Chat Messages -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4" ref="messagesContainer">
      <!-- Empty State -->
      <div
        v-if="messages.length === 0"
        class="flex flex-col items-center justify-center h-full text-center px-4 py-8 space-y-6 animate-fadeIn"
      >
        <div class="max-w-2xl w-full bg-base-200 rounded-xl p-8 space-y-6">
          <!-- Welcome Header -->
          <h2 class="text-2xl font-semibold text-base-content">
            {{ t("chat.emptyStateTitle") }}
          </h2>
          <p class="text-lg text-base-content/80">
            {{ t("chat.emptyStateDescription") }}
          </p>

          <!-- Tips List -->
          <div class="space-y-4">
            <ul class="space-y-3">
              <li
                v-for="(tip, index) in t('chat.emptyStateTips')"
                :key="index"
                class="flex items-center gap-2 text-base-content/70"
              >
                <div class="w-1.5 h-1.5 rounded-full bg-primary"></div>
                <span>{{ tip }}</span>
              </li>
            </ul>
          </div>

          <!-- Keyboard Shortcut -->
          <div
            class="text-sm text-base-content/60 pt-4 border-t border-base-300"
          >
            {{ t("chat.emptyStateKeyboardTip") }}
          </div>
        </div>
      </div>

      <!-- Message List -->
      <div
        v-for="message in messages"
        :key="message.id"
        :class="['flex', messageTypes[message.sender].align]"
      >
        <div
          class="flex gap-3 items-start max-w-3xl w-full"
          :class="[message.sender === 'user' ? 'flex-row-reverse' : 'flex-row']"
        >
          <!-- Avatar -->
          <div class="w-8 h-8 shrink-0 text-base-content">
            <UserCircleIcon
              v-if="message.sender === 'user'"
              class="w-full h-full"
            />
            <ChatBubbleOvalLeftEllipsisIcon v-else class="w-full h-full" />
          </div>

          <!-- Message Content Column -->
          <div class="flex-1 group relative">
            <!-- Name + Metadata Row -->
            <div
              class="flex items-center gap-2 mb-1"
              :class="[
                message.sender === 'user' ? 'flex-row-reverse' : 'flex-row',
              ]"
            >
              <span class="font-medium text-base-content">{{
                messageTypes[message.sender].name
              }}</span>
              <span class="text-sm text-base-content/70">{{
                formatTime(message.timestamp)
              }}</span>
              <span v-if="message.usage" class="text-sm text-base-content/60">
                ({{ message.usage.total_tokens }} tokens:
                {{ message.usage.prompt_tokens }} +
                {{ message.usage.completion_tokens }} completion)
              </span>
            </div>

            <!-- Message Content -->
            <div
              :class="[
                'p-4 rounded-lg relative',
                messageTypes[message.sender].class,
              ]"
            >
              <div v-if="message.sender === 'assistant'">
                <!-- Reasoning Content First -->
                <div
                  v-if="message.reasoning_content"
                  class="mb-4 pb-4 border-b border-base-300"
                >
                  <div class="text-sm font-medium text-base-content/70 mb-2">
                    Reasoning
                  </div>
                  <div
                    class="text-sm bg-base-200 p-3 rounded text-base-content"
                  >
                    {{ message.reasoning_content }}
                  </div>
                </div>
                <!-- Main Content -->
                <div v-html="renderMarkdown(message.content)" />
              </div>
              <div v-else>{{ message.content }}</div>
            </div>

            <!-- Copy Button -->
            <button
              class="absolute transition-all p-1.5 rounded bg-primary/10 hover:bg-primary/20 top-9"
              :class="[message.sender === 'user' ? '-left-10' : '-right-10']"
              @click="copyMessageContent(message)"
              :title="t('chat.copy')"
            >
              <ClipboardDocumentIcon class="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>
      </div>

      <!-- Streaming Message -->
      <div v-if="isStreaming" class="flex justify-start">
        <div class="flex gap-3 items-start max-w-3xl w-full">
          <div class="w-8 h-8 shrink-0 text-base-content">
            <ChatBubbleOvalLeftEllipsisIcon class="w-full h-full" />
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-medium text-base-content">{{
                messageTypes.assistant.name
              }}</span>
            </div>
            <div
              class="p-4 rounded-lg relative markdown-body bg-base-200 text-base-content shadow-sm"
            >
              <!-- Streaming Reasoning Content -->
              <div
                v-if="streamingReasoningContent"
                class="mb-4 pb-4 border-b border-base-300"
              >
                <div class="text-sm font-medium text-base-content/70 mb-2">
                  Reasoning
                </div>
                <div class="text-sm bg-base-300 p-3 rounded">
                  {{ streamingReasoningContent }}
                </div>
              </div>
              <!-- Streaming Main Content -->
              <div
                v-if="streamingContent"
                v-html="renderMarkdown(streamingContent)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Animation -->
      <div v-if="isLoading" class="flex justify-start">
        <div class="max-w-3xl p-4 rounded-lg bg-base-200 text-base-content">
          <div class="flex gap-2">
            <div
              class="w-2 h-2 bg-green-500/50 rounded-full animate-bounce"
            ></div>
            <div
              class="w-2 h-2 bg-green-500/50 rounded-full animate-bounce [animation-delay:0.2s]"
            ></div>
            <div
              class="w-2 h-2 bg-green-500/50 rounded-full animate-bounce [animation-delay:0.4s]"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Input -->
    <div class="border-t p-1 border-base-200">
      <!-- Action Buttons -->
      <div class="p-1 flex gap-3 justify-center">
        <button
          class="btn btn-sm btn-outline tooltip"
          :data-tip="t('chat.uploadDocument')"
        >
          <DocumentArrowUpIcon class="h-4 w-4" />
        </button>
        <button
          class="btn btn-sm btn-outline tooltip"
          :data-tip="t('chat.onlineSearch')"
        >
          <GlobeAltIcon class="h-4 w-4" />
        </button>
        <button
          class="btn btn-sm btn-outline tooltip"
          :data-tip="t('chat.clearChat')"
          @click="$emit('clear-chat')"
        >
          <TrashIcon class="h-4 w-4" />
        </button>
        <button
          class="btn btn-sm btn-outline tooltip"
          :data-tip="t('chat.knowledgeBase')"
        >
          <BookOpenIcon class="h-4 w-4" />
        </button>
      </div>

      <form @submit.prevent="sendMessage" class="flex gap-2">
        <textarea
          v-model="newMessage"
          :placeholder="t('chat.inputPlaceholder')"
          class="flex-1 rounded-lg px-4 py-2 bg-base-200 text-base-content focus:outline-none focus:ring-2 focus:ring-primary resize-none chat-input"
          rows="1"
          @input="autoResize"
          @keydown.enter.prevent="
            (e) => {
              if (!e.shiftKey) {
                sendMessage();
              } else {
                const start = e.target.selectionStart;
                const end = e.target.selectionEnd;
                newMessage.value =
                  newMessage.value.substring(0, start) +
                  '\n' +
                  newMessage.value.substring(end);
                e.target.selectionStart = e.target.selectionEnd = start + 1;
                autoResize(e);
              }
            }
          "
        ></textarea>
        <button
          type="submit"
          :disabled="!newMessage.trim() && !isStreaming"
          class="btn btn-primary"
        >
          {{ isStreaming ? t("chat.stopButton") : t("chat.sendButton") }}
        </button>
      </form>
    </div>

    <!-- Copy Success Alert -->
    <div
      v-if="showCopyAlert"
      class="fixed inset-0 flex items-center justify-center z-50"
    >
      <div class="alert alert-success shadow-lg">
        <CheckCircleIcon class="w-5 h-5" />
        <span>{{ t("chat.copySuccess") }}</span>
      </div>
    </div>

    <!-- Export Success Alert -->
    <div
      v-if="showExportSuccessAlert"
      class="fixed inset-0 flex items-center justify-center z-50"
    >
      <div class="alert alert-success shadow-lg">
        <CheckCircleIcon class="w-5 h-5" />
        <span>{{ t("chat.exportSuccess") }}</span>
      </div>
    </div>

    <!-- Export Error Alert -->
    <div
      v-if="showExportErrorAlert"
      class="fixed inset-0 flex items-center justify-center z-50"
    >
      <div class="alert alert-error shadow-lg">
        <ExclamationTriangleIcon class="w-5 h-5" />
        <span>{{ exportError }}</span>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, watch, onMounted, computed, onUnmounted, nextTick } from "vue";
import { marked } from "marked";
import hljs from "highlight.js";
import { useTranslations } from "../../../i18n/translations";
import DOMPurify from "dompurify";
import {
  UserCircleIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  DocumentArrowUpIcon,
  GlobeAltIcon,
  TrashIcon,
  BookOpenIcon,
  ArrowUpTrayIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/vue/24/solid";
import "highlight.js/styles/github-dark.css";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

// Auto resize textarea
const autoResize = (event) => {
  const textarea = event.target;
  textarea.style.height = "auto";
  textarea.style.height = textarea.scrollHeight + "px";
};

const showCopyAlert = ref(false);
const showExportSuccessAlert = ref(false);
const showExportErrorAlert = ref(false);
const exportError = ref("");
const streamingContent = ref("");
const streamingReasoningContent = ref("");
const isStreaming = ref(false);
const currentUsage = ref(null);
const isLoading = ref(false);
const abortController = ref(null);

const props = defineProps({
  messages: {
    type: Array,
    default: () => [],
  },
  language: {
    type: String,
    required: true,
  },
});

const t = computed(() => {
  return useTranslations(props.language);
});

const emit = defineEmits(["send-message", "error", "clear-chat"]);

// Format relative time
const formatTime = (timestamp) => {
  if (!timestamp) return "";
  return dayjs(timestamp).fromNow();
};

const newMessage = ref("");
const messagesContainer = ref(null);

// Message type styling configuration
const messageTypes = {
  user: {
    name: "you",
    class: "bg-primary text-primary-content shadow-sm",
    align: "justify-end",
  },
  assistant: {
    name: "assistant",
    class: "markdown-body bg-base-200 text-base-content shadow-sm",
    align: "justify-start",
  },
  error: {
    name: "system",
    class: "bg-error/20 text-error",
    align: "justify-start",
  },
};

// Export chat to markdown file
const exportChat = async () => {
  const cleanedMessages = props.messages.map(cleanMessageForIPC);
  const html = marked(messagesToMarkDown(cleanedMessages));
  const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "exported.html";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const messagesToMarkDown = (messages) => {
  return messages
    .map((msg) => {
      const timestamp = new Date(msg.timestamp).toLocaleString();
      const sender = msg.sender === "user" ? "You" : "Assistant";

      // Handle base content
      let content = msg.content;

      // For assistant messages, we already have markdown so keep it as is
      // For user messages, we should escape any markdown characters
      if (msg.sender === "user") {
        content = content.replace(/([*_`#\[\]])/g, "\\$1");
      }

      // Build the message block
      let markdown = `### ${sender} - ${timestamp}\n\n${content}\n\n`;

      // Add usage information for assistant messages if available
      if (msg.usage) {
        markdown += `\n_Tokens: ${msg.usage.total_tokens} (${msg.usage.prompt_tokens} prompt + ${msg.usage.completion_tokens} completion)_\n\n`;
      }
      return markdown;
    })
    .join("---\n\n");
};
// Setup stream event listeners
onMounted(() => {
  marked.setOptions({
    highlight: function (code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
    langPrefix: "hljs language-",
  });

  // Stream start
  // const startUnsubscribe = window.electron.on('stream:start', () => {
  //   isLoading.value = true;
  //   isStreaming.value = true;
  //   streamingContent.value = '';
  //   streamingReasoningContent.value = '';
  //   currentUsage.value = null;
  // });

  // Stream data
  // const dataUnsubscribe = window.electron.on('stream:data', (data) => {
  //   isLoading.value = false;
  //   if (data.type === 'reasoning') {
  //     streamingReasoningContent.value = data.fullContent;
  //   } else if (data.type === 'content') {
  //     streamingContent.value = data.fullContent;
  //   } else if (data.type === 'usage') {
  //     currentUsage.value = data.usage;
  //   }
  // });

  // Stream end
  // const endUnsubscribe = window.electron.on('stream:end', (result) => {
  //   isStreaming.value = false;
  //   // Emit the complete response
  //   emit('send-message', null, result);
  //   // Apply syntax highlighting after stream ends
  //   applyHighlighting();
  // });

  // Stream error
  // const errorUnsubscribe = window.electron.on('stream:error', (error) => {
  //   isLoading.value = false;
  //   isStreaming.value = false;
  //   emit('error', {
  //     content: error,
  //     sender: 'error'
  //   });
  // });

  // Cleanup listeners on component unmount
  onUnmounted(() => {
    // startUnsubscribe?.();
    // dataUnsubscribe?.();
    // endUnsubscribe?.();
    // errorUnsubscribe?.();
  });
});

// Copy message content
const copyMessageContent = async (message) => {
  try {
    let textToCopy = message.content;
    if (message.sender === "assistant") {
      // For assistant messages, we need to strip HTML tags since the content is markdown
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = renderMarkdown(message.content);
      textToCopy = tempDiv.textContent || tempDiv.innerText;
    }
    await navigator.clipboard.writeText(textToCopy);

    // Show and auto-hide copy success alert
    showCopyAlert.value = true;
    setTimeout(() => {
      showCopyAlert.value = false;
    }, 1000);
  } catch (error) {
    console.error("Failed to copy message:", error);
  }
};

// Syntax highlighting helper
const applyHighlighting = () => {
  nextTick(() => {
    document.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightElement(block);
    });
  });
};

// Render markdown with syntax highlighting and sanitization
const renderMarkdown = (content) => {
  try {
    const html = marked(content);
    const sanitized = DOMPurify.sanitize(html);
    // Schedule highlighting after rendering
    applyHighlighting();
    return sanitized;
  } catch (error) {
    console.error("Markdown rendering error:", error);
    return content;
  }
};

// Clean message object for IPC transfer
const cleanMessageForIPC = (message) => {
  // Keep only serializable properties
  return {
    id: message.id,
    content: message.content,
    sender: message.sender,
    timestamp: message.timestamp,
    usage: message.usage
      ? {
          total_tokens: message.usage.total_tokens,
          prompt_tokens: message.usage.prompt_tokens,
          completion_tokens: message.usage.completion_tokens,
        }
      : null,
    reasoning_content: message.reasoning_content,
  };
};

// Send message through IPC
const sendMessage = async () => {
  // 如果正在流式接收数据，则中止当前请求
  if (isStreaming.value) {
    if (abortController.value) {
      abortController.value.abort();
      abortController.value = null;
    }
    isStreaming.value = false;
    return;
  }
  const message = newMessage.value.trim();
  if (message && !isLoading.value) {
    try {
      newMessage.value = "";
      emit("send-message", message);
      isLoading.value = true;

      // Clean messages array before sending through IPC
      const cleanedMessages = props.messages.map(cleanMessageForIPC);
      console.log("cleanedMessages", cleanedMessages);
      loadSendMessage(message, cleanedMessages);

      // sendProviderMessage(message, cleanedMessages);
      // Send message through IPC bridge
      // await window.electron.sendChatMessage(
      //   message,
      //   cleanedMessages
      // );
      // Note: Response handling is done through stream events in the event listeners
    } catch (error) {
      console.error("API Error:", error);
      isLoading.value = false;
      // Let the stream:error event handler deal with error display
    }
  }
};

const loadSendMessage = async (message, messageHistory) => {
  try {
    const stream = await sendChatMessage(message, messageHistory);
    return handleStreamResponse(stream);
  } catch (error) {
    // event.sender.send("stream:error", error.message);
    throw error;
  }
};

const handleStreamResponse = async (response) => {
  const decoder = new TextDecoder();
  let buffer = "";
  let fullContent = "";
  let fullReasoningContent = "";
  let currentUsage = "";

  isLoading.value = true;
  isStreaming.value = true;
  streamingContent.value = "";
  streamingReasoningContent.value = "";

  try {
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // 解码新的数据块
      const textChunk = decoder.decode(value, { stream: true });
      buffer += textChunk;

      // 处理数据行
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim() === "" || !line.startsWith("data: ")) {
          continue;
        }

        const jsonData = line.slice(6);
        if (jsonData.trim() === "[DONE]") {
          continue;
        }

        try {
          const data = JSON.parse(jsonData);
          // 处理推理内容
          if (data.choices?.[0]?.delta?.reasoning_content !== undefined) {
            const reasoningDelta = data.choices[0].delta.reasoning_content;
            if (reasoningDelta) {
              fullReasoningContent += reasoningDelta;
            }
            streamingReasoningContent.value = fullReasoningContent;
            isLoading.value = false;
          }

          // 处理主要内容
          if (data.choices?.[0]?.delta?.content !== undefined) {
            const contentDelta = data.choices[0].delta.content;
            if (contentDelta) {
              fullContent += contentDelta;
              streamingContent.value = fullContent;
            }
            isLoading.value = false;
          }

          // 处理使用量数据
          if (data.usage) {
            currentUsage = data.usage;
            currentUsage.value = data.usage;
            isLoading.value = false;
          }
        } catch (e) {
          console.error("Error parsing streaming data:", e);
        }
      }
    }

    // 处理剩余的buffer
    if (buffer.trim()) {
      const line = buffer.trim();
      if (line.startsWith("data: ") && line.trim() !== "data: [DONE]") {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.choices?.[0]?.delta?.reasoning_content) {
            fullReasoningContent += data.choices[0].delta.reasoning_content;
            streamingReasoningContent.value = fullReasoningContent;
          }
          if (data.choices?.[0]?.delta?.content) {
            fullContent += data.choices[0].delta.content;
            streamingContent.value = fullContent;
          }
          if (data.usage) {
            currentUsage = data.usage;
          }
        } catch (e) {
          console.error("Error parsing final buffer:", e);
        }
      }
    }
    const finalResponse = {
      content: fullContent,
      reasoning_content: fullReasoningContent || null,
      usage: currentUsage,
      sender: "assistant",
      timestamp: new Date().toISOString(),
    };
    isStreaming.value = false;
    console.log("finalResponse", finalResponse);
    emit("send-message", null, finalResponse);
    applyHighlighting();
    return finalResponse;
  } catch (error) {
    if (error.name === "AbortError") {
      // 处理中止请求
      console.log("流式数据传输被中止");
      const finalResponse = {
        content: fullContent,
        reasoning_content: fullReasoningContent || null,
        usage: currentUsage.value,
        sender: "assistant",
        timestamp: new Date().toISOString(),
      };
      emit("send-message", null, finalResponse);
      return finalResponse;
    }

    isLoading.value = false;
    isStreaming.value = false;
    // emit("error", {
    //   content: error,
    //   sender: "error",
    // });
    throw error;
  }
};

const sendChatMessage = async (message, messageHistory) => {
  // 创建新的AbortController
  abortController.value = new AbortController();
  const signal = abortController.value.signal;

  const currentAPI = JSON.parse(
    localStorage.getItem("providers.currentAPI")
  ) || {
    provider: "deepseek",
    model: "deepseek-chat",
  };

  // Get provider settings
  const settings = JSON.parse(localStorage.getItem("providers.settings")) || {};
  const apiSettings = settings[currentAPI.provider];
  if (!apiSettings) {
    throw new Error(`No settings found for provider: ${currentAPI.provider}`);
  }

  const response = await fetch(apiSettings.baseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiSettings.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: currentAPI.model,
      messages: [
        ...messageHistory.map((msg) => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.content,
        })),
      ],
      stream: true,
    }),
    signal: signal, // 添加信号用于中止请求
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response;
};

// Auto scroll to bottom and apply highlighting when new messages arrive or streaming content updates
watch(
  [() => props.messages.length, streamingContent, streamingReasoningContent],
  () => {
    setTimeout(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop =
          messagesContainer.value.scrollHeight;
      }
    }, 0);
    // Apply syntax highlighting to new content
    applyHighlighting();
  }
);
</script>

<style>
.chat-input {
  max-height: 200px;
  overflow-y: auto;
}

.markdown-body {
  color: hsl(var(--bc));
}

.markdown-body pre {
  background-color: hsl(var(--b2));
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0;
  overflow-x: auto;
}
:root[data-theme="dark"] .hljs {
  background: #1e1e1e;
}
:root[data-theme="light"] .hljs {
  background: #e5e5e5;
}

.markdown-body code {
  background-color: hsl(var(--b3));
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.markdown-body p {
  margin: 1rem 0;
}

.markdown-body ul,
.markdown-body ol {
  margin: 1rem 0;
  padding-left: 2rem;
}

.markdown-body li {
  margin: 0.5rem 0;
}

.markdown-body blockquote {
  border-left: 4px solid hsl(var(--b3));
  margin: 1rem 0;
  padding-left: 1rem;
  color: hsl(var(--bc));
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin: 1.5rem 0 1rem;
  font-weight: 600;
  color: hsl(var(--bc));
}

.markdown-body pre code {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
  color: inherit;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}
</style>
