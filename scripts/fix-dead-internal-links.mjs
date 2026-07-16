#!/usr/bin/env node

import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const contentRoot = path.join(repoRoot, 'content');
const writeChanges = process.argv.includes('--write');

const PATH_REPLACEMENTS = new Map([
  // English article consolidations.
  ['/blog/anti-bot-systems-explained', '/blog/cloudflare-403-troubleshooting'],
  ['/blog/playwright-proxy-configuration-guide', '/blog/playwright-proxy-setup'],
  ['/blog/bypass-cloudflare-web-scraping', '/blog/cloudflare-403-troubleshooting-guide'],
  ['/blog/avoid-detection-playwright-scraping', '/blog/playwright-residential-proxy-guide'],
  ['/blog/datacenter-vs-residential-proxies', '/blog/residential-proxy-vs-datacenter-proxy'],
  ['/blog/residential-proxies-improve-scraping', '/blog/what-is-residential-proxy'],
  ['/blog/proxy-checker', '/tools/proxy-test'],
  ['/blog/scraping-test-tool-detect-blocks', '/tools/proxy-test'],
  ['/blog/proxy-rotator', '/blog/residential-proxy-rotation-strategies'],
  ['/blog/playwright-web-scraping-tutorial', '/blog/playwright-residential-proxy-guide'],
  ['/blog/common-web-scraping-challenges', '/blog/cloudflare-403-troubleshooting'],
  ['/blog/proxy-rotation-strategies', '/blog/residential-proxy-rotation-strategies'],
  ['/blog/avoid-ip-bans-web-scraping', '/blog/residential-proxy-rotation-strategies'],
  ['/blog/why-residential-proxies-best-for-scraping-2026', '/blog/what-is-residential-proxy'],
  ['/blog/ai-web-scraping-agents', '/blog/ai-browser-agents-playwright'],
  ['/blog/ai-data-extraction-vs-traditional-scraping', '/blog/ai-data-collection-web'],
  ['/blog/scraping-data-at-scale', '/blog/web-scraping-architecture-design'],
  ['/blog/openclaw-browser-automation-proxy', '/ai/openclaw'],
  ['/blog/openclaw-residential-proxy', '/ai/openclaw'],
  ['/blog/using-proxies-playwright', '/blog/playwright-proxy-setup'],
  ['/blog/how-proxy-rotation-works', '/blog/residential-proxy-rotation-strategies'],
  ['/blog/web-scraping-proxy-architecture', '/blog/web-scraping-architecture-design'],
  ['/blog/playwright-web-scraping-scale', '/blog/playwright-residential-proxy-guide'],
  ['/blog/serp-scraping-residential-proxies', '/solutions/serp-scraping'],
  ['/blog/web-scraping-workflow-explained', '/blog/proxy-pools-web-scraping'],
  ['/blog/web-scraping-at-scale-best-practices', '/blog/proxy-pools-web-scraping'],
  ['/blog/scaling-scrapers-distributed-systems', '/blog/proxy-pools-web-scraping'],
  ['/blog/rotating-residential-proxies-guide', '/blog/residential-proxy-rotation-strategies'],

  // Chinese content consolidations. Some old tutorials no longer have a direct
  // one-to-one Chinese replacement, so use the nearest maintained technical or
  // product page rather than a missing article or generic blog index.
  ['/zh/blog/scrape-websites-without-getting-blocked', '/zh/blog/ai-dynamic-proxy-technical-implementation'],
  ['/zh/blog/bypass-cloudflare-web-scraping', '/zh/blog/ai-dynamic-proxy-technical-implementation'],
  ['/zh/blog/scraping-data-at-scale', '/zh/blog/ai-dynamic-proxy-technical-implementation'],
  ['/zh/blog/proxy-rotation-strategies', '/zh/proxies'],
  ['/zh/blog/crawlee-web-scraping-tutorial', '/zh/blog/ai-dynamic-proxy-technical-implementation'],
  ['/zh/blog/playwright-web-scraping-tutorial', '/zh/blog/ai-dynamic-proxy-technical-implementation'],
  ['/zh/blog/residential-proxies-improve-scraping', '/zh/blog/residential-proxies'],
  ['/zh/blog/avoid-ip-bans-web-scraping', '/zh/proxies'],
]);

const UNPUBLISHED_SERIES_PATHS = new Set([
  '/blog/openclaw-installation-on-ubuntu-part-2',
  '/blog/openclaw-connect-to-ollama-part-3',
  '/zh/blog/openclaw-installation-on-ubuntu-part-2',
  '/zh/blog/openclaw-connect-to-ollama-part-3',
]);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else if (entry.isFile() && /\.mdx?$/i.test(entry.name)) files.push(fullPath);
  }

  return files.sort();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function removeUnpublishedSeriesLinks(source) {
  let output = source;

  for (const target of UNPUBLISHED_SERIES_PATHS) {
    const variants = [target, `https://bytesflows.com${target}`, `https://www.bytesflows.com${target}`];
    for (const variant of variants) {
      const pattern = new RegExp(`\\[([^\\]]+)\\]\\(${escapeRegExp(variant)}(?:#[^)]*)?\\)`, 'g');
      output = output.replace(pattern, '$1');
    }
  }

  return output;
}

function replacePathVariants(source, oldPath, newPath) {
  let output = source;
  const variants = [
    [oldPath, newPath],
    [`https://bytesflows.com${oldPath}`, `https://bytesflows.com${newPath}`],
    [`https://www.bytesflows.com${oldPath}`, `https://bytesflows.com${newPath}`],
  ];

  for (const [from, to] of variants) {
    output = output.replaceAll(from, to);
  }

  return output;
}

const files = await walk(contentRoot);
const changed = [];
const replacementCounts = new Map();

for (const file of files) {
  const original = await readFile(file, 'utf8');
  let next = removeUnpublishedSeriesLinks(original);

  for (const [oldPath, newPath] of PATH_REPLACEMENTS) {
    const before = next;
    next = replacePathVariants(next, oldPath, newPath);
    if (next !== before) {
      replacementCounts.set(oldPath, (replacementCounts.get(oldPath) || 0) + 1);
    }
  }

  if (next === original) continue;
  changed.push(path.relative(repoRoot, file).split(path.sep).join('/'));
  if (writeChanges) await writeFile(file, next, 'utf8');
}

console.log(`${writeChanges ? 'Updated' : 'Would update'} ${changed.length} content files.`);
for (const file of changed) console.log(`- ${file}`);

console.log('\nReplacement groups used:');
for (const [oldPath, count] of [...replacementCounts.entries()].sort()) {
  console.log(`- ${oldPath}: ${count} file(s)`);
}

if (!writeChanges && changed.length > 0) {
  console.log('\nRun with --write to apply these replacements.');
}
