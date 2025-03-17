<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
  >
    <div
      class="bg-surface dark:bg-surface-dark rounded-lg p-6 w-[800px] max-w-full max-h-[90vh] flex flex-col"
    >
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold">{{ t("apiSelector.title") }}</h2>
        <button @click="close" class="text-gray-400 hover:text-white">
          <span class="material-icons">close</span>
        </button>
      </div>

      <!-- Content -->
      <div class="flex flex-1 overflow-hidden">
        <!-- Left side - Provider Selection -->
        <div
          class="w-64 border-r border-gray-200 dark:border-gray-700 pr-4 overflow-y-auto"
        >
          <h3 class="text-lg font-medium mb-4">
            {{ t("apiSelector.providerSection") }}
          </h3>
          <div class="space-y-2">
            <div class="api-box">
              <div
                class="item"
                v-for="provider in providers"
                :key="provider.id"
                @click="selectProvider(provider)"
              >
                <div style="width: 10px; flex-shrink: 0">
                  <div
                    v-show="selectedProvider.id == provider.id"
                    class="icon"
                  ></div>
                </div>
                <div style="padding-left: 5px">{{ provider.name }}</div>
              </div>
            </div>

            <!-- <button
              v-for="provider in providers"
              :key="provider.id"
              @click="selectProvider(provider)"
              :class="[
                'p-4 rounded-lg border text-left transition-colors',
                selectedProvider?.id === provider.id
                  ? 'bg-primary border-primary'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
              ]"
            >
              <div class="font-medium">{{ provider.name }}</div>
            </button> -->
          </div>
        </div>

        <!-- Right side - Settings Form -->
        <div class="flex-1 pl-6 overflow-y-auto">
          <!-- Model Selection -->
          <div v-if="selectedProvider">
            <!-- API Settings -->
            <div class="space-y-4">
              <!-- API Key -->
              <div class="space-y-1">
                <div style="display: flex">
                  <label class="block text-sm font-medium">{{
                    t("apiSelector.apiKey")
                  }}</label>
                  <div class="mb-6">
                    <a
                      :href="selectedProvider.docUrl"
                      target="_blank"
                      rel="noopener"
                      class="text-primary hover:text-primary/90 dark:text-primary/90 dark:hover:text-primary flex items-center gap-2 text-sm"
                    >
                      <span
                        class="material-icons text-sm"
                        style="padding-left: 5px"
                        >open_in_new</span
                      >
                      {{ t("apiSelector.viewDocs") }}
                    </a>
                  </div>
                </div>
                <input
                  type="password"
                  v-model="apiSettings[selectedProvider.id].apiKey"
                  :placeholder="t('apiSelector.apiKeyPlaceholder')"
                  class="w-full bg-surface-light dark:bg-surface-light-dark rounded px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:border-primary focus:outline-none"
                />
              </div>

              <!-- Base URL -->
              <div class="space-y-1">
                <label class="block text-sm font-medium">{{
                  t("apiSelector.baseUrl")
                }}</label>
                <input
                  type="text"
                  v-model="apiSettings[selectedProvider.id].baseUrl"
                  :placeholder="selectedProvider.defaultBaseUrl"
                  class="w-full bg-surface-light dark:bg-surface-light-dark rounded px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <!-- Test Connection Button -->
            <div class="mt-6">
              <button
                type="button"
                @click="handleConnectionTest"
                :disabled="testingConnection || !canTestConnection"
                class="w-full px-4 py-2 text-sm bg-surface-light dark:bg-surface-light-dark hover:bg-surface-light/90 dark:hover:bg-surface-light-dark/90 rounded mb-4 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 dark:text-gray-100"
              >
                <span v-if="testingConnection">{{
                  t("apiSelector.testing")
                }}</span>
                <span v-else>{{ t("apiSelector.testConnection") }}</span>
              </button>
            </div>
            <!-- 模型选择 -->
            <div class="model-box">
              <h3 class="text-lg font-medium mb-4">
                {{ t("apiSelector.modelSection") }}
              </h3>
              <template v-if="selectedProvider.name == 'Volcengine'">
                <div
                  v-for="model in selectedProvider.models"
                  :key="model.id"
                  style="
                    display: flex;
                    flex-direction: column;
                    align-items: start;
                  "
                  @click.stop="selectModel(model)"
                >
                  <div style="display: flex; align-items: center">
                    <div style="width: 10px; flex-shrink: 0">
                      <div
                        style="
                          width: 5px;
                          height: 20px;
                          background: green;
                          border-radius: 3px;
                        "
                        v-show="selectedModel.id == model.id"
                      ></div>
                    </div>
                    <div
                      class="font-medium"
                      style="margin: 5px 0; padding: 5px 0"
                    >
                      {{ model.name }}
                    </div>
                  </div>
                  <div class="editor">
                    <div @click.stop="editorModel(model)">
                      {{ t("apiSelector.editModel") }}
                    </div>
                    <div
                      @click.stop="deleteModel(model)"
                      style="margin-left: 10px; color: red"
                    >
                      {{ t("apiSelector.deleteModel") }}
                    </div>
                  </div>
                </div>
                <div style="padding-top: 20px">
                  {{ t("apiSelector.volcengineModels") }}
                </div>
                <el-button
                  class="add-model"
                  type="primary"
                  @click="addCustomModel"
                >
                  {{ t("apiSelector.addModel") }}</el-button
                >
              </template>
              <template v-else>
                <div
                  v-for="model in selectedProvider.models"
                  :key="model.id"
                  style="display: flex; align-items: center"
                  @click="selectModel(model)"
                >
                  <div style="width: 10px; flex-shrink: 0">
                    <div
                      style="
                        width: 5px;
                        height: 20px;
                        background: green;
                        border-radius: 3px;
                      "
                      v-show="selectedModel.id == model.id"
                    ></div>
                  </div>
                  <div class="font-medium" style="margin: 5px 0">
                    {{ model.name }}
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700"
      >
        <button
          @click="close"
          class="px-4 py-2 text-sm rounded text-gray-800 dark:text-gray-200 hover:bg-surface-light dark:hover:bg-surface-light-dark"
        >
          {{ t("apiSelector.cancel") }}
        </button>
        <button
          @click="save"
          :disabled="!canSave"
          class="px-4 py-2 text-sm bg-primary hover:bg-primary/90 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ t("apiSelector.save") }}
        </button>
      </div>
    </div>
    <!-- Model Form Modal -->
    <el-dialog
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      v-model="dialogFormVisible"
      :title="t('apiSelector.addModel')"
      width="500"
    >
      <el-form :model="modelForm">
        <el-form-item :label="t('apiSelector.modelId')">
          <el-input
            v-model="modelForm.id"
            autocomplete="off"
            :placeholder="t('apiSelector.modelIdPlaceholder')"
            :disabled="isModify"
          />
        </el-form-item>
        <el-form-item :label="t('apiSelector.modelName')">
          <el-input
            v-model="modelForm.name"
            autocomplete="off"
            :placeholder="t('apiSelector.modelNamePlaceholder')"
          />
        </el-form-item>
        <el-form-item :label="t('apiSelector.modelDescription')">
          <el-input
            type="textarea"
            v-model="modelForm.description"
            autocomplete="off"
            :placeholder="t('apiSelector.modelDescriptionPlaceholder')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">{{
            t("apiSelector.cancel")
          }}</el-button>
          <el-button type="primary" @click="clickSaveBtn">
            {{ t("apiSelector.save") }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, toRaw } from "vue";
import { useTranslations } from "../i18n/translations";
import { ElMessageBox } from "element-plus";

const isModify = ref(false);
const dialogFormVisible = ref(false);
const modelForm = ref({
  id: "",
  name: "",
  description: "",
});
const editorModel = (model) => {
  isModify.value = true;
  modelForm.value = model;
  console.log("selectedModel===", model);

  console.log(modelForm.value);
  dialogFormVisible.value = true;
};
const deleteModel = (model) => {
  ElMessageBox.confirm(`${t.value('apiSelector.deleteModelConfirm')}`, {
    confirmButtonText:  t.value("common.sure"),
    cancelButtonText: t.value("apiSelector.cancel"),
    type: "warning",
  })
    .then(() => {
      const index = selectedProvider.value.models.findIndex(
        (item) => item.id === model.id
      );
      if (index !== -1) {
        selectedProvider.value.models.splice(index, 1);
        console.log("selectedProvider===", selectedProvider);
        if (selectedProvider.value.models) {
          selectedModel.value = selectedProvider.value.models[0];
        }
        const currentIndex = providers.findIndex(
          (p) => p.id === selectedProvider.value.id
        );
        providers[currentIndex].models = toRaw(selectedProvider.value.models);
        console.log("providers====", providers);
        localStorage.setItem("providers", JSON.stringify(providers));
      }
    })
    .catch(() => {
      // 用户取消删除操作
    });
};
const clickSaveBtn = () => {
  if (!modelForm.value.id) {
    return;
  }
  if (!modelForm.value.name) {
    return;
  }
  if (!modelForm.value.description) {
    return;
  }
  dialogFormVisible.value = false;
  selectedModel.value = null;

  if (isModify.value) {
    selectedModel.value = modelForm.value;
    console.log(1);
  } else {
    console.log(2);
    isModify.value = false;
    selectedProvider.value.models.unshift(modelForm.value);
    selectedModel.value = modelForm.value;
    modelForm.value = {
      id: "",
      name: "",
      description: "",
    };
  }
  const currentIndex = providers.findIndex(
    (p) => p.id === selectedProvider.value.id
  );
  if (currentIndex !== -1) {
    providers[currentIndex].models = toRaw(selectedProvider.value.models);
    localStorage.setItem("providers", JSON.stringify(providers));
  }
  modelForm.value = {
    id: "",
    name: "",
    description: "",
  };
  isModify.value = false;
};

const t = computed(() => {
  const result = useTranslations(props.language);
  // 确保返回的是函数，无论 useTranslations 返回什么
  return typeof result === "function"
    ? result
    : result && typeof result.t === "function"
    ? result.t
    : (key) => key;
});

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  currentProvider: {
    type: String,
    default: "",
  },
  currentModel: {
    type: String,
    default: "",
  },
  language: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["close", "save"]);
const showingModelModal = ref(false);

let providers = [
  {
    id: "deepseek",
    name: "DeepSeek",
    icon: "smart_toy",
    description: "Advanced AI model for chat and reasoning",
    docUrl: "https://platform.deepseek.com/docs",
    defaultBaseUrl: "https://api.deepseek.com/chat/completions/",
    models: [
      {
        id: "deepseek-chat",
        name: "DeepSeek Chat",
        description: "General purpose chat model",
      },
      {
        id: "deepseek-reasoner",
        name: "DeepSeek Reasoner",
        description: "Advanced reasoning capabilities",
      },
    ],
  },
  {
    id: "volcengine",
    name: "Volcengine",
    icon: "smart_toy",
    description: "Volcengine AI services with DeepSeek models",
    docUrl: "https://console.volcengine.com/ark/region:ark+cn-beijing/endpoint",
    defaultBaseUrl: "/api/v3/chat/completions",
    models: [
      // {
      //   id: "ep-20250222222622-rccqb",
      //   name: "DeepSeek V3",
      //   description: "Advanced language model released on 2024/12/26",
      // },
      // {
      //   id: "ep-20250222222746-956z2",
      //   name: "DeepSeek R1",
      //   description: "Latest reasoning model released on 2025/01/20",
      // },
    ],
  },
  {
    id: "siliconflow",
    name: "Siliconflow",
    icon: "smart_toy",
    defaultBaseUrl: "https://api.siliconflow.com/v1/chat/completions",
    description: "Deepseek API services via Siliconflow",
    models: [
      {
        id: "deepseek-ai/DeepSeek-V3",
        name: "DeepSeek V3",
        description: "Latest version of DeepSeek model",
      },
      {
        id: "deepseek-ai/DeepSeek-R1",
        name: "DeepSeek R1",
        description: "Advanced reasoning model",
      },
    ],
  },
  {
    id: "aliyun",
    name: "Aliyun",
    icon: "smart_toy",
    description: "Aliyun AI services with DeepSeek models",
    docUrl: "https://help.aliyun.com/document_detail/613695.html",
    defaultBaseUrl:
      "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    models: [
      {
        id: "deepseek-v3",
        name: "deepseek-v3",
        description: "Advanced language model for general purpose tasks",
      },
      {
        id: "deepseek-r1",
        name: "deepseek-r1",
        description: "Specialized model for reasoning tasks",
      },
    ],
  },
];

// API Settings state
const apiSettings = ref({});
const testingConnection = ref(false);

// Initialize apiSettings for each provider
providers.forEach((provider) => {
  if (!apiSettings.value[provider.id]) {
    apiSettings.value[provider.id] = {
      apiKey: "",
      baseUrl: provider.defaultBaseUrl,
    };
  }
});

const selectedProvider = ref(providers[0]);
const selectedModel = ref(providers[0].models[0]);

// Load saved settings and initialize selected provider/model on mount
onMounted(() => {
  let localProviders = localStorage.getItem("providers");
  if (localProviders) {
    providers = JSON.parse(localProviders);
  } else {
    localStorage.setItem("providers", JSON.stringify(providers));
  }
  // Load API settings
  const savedSettings = localStorage.getItem("api-settings");
  console.log("savedSettings===", savedSettings);
  if (savedSettings) {
    const parsed = JSON.parse(savedSettings);
    Object.keys(parsed).forEach((providerId) => {
      if (apiSettings.value[providerId]) {
        apiSettings.value[providerId] = {
          ...apiSettings.value[providerId],
          ...parsed[providerId],
        };
      }
    });
  }
  // Validate and set provider
  const validProvider = providers.find(
    (p) => p.id === props.currentProvider.provider
  );
  console.log("validProvider===", props.currentProvider);
  if (validProvider) {
    selectedProvider.value = validProvider;
    // Validate and set model for the selected provider
    if (validProvider.value.models) {
      const validModel = validProvider.value.models.find(
        (m) => m.id === props.currentModel.id
      );
      if (validModel) {
        selectedModel.value = validModel;
      }
    }
  }
  console.log("selectedModel===", selectedModel.value);
});

const addCustomModel = () => {
  isModify.value = false;
  modelForm.value = {
    id: "",
    name: "",
    description: "",
  };
  dialogFormVisible.value = true;
};

const canTestConnection = computed(() => {
  if (!selectedProvider.value) return false;
  const settings = apiSettings.value[selectedProvider.value.id];
  return !!(settings?.apiKey && settings?.baseUrl);
});

const canSave = computed(() => {
  if (!selectedProvider.value || !selectedModel.value) return false;
  const settings = apiSettings.value[selectedProvider.value.id];
  return !!(settings?.apiKey && settings?.baseUrl);
});

const selectProvider = (provider) => {
  selectedProvider.value = provider;
  selectedModel.value = provider.models[0];
};

const selectModel = (model) => {
  selectedModel.value = model;
};

const handleConnectionTest = async () => {
  if (!selectedProvider.value || !canTestConnection.value) return;

  const settings = apiSettings.value[selectedProvider.value.id];
  testingConnection.value = true;

  try {
    const response = await fetch(settings.baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${settings.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: selectedModel.value.id,
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Hello!" },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Invalid response format");
    }

    alert("Connection successful!");
  } catch (error) {
    alert(`Error testing connection: ${error.message}`);
  } finally {
    testingConnection.value = false;
  }
};

const save = () => {
  if (!canSave.value) return;
  console.log(apiSettings.value);
  // Save API settings
  localStorage.setItem("api-settings", JSON.stringify(apiSettings.value));

  // Emit selected provider/model and settings
  emit("save", {
    selection: {
      provider: selectedProvider.value.id,
      model: selectedModel.value.id,
    },
    settings: apiSettings.value,
  });

  close();
};

const close = () => {
  emit("close");
};
</script>

<style lang="scss" scoped>
.api-box {
  .item {
    padding: 30px 0;
    display: flex;
    align-items: center;
  }
  .icon {
    height: 30px;
    width: 5px;
    background: green;
    border-radius: 5px;
  }
}
.add-model {
  margin-top: 20px;
}
.editor {
  display: flex;
  align-items: center;
}
</style>
