#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const writeChanges = process.argv.includes('--write');
const marker = '<!-- link-health:curated-related-guides -->';

const CURATED_SECTIONS = new Map([
  [
    'content/blog/residential-proxies.md',
    `

${marker}
## Related Field Guides

Use these focused guides after the residential proxy fundamentals:

- [Best residential proxy providers for small teams](/blog/best-residential-proxy-providers-for-small-teams) — compare sub-50 GB plans, minimum commitments, and operational fit.
- [BytesFlows proxy setup guide](/blog/bytesflows-proxy-setup-guide) — move from credentials to a verified first request.
- [How many GB of proxy traffic web scraping needs](/blog/how-many-gb-proxy-traffic-web-scraping) — estimate bandwidth before choosing a plan.
- [How to evaluate a residential proxy free trial](/blog/how-to-evaluate-residential-proxy-free-trial) — test success rate, geo accuracy, sessions, and support with a repeatable scorecard.
- [E-commerce price monitoring proxies](/blog/ecommerce-price-monitoring-proxies) — design a recurring price and stock collection workflow.
- [Residential proxies for e-commerce price monitoring](/blog/ecommerce-price-monitoring-residential-proxies) — choose route, session, and retry policies for retail data.
- [Playwright proxy errors](/blog/playwright-proxy-errors) — diagnose 407 responses, tunnel failures, and browser-context mistakes.
- [Social media data collection](/blog/scraping-social-media-data) — plan compliant collection, evidence, and traffic budgets for public social data.
`,
  ],
  [
    'content/blog/openclaw-proxy-setup.md',
    `

${marker}
## Related OpenClaw Implementation Guides

- [Install Ollama on Ubuntu for local OpenClaw](/blog/openclaw-local-ollama-setup-part-1) — verify the local model runtime before connecting an agent workflow.
- [Scaling Scrapling and OpenClaw LinkedIn agents](/blog/scrapling-openclaw-linkedin-agents-scale) — review architecture, routing, evidence, and scale constraints for a specialized agent pipeline.
`,
  ],
  [
    'content/blog/residential-proxies-zh.md',
    `

${marker}
## 相关实战指南

- [适合小团队的住宅代理服务商选购指南](/zh/blog/best-residential-proxy-providers-for-small-teams) — 评估低于 50 GB/月场景的价格、最低消费和技术适配度。
- [如何评估住宅代理免费试用](/zh/blog/how-to-evaluate-residential-proxy-free-trial) — 用统一指标测试成功率、地域准确度、会话和支持质量。
- [住宅代理速度测试](/zh/blog/residential-proxy-speed-test) — 用延迟、吞吐、成功率和稳定性验证真实可用性。
`,
  ],
  [
    'content/blog/ai-dynamic-proxy-technical-implementation-zh.md',
    `

${marker}
## 相关 AI Agent 实现

- [在 Ubuntu 安装 Ollama：本地 OpenClaw 第一步](/zh/blog/openclaw-local-ollama-setup-part-1) — 先验证本地模型服务，再接入代理路由与浏览器 Agent。
`,
  ],
]);

const changed = [];

for (const [relativePath, section] of CURATED_SECTIONS) {
  const file = path.join(root, relativePath);
  const original = await readFile(file, 'utf8');
  if (original.includes(marker)) continue;

  changed.push(relativePath);
  if (writeChanges) {
    await writeFile(file, `${original.trimEnd()}${section}\n`, 'utf8');
  }
}

console.log(`${writeChanges ? 'Updated' : 'Would update'} ${changed.length} topic-hub files.`);
for (const file of changed) console.log(`- ${file}`);

if (!writeChanges && changed.length > 0) {
  console.log('\nRun with --write to apply the curated links.');
}
