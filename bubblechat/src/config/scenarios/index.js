// 卡片注册表。新增卡片：放一份 <slug>.json 到本目录，再在 SCENARIOS 数组里登记一行 import。
// 卡片字段契约见 PRD 5.1。
import xiaohongshuTitle from './self-media-xiaohongshu-title.json';
import multiplatformRewrite from './self-media-multiplatform-rewrite.json';
import trendReasoning from './self-media-trend-reasoning.json';
import sixtySecondScript from './self-media-60s-script.json';

import detailGenerator from './ecommerce-detail-generator.json';
import csFaqTable from './ecommerce-cs-faq-table.json';
import reviewClustering from './ecommerce-review-clustering.json';
import competitorDiff from './ecommerce-competitor-diff.json';

import disclosureExtract from './pe-fund-disclosure-extract.json';
import investmentThesis from './pe-fund-investment-thesis.json';
import newsRiskScan from './pe-fund-news-risk-scan.json';
import researchTakeaway from './pe-fund-research-takeaway.json';

export const SCENARIOS = [
  // 自媒体
  xiaohongshuTitle,
  multiplatformRewrite,
  trendReasoning,
  sixtySecondScript,
  // 电商
  detailGenerator,
  csFaqTable,
  reviewClustering,
  competitorDiff,
  // 私募基金
  disclosureExtract,
  investmentThesis,
  newsRiskScan,
  researchTakeaway,
];

export const SCENARIOS_BY_ID = Object.fromEntries(
  SCENARIOS.map((s) => [s.id, s]),
);

export const SCENARIOS_BY_INDUSTRY = SCENARIOS.reduce((acc, s) => {
  (acc[s.industry] = acc[s.industry] || []).push(s);
  return acc;
}, {});

export function getScenarioById(id) {
  return SCENARIOS_BY_ID[id];
}

export function getScenariosByIndustry(industryId) {
  return SCENARIOS_BY_INDUSTRY[industryId] || [];
}
