// 品牌与视觉 token，集中管理便于后续白标。
export const BRAND = {
  name: 'DeepSeek 生产力工作台',
  tagline: '12 个场景，看见 DeepSeek 在做事',
  subtitle: '为自媒体、电商与私募基金打造的现场演示装置',
  footer: '© DeepSeek 生产力工作台 · 演示用 demo',
};

export const INDUSTRIES = [
  {
    id: 'self-media',
    label: '自媒体',
    eyebrow: '01 · Self-Media',
    blurb: '从一个主题到八个标题，从一篇文章到三个平台。',
  },
  {
    id: 'ecommerce',
    label: '电商',
    eyebrow: '02 · E-Commerce',
    blurb: '把商品资料、用户评论与竞品文案，变成可执行的产出。',
  },
  {
    id: 'pe-fund',
    label: '私募基金',
    eyebrow: '03 · Private Equity',
    blurb: '在长文里抽取要点，在事件里给出判断，在判断里展示思考。',
  },
];

export const INDUSTRY_BY_ID = Object.fromEntries(
  INDUSTRIES.map((i) => [i.id, i]),
);

export const STORAGE_KEYS = {
  apiKey: 'workbench.apiKey',
  baseUrl: 'workbench.baseUrl',
  defaultModel: 'workbench.defaultModel',
};
