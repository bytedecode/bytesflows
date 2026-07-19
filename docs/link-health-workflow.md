# BytesFlows Link-Health Workflow

This workflow separates **source validation** from **production crawling**. Both are required: the content repository can prove that a referenced slug exists, while only the deployed site can prove the final HTTP status, redirect behavior and canonical output.

## 1. Source checks before publishing

Run:

```bash
node scripts/check-link-health.mjs
```

Use strict orphan checking for a deliberate content-cluster review:

```bash
node scripts/check-link-health.mjs --strict-orphans
```

The checker validates:

- Frontmatter contains a route-safe slug
- Slugs are unique within each language
- English internal URLs do not use the legacy `/en/` prefix
- `/blog/<slug>` and `/zh/blog/<slug>` links resolve to a matching source document
- Published documents receive an inbound link from another content document

An orphan warning is a candidate, not proof of a production orphan. Navigation components, product pages and dynamically generated related-content modules can create inbound links outside this repository.

## 2. Publishing consistency

The publishing pipeline must use the same public-page predicate as the website:

```text
status = Published
language = requested locale
published date <= current time
slug is valid and non-empty
```

For every synchronized document, compare these sets:

```text
source Published slugs
Notion/CMS Published slugs
website listing slugs
website detail-route slugs
sitemap slugs
```

Unexpected differences should block a release or create a review task.

## 3. Production HTTP crawl

After deployment, crawl the sitemap and all crawlable internal links. Record at least:

- Source URL
- Initial status code
- Every `Location` header
- Final status code
- Final URL
- Redirect count
- Canonical URL
- Referring internal pages
- Sitemap membership

### Required outcomes

| URL class | Required behavior |
|---|---|
| Current article | Final `200`, same canonical article path |
| Moved article with equivalent replacement | One `301` to the equivalent replacement |
| Removed article without equivalent replacement | `404` or `410` |
| Search/filter result | Usually `noindex,follow`, canonical to the unfiltered hub where appropriate |
| Pagination | Stable unique records and consistent totals |

A missing article must not redirect to the generic `/blog` hub. Search engines commonly interpret that behavior as a soft 404, and users lose the context promised by the original link.

## 4. Redirect-map review

Maintain an explicit redirect map with:

```text
old_path,new_path,reason,reviewed_at
```

Approve a redirect only when the destination satisfies substantially the same intent. For example, an installation tutorial should not redirect to a broad product or topic hub merely because both mention the same software name.

Keep every approved migration to one hop:

```text
old URL -> final 200 URL
```

When replacing a destination, update all historical redirect sources to point directly to the newest final URL.

## 5. Orphan-page analysis

Build two sets from the production crawl:

```text
indexable sitemap URLs
indexable URLs reached through crawlable internal links
```

The candidate orphan set is:

```text
sitemap URLs - internally linked URLs
```

Review each candidate before adding arbitrary links. A page should be linked from the most relevant hub, comparison, solution or article cluster—not from a generic footer solely to satisfy a crawler.

## 6. Pagination acceptance tests

For every blog page:

- Sort with a stable tie-breaker, such as `publishedAt DESC, updatedAt DESC, slug ASC, id ASC`
- Deduplicate by normalized locale + slug
- Exclude the featured article from the list exactly once
- Calculate displayed totals and page ranges from the same deduplicated dataset
- Reject or redirect page numbers outside the valid range

Automated tests should assert that concatenating all page results produces the same unique slug set as the public archive query.

## 7. Canonical locale convention

English is the default locale:

```text
/blog/example
/proxies
/pricing
```

Chinese uses an explicit locale prefix:

```text
/zh/blog/example
/zh/proxies
/zh/pricing
```

Do not create new English links under `/en/...`. Existing legacy URLs may redirect once to their non-prefixed canonical destination, but internal links should always point directly to the canonical URL.

## 8. Suggested CI gates

Content repository:

```bash
node scripts/check-link-health.mjs
```

Website repository:

```bash
pnpm test
pnpm lint
pnpm build
```

Deployment verification should additionally fail on:

- New article-to-hub redirects
- More than one redirect hop
- Blog cards whose detail URL does not finish with `200`
- Duplicate slugs across pagination
- Canonical URLs that differ from the final URL without an approved reason
- Published source/CMS pages missing from the live index or sitemap
