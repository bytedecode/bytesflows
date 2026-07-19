#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const contentRoot = path.join(repoRoot, 'content');
const strictOrphans = process.argv.includes('--strict-orphans');
const SITE_HOSTS = new Set(['bytesflows.com', 'www.bytesflows.com']);

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

function unquote(value) {
  const trimmed = (value || '').trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function readFrontmatter(source) {
  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\s*\r?\n|$)/);
  if (!match) return { data: {}, body: source };

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z][A-Za-z0-9 _-]*):\s*(.*)$/);
    if (!field) continue;
    data[field[1].trim().toLowerCase()] = unquote(field[2]);
  }

  return { data, body: source.slice(match[0].length) };
}

function extractLinks(body) {
  const links = [];
  const markdown = /\[[^\]]*\]\((<[^>]+>|[^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  const html = /\bhref\s*=\s*["']([^"']+)["']/gi;

  for (const match of body.matchAll(markdown)) {
    links.push(match[1].replace(/^<|>$/g, ''));
  }
  for (const match of body.matchAll(html)) links.push(match[1]);

  return links;
}

function toInternalPath(rawLink) {
  const value = rawLink.trim();
  if (!value || value.startsWith('#')) return null;
  if (/^(mailto:|tel:|javascript:|data:)/i.test(value)) return null;

  if (value.startsWith('/')) {
    return value.split('#', 1)[0].split('?', 1)[0] || '/';
  }

  try {
    const url = new URL(value);
    if (!SITE_HOSTS.has(url.hostname.toLowerCase())) return null;
    return url.pathname || '/';
  } catch {
    return null;
  }
}

function blogTarget(pathname) {
  const match = pathname.match(/^\/(zh\/)?blog\/([^/]+)\/?$/);
  if (!match) return null;

  try {
    return {
      language: match[1] ? 'zh' : 'en',
      slug: decodeURIComponent(match[2]).trim().toLowerCase(),
    };
  } catch {
    return null;
  }
}

function sourceLabel(file) {
  return path.relative(repoRoot, file).split(path.sep).join('/');
}

const files = await walk(contentRoot);
const documents = [];
const hardErrors = [];
const warnings = [];
const slugOwners = new Map();

for (const file of files) {
  const source = await readFile(file, 'utf8');
  const { data, body } = readFrontmatter(source);
  const slug = (data.slug || '').trim().toLowerCase();
  const language = (data.language || 'en').trim().toLowerCase();
  const status = (data.status || 'draft').trim().toLowerCase();
  const label = sourceLabel(file);

  if (!slug) {
    hardErrors.push(`${label}: missing frontmatter slug`);
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    hardErrors.push(`${label}: invalid slug "${slug}"; use lowercase letters, numbers and single hyphens`);
  }

  if (!['en', 'zh'].includes(language)) {
    hardErrors.push(`${label}: unsupported language "${language}"`);
  }

  if (slug && ['en', 'zh'].includes(language)) {
    const key = `${language}:${slug}`;
    const previous = slugOwners.get(key);
    if (previous) hardErrors.push(`${label}: duplicate ${language} slug "${slug}" also used by ${previous.label}`);
    else slugOwners.set(key, { label, status });
  }

  documents.push({ file, label, slug, language, status, links: extractLinks(body) });
}

const inbound = new Map();
for (const key of slugOwners.keys()) inbound.set(key, new Set());

for (const document of documents) {
  const sourceKey = `${document.language}:${document.slug}`;

  for (const rawLink of document.links) {
    const pathname = toInternalPath(rawLink);
    if (!pathname) continue;

    if (pathname === '/en' || pathname.startsWith('/en/')) {
      const canonical = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
      hardErrors.push(`${document.label}: legacy default-English path "${pathname}"; use "${canonical}"`);
    }

    const target = blogTarget(pathname);
    if (!target) continue;

    const targetKey = `${target.language}:${target.slug}`;
    const targetOwner = slugOwners.get(targetKey);
    if (!targetOwner) {
      hardErrors.push(`${document.label}: internal blog link "${pathname}" has no matching ${target.language} content slug`);
      continue;
    }

    if (document.status === 'published' && targetOwner.status !== 'published') {
      hardErrors.push(`${document.label}: published content links to non-published target "${pathname}"`);
      continue;
    }

    if (document.status === 'published' && targetOwner.status === 'published' && targetKey !== sourceKey) {
      inbound.get(targetKey)?.add(document.label);
    }
  }
}

for (const document of documents) {
  if (document.status !== 'published' || !document.slug || !['en', 'zh'].includes(document.language)) continue;
  const key = `${document.language}:${document.slug}`;
  if ((inbound.get(key)?.size || 0) === 0) {
    warnings.push(`${document.label}: published page has no inbound link from another published content file`);
  }
}

console.log(`Checked ${documents.length} Markdown files.`);
console.log(`Unique slugs: ${slugOwners.size}.`);

if (warnings.length > 0) {
  console.log(`\nWarnings (${warnings.length}):`);
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (hardErrors.length > 0) {
  console.error(`\nErrors (${hardErrors.length}):`);
  for (const error of hardErrors) console.error(`- ${error}`);
  process.exitCode = 1;
} else if (strictOrphans && warnings.length > 0) {
  console.error('\nStrict orphan checking is enabled, so warnings fail the command.');
  process.exitCode = 1;
} else {
  console.log('\nLink-health source checks passed.');
}
