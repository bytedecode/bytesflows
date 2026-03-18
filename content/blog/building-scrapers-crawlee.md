---
title: "Building Scrapers with Crawlee (2026)"
slug: "building-scrapers-crawlee"
summary: "Crawlee for Python and Node: managed browser pool, proxy rotation, and storage. Build production scrapers with less boilerplate."
category: "Web Scraping"
tags: ["Crawlee", "Web Scraping"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2000"
---

## Introduction: Crawlee in a Nutshell

Crawlee is a library (Node.js and Python) built on Playwright and Puppeteer. It provides managed browser pools, automatic proxy rotation, storage adapters, and request queuing—reducing boilerplate for production scrapers. This guide covers the basics and when to use it.

---

## What Crawlee Provides

- **Browser pool** — Manages browser instances. Reuses them. Handles lifecycle.
- **Proxy rotation** — Integrates with proxy providers. Rotates per request or session.
- **Storage** — Save results to JSON, CSV, or custom backends. Built-in dataset and key-value store.
- **Request queue** — URL queue with deduplication. Good for crawling.
- **Stealth** — Pre-configured stealth settings to reduce detection.

---

## Basic Example (Node)

```javascript
import { PlaywrightCrawler } from 'crawlee';

const crawler = new PlaywrightCrawler({
  requestHandler: async ({ page, request }) => {
    const data = await page.locator('.product').allTextContents();
    await crawler.pushData({ url: request.url, products: data });
  },
});

await crawler.run(['https://example.com/products']);
```

Crawlee handles browser launch, teardown, and concurrency. Add proxy config in crawler options.

---

## Python ( crawlee )

```python
from crawlee.playwright_crawler import PlaywrightCrawler

async def handler(context):
    page = context.page
    data = await page.locator(".product").all_inner_texts()
    await context.push_data({"url": context.request.url, "products": data})

crawler = PlaywrightCrawler()
await crawler.run(["https://example.com/products"])
```

Similar model: crawler manages lifecycle, handler processes each request.

---

## Proxy Integration

Pass proxy configuration in crawler options:

```javascript
const crawler = new PlaywrightCrawler({
  proxyConfiguration: new ProxyConfiguration({
    proxyUrls: ['http://user:pass@gateway:8001'],
  }),
  requestHandler: async ({ page }) => { /* ... */ },
});
```

For rotating residential gateways, use the provider's URL. Crawlee rotates per request by default.

---

## When to Use Crawlee

**Use Crawlee when:** You want managed pools, queues, and storage without building them. Good for structured crawling projects.

**Use raw Playwright when:** You need full control, custom pipelines, or Crawlee's abstraction doesn't fit.

---

## Summary

Crawlee adds browser pools, proxy rotation, queues, and storage on top of Playwright. Reduces boilerplate for production scrapers. Use for structured crawling. Use raw Playwright when you need maximum control.

---

**Further reading:** [Crawlee Web Scraping Tutorial](/en/blog/crawlee-web-scraping-tutorial) · [Playwright Web Scraping Tutorial](/en/blog/playwright-web-scraping-tutorial) · [Proxy Rotation Strategies](/en/blog/proxy-rotation-strategies)
