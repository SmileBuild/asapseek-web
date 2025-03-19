<template>
  <div class="container mx-auto p-6">
    <div class="toast toast-center toast-middle z-[1000]"></div>
    <div>
      <div class="mb-6">
        <h3 class="font-bold text-lg mb-4">{{ t('apiSelector.title') }}</h3>
        <div class="tabs tabs-boxed">
          <button class="tab" :class="{ 'tab-active': activeTab === 'settings' }" @click="activeTab = 'settings'">
            {{ t('apiSelector.settingsTab') }}
          </button>
          <button class="tab" :class="{ 'tab-active': activeTab === 'speedtest' }" @click="activeTab = 'speedtest'">
            {{ t('apiSelector.speedTestTab') }}
          </button>
        </div>
      </div>

      <!-- 从原APISelector.vue复制主要内容，但移除modal相关标记 -->



      <!-- API设置标签页 -->
      <div v-show="activeTab === 'settings'" class="flex gap-6">
        <!-- 左侧 Provider 选择 -->
        <div class="w-64 border-r border-base-300 pr-4">
          <ul class="menu bg-base-100 w-full">
            <li class="menu-title">{{ t('apiSelector.providerSection') }}</li>
            <li v-for="provider in providers" :key="provider.id" :class="[
              'transition-all duration-200',
              selectedProvider?.id === provider.id ?
                'bg-base-200 border-l-4 border-primary' : 'border-l-4 border-transparent'
            ]">
              <a @click="selectProvider(provider)" class="hover:bg-base-200 focus:bg-base-300" :class="[
                'flex flex-col items-start gap-1 py-3',
                selectedProvider?.id === provider.id ? 'pl-3' : ''
              ]">
                <span class="font-medium">{{ provider.name }}</span>
                <span class="text-xs" :class="[
                  selectedProvider?.id === provider.id ? 'opacity-80' : 'opacity-70'
                ]">
                </span>
              </a>
            </li>
          </ul>
        </div>

        <!-- 右侧区域 -->
        <div class="flex-1">
          <!-- API设置表单 -->
          <div v-if="selectedProvider" class="space-y-6">
            <!-- API Settings -->
            <div class="form-control gap-4">
              <div>
                <div class="py-1 flex">
                  <span class="text-sm p-1">{{ t('apiSelector.apiKey') }}</span>
                  <a :href="selectedProvider.docUrl" target="_blank" rel="noopener"
                    class="link link-primary flex items-center gap-2 text-sm p-1">
                    {{ t('apiSelector.viewDocs') }}
                  </a>
                </div>
                <input type="password" v-model="apiSettings[selectedProvider.id].apiKey"
                  :placeholder="t('apiSelector.apiKeyPlaceholder')" class="input input-bordered w-full" />
              </div>

              <div>
                <div class=" py-1">
                  <span class="text-sm p-1">{{ t('apiSelector.baseUrl') }}</span>
                </div>
                <input type="text" v-model="apiSettings[selectedProvider.id].baseUrl"
                  :placeholder="selectedProvider.defaultBaseUrl" class="input input-bordered w-full" />
              </div>

              <!-- Test Connection Button -->
              <button class="btn btn-outline w-full mt-2" @click="handleConnectionTest"
                :disabled="testingConnection || !canTestConnection">
                {{ testingConnection ? t('apiSelector.testing') : t('apiSelector.testConnection') }}
              </button>
            </div>
            <!-- Model Selection -->
            <div>
              <h4 class="font-medium mb-4">{{ t('apiSelector.modelSection') }}</h4>
              <!-- Custom volcengine Models List -->
              <ul class="menu bg-base-100 w-full [&>li:not(:last-child)]:border-b border-base-200"
                v-if="selectedProvider?.id === 'volcengine'">
                <li v-for="model in customModels" :key="model.id" :class="[
                  'transition-all duration-200',
                  selectedModel?.id === model.id ?
                    'bg-base-200 !border-l-4 !border-primary' : 'border-l-4 border-transparent'
                ]">
                  <a @click="selectModel(model)" class="hover:bg-base-200 focus:bg-base-300" :class="[
                    'flex flex-col items-start gap-1 py-3',
                    selectedModel?.id === model.id ? 'pl-3' : ''
                  ]">
                    <span class="font-medium">{{ model.name }}</span>
                    <div class="flex gap-2 mt-2">
                      <button class="btn btn-xs btn-ghost" @click.stop="openModelModal(model)">
                        {{ t('apiSelector.editModel') }}
                      </button>
                      <button class="btn btn-xs btn-ghost text-error" @click.stop="deleteModel(model)">
                        {{ t('apiSelector.deleteModel') }}
                      </button>
                    </div>
                  </a>
                </li>
              </ul>
              <!-- Standard Models List -->
              <ul class="menu bg-base-100 w-full [&>li:not(:last-child)]:border-b border-base-200" v-else>
                <li v-for="model in selectedProvider.models" :key="model.id" :class="[
                  'transition-all duration-200',
                  selectedModel?.id === model.id ?
                    'bg-base-200 !border-l-4 !border-primary' : 'border-l-4 border-transparent'
                ]">
                  <a @click="selectModel(model)" class="hover:bg-base-200 focus:bg-base-300" :class="[
                    'flex flex-col items-start gap-1 py-3',
                    selectedModel?.id === model.id ? 'pl-3' : ''
                  ]">
                    <span class="font-medium">{{ model.name }}</span>
                  </a>
                </li>
              </ul>
            </div>

            <!-- Volcengine Model Management -->
            <div v-if="selectedProvider?.id === 'volcengine'" class="my-6">
              <h4 class="font-medium mb-4">{{ t('apiSelector.volcengineModels') }}</h4>

              <!-- Add Model Button -->
              <button class="btn btn-outline mb-4" @click="openModelModal()">
                {{ t('apiSelector.addModel') }}
              </button>

            </div>

          </div>
          <!-- 底部按钮 -->
          <div class="flex justify-end mt-6 pt-4">
            <button class="btn" @click="close">{{ t('apiSelector.cancel') }}</button>
            <button class="btn btn-primary" @click="save" :disabled="!canSave">
              {{ t('apiSelector.save') }}
            </button>
          </div>
        </div>
      </div>


      <!-- Model Form Modal -->
      <dialog :class="{ 'modal modal-open': showingModelModal }">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-4">
            {{ editingModel ? t('apiSelector.editModel') : t('apiSelector.addModel') }}
          </h3>
          <form @submit.prevent="saveModel" class="space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ t('apiSelector.modelId') }}</span>
              </label>
              <input type="text" v-model="modelForm.id" :placeholder="t('apiSelector.modelIdPlaceholder')"
                class="input input-bordered" required :disabled="!!editingModel" />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ t('apiSelector.modelName') }}</span>
              </label>
              <input type="text" v-model="modelForm.name" :placeholder="t('apiSelector.modelNamePlaceholder')"
                class="input input-bordered" required />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ t('apiSelector.modelDescription') }}</span>
              </label>
              <textarea v-model="modelForm.description" :placeholder="t('apiSelector.modelDescriptionPlaceholder')"
                class="textarea textarea-bordered" rows="3"></textarea>
            </div>

            <div class="modal-action">
              <button type="button" class="btn" @click="closeModelModal">
                {{ t('apiSelector.cancel') }}
              </button>
              <button type="submit" class="btn btn-primary">
                {{ t('apiSelector.save') }}
              </button>
            </div>
          </form>
        </div>
      </dialog>







      <!-- 速度测试标签页 -->
      <div v-show="activeTab === 'speedtest'" class="mt-4">
        <div class="flex justify-between items-center mb-6">
          <h4 class="font-medium">{{ t('apiSelector.speedTestResults') }}</h4>
          <button class="btn btn-primary" @click="handleSpeedTest" :disabled="speedTesting">
            {{ speedTesting ? t('apiSelector.speedTesting') : t('apiSelector.speedTest') }}
          </button>
        </div>

        <!-- 测速结果表格 -->
        <div class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th>{{ t('apiSelector.speedTestProvider') }}</th>
                <th>{{ t('apiSelector.speedTestModel') }}</th>
                <th>{{ t('apiSelector.speedTestTime') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="result in speedResults" :key="result.provider">
                <td>{{ PROVIDER_DISPLAY_NAMES[result.provider] || result.provider }}</td>
                <td>{{ V3_MODELS[result.provider] || result.model }}</td>
                <td v-if="result.success">{{ result.time }}ms</td>
                <td v-else class="text-error">{{ result.error || t('apiSelector.speedTestNoKey') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>


    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useTranslations } from '../../../i18n/translations';
import { PROVIDER_DISPLAY_NAMES } from '../../../config/apiProviders';
import { PROVIDER_CONFIGS } from '../../../config/apiProviders.js';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  currentProvider: {
    type: String,
    default: ''
  },
  currentModel: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    required: true
  }
});

// Translation helper
const t = computed(() => {
  const result = useTranslations(props.language);
  return typeof result === 'function' ? result :
    (result && typeof result.t === 'function' ? result.t : key => key);
});

const emit = defineEmits(['close', 'update-api']);
const providers = ref([]);
const apiSettings = ref({});
const testingConnection = ref(false);
const selectedProvider = ref(null);
const selectedModel = ref(null);

// Speed test state
const activeTab = ref('settings');
const speedTesting = ref(false);
const speedResults = ref([]);

// Speed test v3 models mapping
const V3_MODELS = {
  deepseek: 'deepseek-chat',
  siliconflow: 'deepseek-ai/DeepSeek-V3',
  aliyun: 'deepseek-v3'
};

// Volcengine model management
const showingModelModal = ref(false);
const editingModel = ref(null);
const customModels = ref([]);
const modelForm = ref({
  id: '',
  name: '',
  description: ''
});

const volcengineModels = () => {
 const configs = [...PROVIDER_CONFIGS];
      // Merge custom Volcengine models with default models
      const volcengineProvider = configs.find(p => p.id === 'volcengine');
      if (volcengineProvider) {
        // const customModels = store.get('providers.volcengineModels.models', []);
        volcengineProvider.models = [...volcengineProvider.models];
      }
      
      return configs;
};

onMounted(() => {
  try {
    providers.value = volcengineModels();

    if (selectedProvider.value?.id === 'volcengine') {
      // customModels.value = await window.electron.getVolcengineModels();
    }

    if (providers.value.length > 0) {
      selectedProvider.value = providers.value[0];
      selectedModel.value = providers.value[0].models[0];
    }

    providers.value.forEach(provider => {
      if (!apiSettings.value[provider.id]) {
        apiSettings.value[provider.id] = {
          apiKey: '',
          baseUrl: provider.defaultBaseUrl
        };
      }
    });

    // const savedSettings = await window.electron.getProviderSettings();
    // if (savedSettings) {
    //   Object.keys(savedSettings).forEach(providerId => {
    //     if (apiSettings.value[providerId]) {
    //       apiSettings.value[providerId] = {
    //         ...apiSettings.value[providerId],
    //         ...savedSettings[providerId]
    //       };
    //     }
    //   });
    // }

    if (props.currentProvider) {
      const validProvider = providers.value.find(p => p.id === props.currentProvider);
      if (validProvider) {
        selectedProvider.value = validProvider;

        const validModel = validProvider.models.find(m => m.id === props.currentModel);
        if (validModel) {
          selectedModel.value = validModel;
        }
      }
    }
  } catch (error) {
    console.error('Failed to initialize provider settings:', error);
  }
});

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

const selectProvider = async (provider) => {
  selectedProvider.value = provider;
  selectedModel.value = provider.models[0];

  if (provider.id === 'volcengine') {
    customModels.value = await window.electron.getVolcengineModels();
  }
};

const selectModel = (model) => {
  selectedModel.value = model;
};

const showToast = (message, type = 'info') => {
  const toast = document.createElement('div');
  toast.className = `alert ${type === 'success' ? 'alert-success' : 'alert-error'} `;
  toast.innerHTML = message;

  const toastContainer = document.querySelector('.toast');
  if (toastContainer) {
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 1000);
  }
};

const handleSpeedTest = async () => {
  speedTesting.value = true;
  speedResults.value = [];

  // Test each provider that has API key configured
  const tests = providers.value.map(async (provider) => {
    const settings = apiSettings.value[provider.id];
    if (!settings?.apiKey) {
      return {
        provider: provider.id,
        success: false,
        error: t.value('apiSelector.speedTestNoKey')
      };
    }

    try {
      const model = V3_MODELS[provider.id];
      if (!model) return null; // Skip if no v3 model mapping

      const response = await window.electron.testConnection(
        {
          apiKey: settings.apiKey,
          baseUrl: settings.baseUrl
        },
        model
      );

      return {
        provider: provider.id,
        model,
        success: response.success,
        time: response.responseTime,
        error: response.error
      };
    } catch (error) {
      return {
        provider: provider.id,
        success: false,
        error: error.message
      };
    }
  });

  const results = await Promise.all(tests);
  speedResults.value = results.filter(r => r !== null);
  speedTesting.value = false;
};

const handleConnectionTest = async () => {
  if (!selectedProvider.value || !canTestConnection.value) return;

  const settings = apiSettings.value[selectedProvider.value.id];
  testingConnection.value = true;

  try {
    const serializedSettings = {
      apiKey: settings.apiKey,
      baseUrl: settings.baseUrl
    };
    const response = await window.electron.testConnection(serializedSettings, selectedModel.value.id);

    if (response.success) {
      showToast(
        t.value('apiSelector.connectionSuccess').replace('{time}', response.responseTime),
        'success'
      );
    } else {
      showToast(
        t.value('apiSelector.connectionError')
          .replace('{error}', response.error)
          .replace('{time}', response.responseTime || 0),
        'error'
      );
    }
  } catch (error) {
    console.error('Failed to test connection:', error);
    showToast(t.value('apiSelector.connectionError').replace('{error}', error.message), 'error');
  } finally {
    testingConnection.value = false;
  }
};

const openModelModal = (model = null) => {
  if (model) {
    editingModel.value = model;
    modelForm.value = { ...model };
  } else {
    editingModel.value = null;
    modelForm.value = { id: '', name: '', description: '' };
  }
  showingModelModal.value = true;
};

const closeModelModal = () => {
  showingModelModal.value = false;
  editingModel.value = null;
  modelForm.value = { id: '', name: '', description: '' };
};

const saveModel = async () => {
  try {
    if (editingModel.value) {
      // await window.electron.updateVolcengineModel(
      //   editingModel.value.id,
      //   JSON.stringify(modelForm.value)
      // );
      const index = customModels.value.findIndex(m => m.id === editingModel.value.id);
      if (index !== -1) {
        customModels.value[index] = { ...modelForm.value };
      }
      showToast(t.value('apiSelector.modelSaveSuccess'), 'success');
    } else {
      // await window.electron.addVolcengineModel(JSON.stringify(modelForm.value));
      customModels.value.push({ ...modelForm.value });
      showToast(t.value('apiSelector.modelSaveSuccess'), 'success');
    }
    closeModelModal();
  } catch (error) {
    showToast(t.value('apiSelector.modelSaveError').replace('{error}', error.message), 'error');
  }
};

const deleteModel = async (model) => {
  if (!confirm(t.value('apiSelector.deleteModelConfirm'))) return;

  try {
    // await window.electron.deleteVolcengineModel(model.id);
    customModels.value = customModels.value.filter(m => m.id !== model.id);
    showToast(t.value('apiSelector.modelDeleteSuccess'), 'success');
  } catch (error) {
    showToast(t.value('apiSelector.modelDeleteError').replace('{error}', error.message), 'error');
  }
};

const save = async () => {
  if (!canSave.value) return;

  try {
    const selection = {
      provider: selectedProvider.value.id,
      model: selectedModel.value.id
    };

    const serializedSettings = {};
    Object.keys(apiSettings.value).forEach(providerId => {
      serializedSettings[providerId] = {
        apiKey: apiSettings.value[providerId].apiKey,
        baseUrl: apiSettings.value[providerId].baseUrl
      };
    });

    // await window.electron.updateProviderSettings(serializedSettings);
    // await window.electron.updateCurrentAPI(selection);

    emit('update-api', {
      selection,
      settings: serializedSettings
    });

    showToast(t.value('apiSelector.saveSuccess'), 'success');
    close();
  } catch (error) {
    showToast(t.value('apiSelector.saveError').replace('{error}', error.message), 'error');
  }
};

const close = () => {
  emit('close');
};
</script>
