import { ref } from 'vue';
import { PROVIDER, MODEL_TIERS } from '../config/apiProviders.js';
import { STORAGE_KEYS } from '../config/brand.js';

// 提炼自原 ChatContainer.vue 的流式 SSE 解析逻辑。
// 单一职责：调用 DeepSeek Chat Completions 并以 ref 暴露流式 content / reasoning_content / usage / 状态。
export function useChatStream() {
  const isStreaming = ref(false);
  const isLoading = ref(false);
  const content = ref('');
  const reasoningContent = ref('');
  const usage = ref(null);
  const errorMessage = ref('');

  let abortController = null;

  const reset = () => {
    content.value = '';
    reasoningContent.value = '';
    usage.value = null;
    errorMessage.value = '';
  };

  const stop = () => {
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
    isStreaming.value = false;
    isLoading.value = false;
  };

  const readSettings = () => {
    const apiKey = localStorage.getItem(STORAGE_KEYS.apiKey) || '';
    const baseUrl =
      localStorage.getItem(STORAGE_KEYS.baseUrl) || PROVIDER.defaultBaseUrl;
    const defaultModel =
      localStorage.getItem(STORAGE_KEYS.defaultModel) || MODEL_TIERS.flash.id;
    return { apiKey, baseUrl, defaultModel };
  };

  const run = async ({ messages, modelId, signalSource } = {}) => {
    const { apiKey, baseUrl, defaultModel } = readSettings();
    if (!apiKey) {
      errorMessage.value = 'API_KEY_MISSING';
      throw new Error('API_KEY_MISSING');
    }

    reset();
    isLoading.value = true;
    isStreaming.value = true;

    abortController = signalSource || new AbortController();
    const signal = abortController.signal;

    let fullContent = '';
    let fullReasoning = '';
    let lastUsage = null;

    try {
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelId || defaultModel,
          messages,
          stream: true,
        }),
        signal,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status} ${text || response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') continue;
          try {
            const data = JSON.parse(payload);
            const delta = data.choices?.[0]?.delta;
            if (delta?.reasoning_content) {
              fullReasoning += delta.reasoning_content;
              reasoningContent.value = fullReasoning;
              isLoading.value = false;
            }
            if (delta?.content) {
              fullContent += delta.content;
              content.value = fullContent;
              isLoading.value = false;
            }
            if (data.usage) {
              lastUsage = data.usage;
              usage.value = data.usage;
            }
          } catch {
            // 忽略单行解析错误，继续吃后续 SSE 数据
          }
        }
      }

      isStreaming.value = false;
      isLoading.value = false;
      return {
        content: fullContent,
        reasoning_content: fullReasoning,
        usage: lastUsage,
      };
    } catch (error) {
      isStreaming.value = false;
      isLoading.value = false;
      if (error.name === 'AbortError') {
        return {
          content: fullContent,
          reasoning_content: fullReasoning,
          usage: lastUsage,
          aborted: true,
        };
      }
      errorMessage.value = error.message || String(error);
      throw error;
    } finally {
      abortController = null;
    }
  };

  return {
    isStreaming,
    isLoading,
    content,
    reasoningContent,
    usage,
    errorMessage,
    run,
    stop,
    reset,
  };
}
