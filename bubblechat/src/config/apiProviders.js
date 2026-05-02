// DeepSeek 单一供应商配置。
// 模型名走 id 字段，支持后续 V5/V6 平滑替换；显示名走 name。
export const PROVIDER = {
  id: 'deepseek',
  name: 'DeepSeek',
  defaultBaseUrl: 'https://api.deepseek.com/chat/completions',
  models: [
    {
      id: 'deepseek-chat',
      name: 'V4-flash',
      description: '日常生产力——又快又稳，适合标题、改写、详情页等场景',
      tier: 'flash',
    },
    {
      id: 'deepseek-reasoner',
      name: 'V4-pro',
      description: '深度推理——可视思考过程，适合选题、归因、投资逻辑',
      tier: 'pro',
    },
  ],
};

export const MODEL_TIERS = {
  flash: PROVIDER.models[0],
  pro: PROVIDER.models[1],
};

export const getModelByTier = (tier) => MODEL_TIERS[tier] || MODEL_TIERS.flash;

export const getModelById = (id) =>
  PROVIDER.models.find((m) => m.id === id) || PROVIDER.models[0];
