#!/usr/bin/env node

import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const contentDir = path.join(root, 'content', 'blog');

function unquote(value = '') {
  const v = value.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1).trim();
  }
  return v;
}

function parseFrontmatter(source) {
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

const files = (await readdir(contentDir))
  .filter((name) => /\.mdx?$/i.test(name))
  .sort();

const rows = [];
for (const file of files) {
  const source = await readFile(path.join(contentDir, file), 'utf8');
  const { data, body } = parseFrontmatter(source);
  const words = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;

  rows.push({
    file,
    title: data.title || '',
    slug: data.slug || '',
    language: (data.language || 'en').toLowerCase(),
    status: (data.status || 'draft').toLowerCase(),
    category: data.category || '',
    published: data.published || data['published at'] || data.publishedat || '',
    summary: data.summary || data.description || '',
    words,
  });
}

const countBy = (field) => Object.fromEntries(
  [...new Set(rows.map((row) => row[field] || '(empty)'))]
    .sort()
    .map((value) => [value, rows.filter((row) => (row[field] || '(empty)') === value).length]),
);

const summary = {
  total: rows.length,
  byLanguage: countBy('language'),
  byStatus: countBy('status'),
  byCategory: countBy('category'),
  byLanguageAndStatus: Object.fromEntries(
    [...new Set(rows.map((row) => `${row.language}:${row.status}`))]
      .sort()
      .map((key) => {
        const [language, status] = key.split(':');
        return [key, rows.filter((row) => row.language === language && row.status === status).length];
      }),
  ),
};

await writeFile('content-inventory.json', JSON.stringify(rows, null, 2));
await writeFile('content-inventory-summary.json', JSON.stringify(summary, null, 2));
console.log(`Exported ${rows.length} content records.`);
