# BytesFlows CMS Publishing Backlog — July 2026

## Current measured state

The production audit compares every `status: Published` Markdown article with its live detail route, blog listing, canonical URL, redirect chain, and sitemap membership.

Measured on 2026-07-16:

- Source Published articles: **45**
- Healthy live articles: **22**
- Live `404`: **20**
- Conflicting application redirects: **3**
- English source articles: **37**
- Chinese source articles: **8**

The machine-readable priority list is maintained in [`publishing-backlog-2026-07.csv`](publishing-backlog-2026-07.csv).

## Important distinction

There are two different failure classes and they require different fixes.

### CMS publication failures

Twenty source articles return a real `404`, are absent from the live listing, and are absent from the sitemap. These must be reviewed in the CMS by the compound key:

```text
Language + Slug
```

Do not blindly create a new page. First query for an existing CMS record because the page may be hidden by an incorrect status, language, future Published date, or duplicate record.

For each row:

1. Query the CMS by exact slug and language.
2. If no record exists, create it from the Markdown source.
3. If a record exists, reconcile title, slug, language, status, Published date, summary, metadata, cover, tags, and body.
4. Ensure `Status = Published`.
5. Ensure the Published date is not in the future for the intended release wave.
6. Verify the source body was synchronized completely.
7. Purge/revalidate the article and listing caches.
8. Confirm detail `200`, self canonical, list membership, and sitemap membership.

### Application route conflicts

These three source articles already exist in the live inventory but application redirects override their detail routes:

- `openclaw-local-ollama-setup-part-1`
- `playwright-proxy-errors`
- `playwright-proxy-setup`

They must **not** be duplicated in the CMS. The `jlongguo/bytesflows-web` iteration branch removes those conflicting redirects and restores the article routes.

## Release waves

### Wave 1 — commercial and product-aligned

Publish these first:

1. `residential-proxy-cost-calculator`
2. `residential-proxy-speed-test`
3. `what-is-residential-proxy`
4. `rotating-vs-sticky-residential-proxies`
5. `proxies-for-rank-tracking`
6. `local-rank-tracking-proxies`
7. `isp-vs-residential-proxies-for-rank-tracking`
8. `serp-scraping-proxy-setup`
9. `playwright-residential-proxy-guide`
10. `python-proxy-scraping-guide`

These pages directly support pricing, product evaluation, rank tracking, SERP workflows, browser automation, and developer integration.

Recommended rollout:

```text
Day 1: cost calculator, speed test, pillar, rotating vs sticky
Day 2: rank-tracking cluster
Day 3: Playwright and Python guides
```

Release in smaller batches so indexation, internal linking, canonical output, and conversion paths can be reviewed before the next batch.

### Wave 2 — AI and specialized engineering

- `ai-browser-agents-playwright`
- `ai-data-collection-web`
- `ai-dynamic-proxy-technical-implementation`
- `openclaw-proxy-setup`
- `proxy-rotation-strategy`
- `socks5-residential-proxies-guide`
- `scraping-social-media-data`
- `scrapling-openclaw-linkedin-agents-scale`

The social-media and professional-network articles require an additional compliance and positioning review before publication.

### Consolidate or hold

#### `cloudflare-403-proxy-troubleshooting`

Do not publish this as a second near-identical Cloudflare page without differentiation. The healthy `cloudflare-403-troubleshooting` article already serves closely overlapping intent. Merge unique material or define a separate intent before publishing.

#### Chinese `openclaw-local-ollama-setup-part-1`

Hold until a Chinese OpenClaw topic cluster and localized commercial journey exist. Publishing an isolated low-commercial-intent tutorial would not materially improve the current business funnel.

## Acceptance criteria for each CMS publication

A page is considered published only when all conditions pass:

```text
Source status = Published
CMS Status = Published
CMS Language = source Language
CMS Slug = source Slug
CMS Published date <= current release time
Initial HTTP = 200
Final HTTP = 200
Redirect count = 0
Final URL = expected article URL
Canonical = expected article URL
Present in intended blog listing
Present in sitemap
No duplicate Language + Slug record
At least one relevant internal inbound link
Relevant product/solution CTA is present
```

## Validation commands

Source-only checks:

```bash
node scripts/check-link-health.mjs --strict-orphans
```

Production report:

```bash
node scripts/audit-publishing-consistency.mjs
```

Strict mode should be enabled only after the current CMS backlog is cleared:

```bash
node scripts/audit-publishing-consistency.mjs --strict
```

## Current blocker

The Markdown repository does not contain the actual CMS synchronization implementation. The README previously referenced a local uploader, but no tested uploader exists in the repository. The publishing pipeline is therefore external to this codebase.

The next operational step requires access to that external sync job or direct Notion/CMS credentials. Until that access is available, this repository can provide deterministic source validation, a prioritized import manifest, and production verification, but it cannot safely mutate the CMS.
