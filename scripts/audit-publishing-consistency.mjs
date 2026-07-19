#!/usr/bin/env node

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const contentRoot = path.join(repoRoot, 'content', 'blog');
const outputDir = path.join(repoRoot, 'artifacts');
const baseUrl = (process.env.AUDIT_BASE_URL || 'https://bytesflows.com').replace(/\/$/, '');
const strict = process.argv.includes('--strict');
const timeoutMs = Number(process.env.AUDIT_TIMEOUT_MS || 15000);
const concurrency = Math.max(1, Number(process.env.AUDIT_CONCURRENCY || 4));
const maxRedirects = 5;

function unquote(value = '') {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function parseFrontmatter(source) {
  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\s*\r?\n|$)/);
  if (!match) return {};
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z][A-Za-z0-9 _-]*):\s*(.*)$/);
    if (!field) continue;
    data[field[1].trim().toLowerCase()] = unquote(field[2]);
  }
  return data;
}

async function readPublishedSourcePages() {
  const files = (await readdir(contentRoot)).filter((name) => /\.mdx?$/i.test(name)).sort();
  const pages = [];

  for (const file of files) {
    const source = await readFile(path.join(contentRoot, file), 'utf8');
    const data = parseFrontmatter(source);
    const status = (data.status || 'draft').trim().toLowerCase();
    const language = (data.language || 'en').trim().toLowerCase();
    const slug = (data.slug || '').trim().toLowerCase();
    if (status !== 'published' || !slug || !['en', 'zh'].includes(language)) continue;
    pages.push({
      file,
      title: data.title || slug,
      category: data.category || '',
      language,
      slug,
      path: language === 'zh' ? `/zh/blog/${slug}` : `/blog/${slug}`,
    });
  }

  return pages;
}

function extractCanonical(html, finalUrl) {
  const match = html.match(/<link\s+[^>]*rel=["'][^"']*canonical[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>/i)
    || html.match(/<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["'][^"']*canonical[^"']*["'][^>]*>/i);
  if (!match) return null;
  try {
    return new URL(match[1], finalUrl).href.replace(/\/$/, '');
  } catch {
    return match[1];
  }
}

async function fetchOnce(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      redirect: 'manual',
      headers: {
        'user-agent': 'BytesFlows-Publishing-Audit/1.0',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        ...options.headers,
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWithRedirects(inputUrl) {
  const chain = [];
  let currentUrl = inputUrl;
  let response;

  for (let hop = 0; hop <= maxRedirects; hop += 1) {
    response = await fetchOnce(currentUrl);
    chain.push({ url: currentUrl, status: response.status, location: response.headers.get('location') });
    if (![301, 302, 303, 307, 308].includes(response.status)) break;
    const location = response.headers.get('location');
    if (!location) break;
    currentUrl = new URL(location, currentUrl).href;
  }

  const body = response ? await response.text() : '';
  return {
    initialUrl: inputUrl,
    initialStatus: chain[0]?.status ?? null,
    finalStatus: chain.at(-1)?.status ?? null,
    finalUrl: chain.at(-1)?.url ?? inputUrl,
    redirectCount: Math.max(0, chain.length - 1),
    chain,
    body,
  };
}

function normalizeUrl(value) {
  try {
    const url = new URL(value, baseUrl);
    url.hash = '';
    url.search = '';
    return url.href.replace(/\/$/, '');
  } catch {
    return value;
  }
}

function extractBlogLinks(html) {
  const links = new Set();
  const hrefRegex = /href=["']([^"']+)["']/gi;
  for (const match of html.matchAll(hrefRegex)) {
    let pathname;
    try {
      pathname = new URL(match[1], baseUrl).pathname.replace(/\/$/, '');
    } catch {
      continue;
    }
    if (/^\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pathname) || /^\/zh\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pathname)) {
      links.add(pathname);
    }
  }
  return links;
}

function extractInventoryCount(html) {
  const allArticles = html.match(/All Articles\s*(\d+)/i)?.[1];
  const showing = html.match(/Showing\s+\d+[–-]\d+\s+of\s+(\d+)/i)?.[1];
  return {
    allArticles: allArticles ? Number(allArticles) : null,
    showingTotal: showing ? Number(showing) : null,
  };
}

async function crawlListing(locale) {
  const prefix = locale === 'zh' ? '/zh' : '';
  const links = new Set();
  const pages = [];
  const maxPages = 6;

  for (let page = 1; page <= maxPages; page += 1) {
    const pathname = page === 1 ? `${prefix}/blog` : `${prefix}/blog/page/${page}`;
    const result = await fetchWithRedirects(`${baseUrl}${pathname}`);
    if (result.finalStatus !== 200) {
      pages.push({ pathname, status: result.finalStatus, count: null, links: 0 });
      if (page > 1) break;
      continue;
    }
    const pageLinks = extractBlogLinks(result.body);
    for (const link of pageLinks) links.add(link);
    const count = extractInventoryCount(result.body);
    pages.push({ pathname, status: result.finalStatus, count, links: pageLinks.size });
    if (page > 1 && pageLinks.size === 0) break;
  }

  return { locale, links, pages };
}

async function fetchSitemap() {
  const candidates = ['/sitemap.xml', '/sitemap-index.xml'];
  const urls = new Set();
  const errors = [];

  for (const pathname of candidates) {
    try {
      const result = await fetchWithRedirects(`${baseUrl}${pathname}`);
      if (result.finalStatus !== 200) {
        errors.push(`${pathname}: HTTP ${result.finalStatus}`);
        continue;
      }
      for (const match of result.body.matchAll(/<loc>([^<]+)<\/loc>/gi)) {
        urls.add(normalizeUrl(match[1].trim()));
      }
      if (urls.size > 0) break;
    } catch (error) {
      errors.push(`${pathname}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return { urls, errors };
}

async function mapConcurrent(items, mapper) {
  const results = new Array(items.length);
  let index = 0;
  async function worker() {
    while (true) {
      const current = index;
      index += 1;
      if (current >= items.length) return;
      results[current] = await mapper(items[current], current);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

function classify(row) {
  const expected = normalizeUrl(`${baseUrl}${row.path}`);
  const final = normalizeUrl(row.finalUrl);
  const canonical = row.canonical ? normalizeUrl(row.canonical) : null;
  const finalPath = (() => {
    try { return new URL(row.finalUrl).pathname.replace(/\/$/, '') || '/'; } catch { return ''; }
  })();

  if (row.error) return 'fetch_error';
  if (row.finalStatus === 404 || row.finalStatus === 410) return 'missing';
  if (finalPath === '/blog' || finalPath === '/zh/blog') return 'soft_404';
  if (row.redirectCount > 0) return 'unexpected_redirect';
  if (row.finalStatus !== 200) return 'non_200';
  if (final !== expected) return 'wrong_final_url';
  if (!canonical) return 'missing_canonical';
  if (canonical !== expected) return 'canonical_mismatch';
  if (!row.inSitemap) return 'missing_from_sitemap';
  if (!row.inListing) return 'missing_from_listing';
  return 'healthy';
}

function escapeCell(value) {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

const sourcePages = await readPublishedSourcePages();
const [sitemap, enListingA, enListingB, zhListingA, zhListingB] = await Promise.all([
  fetchSitemap(),
  crawlListing('en'),
  crawlListing('en'),
  crawlListing('zh'),
  crawlListing('zh'),
]);

const listingSets = {
  en: new Set([...enListingA.links, ...enListingB.links]),
  zh: new Set([...zhListingA.links, ...zhListingB.links]),
};

const rows = await mapConcurrent(sourcePages, async (page) => {
  try {
    const result = await fetchWithRedirects(`${baseUrl}${page.path}`);
    const expected = normalizeUrl(`${baseUrl}${page.path}`);
    const canonical = result.finalStatus === 200 ? extractCanonical(result.body, result.finalUrl) : null;
    const row = {
      ...page,
      initialStatus: result.initialStatus,
      finalStatus: result.finalStatus,
      finalUrl: result.finalUrl,
      redirectCount: result.redirectCount,
      redirectChain: result.chain,
      canonical,
      inSitemap: sitemap.urls.has(expected),
      inListing: listingSets[page.language].has(page.path),
      error: null,
    };
    row.verdict = classify(row);
    return row;
  } catch (error) {
    const row = {
      ...page,
      initialStatus: null,
      finalStatus: null,
      finalUrl: `${baseUrl}${page.path}`,
      redirectCount: 0,
      redirectChain: [],
      canonical: null,
      inSitemap: false,
      inListing: listingSets[page.language].has(page.path),
      error: error instanceof Error ? error.message : String(error),
    };
    row.verdict = classify(row);
    return row;
  }
});

const verdictCounts = {};
for (const row of rows) verdictCounts[row.verdict] = (verdictCounts[row.verdict] || 0) + 1;

const listingDrift = {
  en: {
    passA: [...enListingA.links].sort(),
    passB: [...enListingB.links].sort(),
    stable: [...enListingA.links].sort().join('\n') === [...enListingB.links].sort().join('\n'),
    pagesA: enListingA.pages,
    pagesB: enListingB.pages,
  },
  zh: {
    passA: [...zhListingA.links].sort(),
    passB: [...zhListingB.links].sort(),
    stable: [...zhListingA.links].sort().join('\n') === [...zhListingB.links].sort().join('\n'),
    pagesA: zhListingA.pages,
    pagesB: zhListingB.pages,
  },
};

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  sourcePublished: sourcePages.length,
  sourceByLanguage: sourcePages.reduce((acc, page) => ({ ...acc, [page.language]: (acc[page.language] || 0) + 1 }), {}),
  sitemapBlogUrls: [...sitemap.urls].filter((url) => /\/blog\//.test(url)).length,
  sitemapErrors: sitemap.errors,
  listingDrift,
  verdictCounts,
  rows,
};

await mkdir(outputDir, { recursive: true });
await writeFile(path.join(outputDir, 'publishing-consistency.json'), JSON.stringify(report, null, 2));

const problemRows = rows.filter((row) => row.verdict !== 'healthy');
const markdown = [
  '# BytesFlows Publishing Consistency Audit',
  '',
  `Generated: ${report.generatedAt}`,
  `Base URL: ${baseUrl}`,
  '',
  '## Summary',
  '',
  `- Source Published pages: ${report.sourcePublished}`,
  `- Source English: ${report.sourceByLanguage.en || 0}`,
  `- Source Chinese: ${report.sourceByLanguage.zh || 0}`,
  `- Healthy live pages: ${verdictCounts.healthy || 0}`,
  `- Problems: ${problemRows.length}`,
  `- English listing stable across two passes: ${listingDrift.en.stable}`,
  `- Chinese listing stable across two passes: ${listingDrift.zh.stable}`,
  '',
  '## Verdict counts',
  '',
  ...Object.entries(verdictCounts).sort().map(([key, value]) => `- ${key}: ${value}`),
  '',
  '## Problems',
  '',
  '| Language | Slug | Category | Verdict | Initial | Final | Redirects | Sitemap | Listing | Canonical | Final URL |',
  '|---|---|---|---|---:|---:|---:|---|---|---|---|',
  ...problemRows.map((row) => `| ${escapeCell(row.language)} | ${escapeCell(row.slug)} | ${escapeCell(row.category)} | ${escapeCell(row.verdict)} | ${escapeCell(row.initialStatus)} | ${escapeCell(row.finalStatus)} | ${escapeCell(row.redirectCount)} | ${row.inSitemap ? 'yes' : 'no'} | ${row.inListing ? 'yes' : 'no'} | ${escapeCell(row.canonical || '')} | ${escapeCell(row.finalUrl)} |`),
  '',
  '## Healthy pages',
  '',
  ...rows.filter((row) => row.verdict === 'healthy').map((row) => `- ${row.path}`),
  '',
  '## Listing snapshots',
  '',
  '```json',
  JSON.stringify(listingDrift, null, 2),
  '```',
  '',
].join('\n');

await writeFile(path.join(outputDir, 'publishing-consistency.md'), markdown);

console.log(`Source Published pages: ${sourcePages.length}`);
console.log(`Healthy live pages: ${verdictCounts.healthy || 0}`);
console.log(`Problems: ${problemRows.length}`);
console.log(`English listing stable: ${listingDrift.en.stable}`);
console.log(`Chinese listing stable: ${listingDrift.zh.stable}`);
console.log(`Reports written to ${path.relative(repoRoot, outputDir)}/`);

if (strict && (problemRows.length > 0 || !listingDrift.en.stable || !listingDrift.zh.stable)) {
  process.exitCode = 1;
}
