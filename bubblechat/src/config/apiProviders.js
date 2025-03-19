export const PROVIDER_CONFIGS = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: 'smart_toy',
    description: 'Advanced AI model for chat and reasoning',
    docUrl: 'https://platform.deepseek.com/docs',
    defaultBaseUrl: 'https://api.deepseek.com/chat/completions/',
    models: [
      {
        id: 'deepseek-chat',
        name: 'DeepSeek Chat',
        description: 'General purpose chat model'
      },
      {
        id: 'deepseek-reasoner',
        name: 'DeepSeek Reasoner',
        description: 'Advanced reasoning capabilities'
      }
    ]
  },
  {
    id: 'volcengine',
    name: 'Volcengine 火山引擎',
    icon: 'smart_toy',
    description: 'Volcengine AI services with DeepSeek models',
    docUrl: 'https://console.volcengine.com/ark/region:ark+cn-beijing/endpoint',
    defaultBaseUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    models: [],
  },
  {
    id: 'siliconflow',
    name: 'Siliconflow 硅基流动',
    icon: 'smart_toy',
    defaultBaseUrl: 'https://api.siliconflow.com/v1/chat/completions',
    description: 'Deepseek API services via Siliconflow',
    models: [
      {
        id: 'deepseek-ai/DeepSeek-V3',
        name: 'DeepSeek V3',
        description: 'Latest version of DeepSeek model'
      },
      {
        id: 'deepseek-ai/DeepSeek-R1',
        name: 'DeepSeek R1',
        description: 'Advanced reasoning model'
      }
    ]
  },
  {
    id: 'aliyun',
    name: 'Aliyun 阿里云',
    icon: 'smart_toy',
    description: 'Aliyun AI services with DeepSeek models',
    docUrl: 'https://help.aliyun.com/document_detail/613695.html',
    defaultBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    models: [
      {
        id: 'deepseek-v3',
        name: 'deepseek-v3',
        description: 'Advanced language model for general purpose tasks'
      },
      {
        id: 'deepseek-r1',
        name: 'deepseek-r1',
        description: 'Specialized model for reasoning tasks'
      }
    ]
  }
];

// 提供商显示名称映射
export const PROVIDER_DISPLAY_NAMES = Object.fromEntries(
  PROVIDER_CONFIGS.map(config => [config.id, config.name])
);

// 格式化模型名称
export const formatModelName = (model) => {
  if (model.includes('/')) {
    return model.split('/')[1]; // For Siliconflow models
  }
  return model;
};

// 获取API显示名称
export const getAPIDisplay = (provider, model) => {
  const displayProvider = PROVIDER_DISPLAY_NAMES[provider] || provider;
  const displayModel = formatModelName(model);
  return `${displayProvider} - ${displayModel}`;
};

// 根据ID获取提供商配置
export const getProviderConfig = (providerId) => {
  return PROVIDER_CONFIGS.find(config => config.id === providerId);
};

// 获取提供商的模型列表
export const getProviderModels = (providerId) => {
  const config = getProviderConfig(providerId);
  return config ? config.models : [];
};

// 获取提供商的默认基础URL
export const getProviderDefaultBaseUrl = (providerId) => {
  const config = getProviderConfig(providerId);
  return config ? config.defaultBaseUrl : null;
};
