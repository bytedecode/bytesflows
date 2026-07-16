# Bytesflows Blog & Content

**[Bytesflows](https://bytesflows.com)** — **dynamic residential proxies** for web scraping at scale, plus guides and free tools. This repository is the Markdown source behind the site; start with the product if you need rotating residential IPs, then use the blog for technical guides.

→ **On the site:** **[Proxies](https://bytesflows.com/proxies)** · [Blog](https://bytesflows.com/blog) · [Pricing](https://bytesflows.com/pricing)

---

## What is Bytesflows?

**Bytesflows** provides **dynamic residential proxies** — real household IPs that rotate per request or per session so scrapers can collect public web data with better regional coverage and fewer network-level failures.

- **Rotating residential IPs** — Useful for distributed collection and regional testing
- **Geo-targeting** — Select countries or cities for local prices, inventory, SERP and market data
- **Technical content** — Practical implementation, QA, cost and troubleshooting guides

The content in this repository helps teams learn web scraping, evaluate proxy infrastructure and operate more reliable collection workflows. Explore the guides on the live site and review [Bytesflows proxies](https://bytesflows.com/proxies) when you are ready to test production traffic.

---

## Where to read the content

| Where | What |
|-------|------|
| **Proxies (product)** | [bytesflows.com/proxies](https://bytesflows.com/proxies) — residential proxies, geo-targeting and session controls |
| **Blog (site)** | [bytesflows.com/blog](https://bytesflows.com/blog) — articles, guides and implementation notes |
| **This repository** | `content/` — Markdown source synchronized to the publishing pipeline |

English is the default locale and uses paths without a locale prefix. Use `/blog/...`, `/proxies`, `/pricing` and other non-prefixed English URLs. Chinese pages use the `/zh/...` prefix.

---

## Content navigation

### By type

| Folder | Description | Example live URL |
|--------|-------------|------------------|
| **`content/blog/`** | Long-form articles, guides and comparisons | `https://bytesflows.com/blog/<slug>` |
| **`content/landing/`** | Topic or campaign content synchronized by the publishing pipeline | Depends on the configured site route |
| **`content/tools/`** | Documentation supporting on-site tools | Depends on the configured tool route |

### Current strategic topics

- Residential proxy evaluation and purchasing
- Proxy rotation, sticky sessions and protocol selection
- Playwright and browser automation
- SERP and rank-tracking data collection
- E-commerce price and inventory monitoring
- AI agents and controlled browser workflows
- Proxy troubleshooting, bandwidth estimation and route QA

The repository changes over time. Do not rely on an old hand-maintained article list as proof that a page still exists. The frontmatter slug and the live sitemap are the authoritative identifiers.

---

## Canonical internal-link rules

For default-English content:

```text
/blog/<slug>
/proxies
/pricing
/solutions/<slug>
/compare/<slug>
/locations/<slug>
/tools/<slug>
```

For Chinese content:

```text
/zh/blog/<slug>
/zh/proxies
/zh/pricing
```

Do not add `/en/` to English links. The production application uses English as the default locale, so `/en/...` creates unnecessary redirects and can produce inconsistent canonical signals.

Prefer relative internal paths in Markdown:

```md
[Playwright proxy setup](/blog/playwright-proxy-setup)
[Residential proxies](/proxies)
```

Absolute `https://bytesflows.com/...` links are accepted, but they must use the same canonical path convention.

---

## Link-health checks

Run the source-level audit before synchronizing content:

```bash
node scripts/check-link-health.mjs
```

The command fails when it finds:

- Missing or invalid frontmatter slugs
- Duplicate slugs within the same language
- Internal blog links whose target slug does not exist in this repository
- Default-English links that still use `/en/...`

It also reports published pages with no inbound content links as orphan candidates. To treat orphan warnings as failures:

```bash
node scripts/check-link-health.mjs --strict-orphans
```

This source check does not replace a production crawl. After deployment, also verify HTTP status codes, final URLs, redirect hops, canonicals and sitemap-to-internal-link graph differences.

See [docs/link-health-workflow.md](docs/link-health-workflow.md) for the full workflow.

---

## Repository structure for maintainers

```text
content/
  blog/       # Long-form content
  landing/    # Topic and campaign content
  tools/      # Tool-supporting content
scripts/
  check-link-health.mjs      # Offline slug and internal-link validation
docs/
  link-health-workflow.md    # Production and source audit process
```

The CMS synchronization job is maintained outside this content repository. Do not document a local upload command unless the corresponding executable file is committed and tested here.

### Adding or updating an article

1. Add or edit a Markdown file under `content/blog/`.
2. Set frontmatter fields including `title`, `slug`, `summary`, `category`, `tags`, `language` and `status`.
3. Use canonical internal paths without `/en/` for English.
4. Run `node scripts/check-link-health.mjs`.
5. Synchronize the source through the maintained CMS publishing pipeline.
6. Confirm the live article returns `200`, has a self-referencing canonical and appears in the intended index/sitemap.

---

## About this repository

This repository is the content source of truth for Bytesflows blog materials. Articles are published at [bytesflows.com](https://bytesflows.com) and should be discoverable through crawlable internal links and the sitemap.

- **Reading content:** Visit [bytesflows.com/blog](https://bytesflows.com/blog).
- **Product:** Visit [bytesflows.com/proxies](https://bytesflows.com/proxies).
- **Contributing and syncing:** Follow the repository structure and link-health workflow above.
- **Maintainer notes:** See [.github/REPO_SETUP.md](.github/REPO_SETUP.md), [.github/SEO_MARKETING_INDEX.md](.github/SEO_MARKETING_INDEX.md) and [docs/link-health-workflow.md](docs/link-health-workflow.md).
