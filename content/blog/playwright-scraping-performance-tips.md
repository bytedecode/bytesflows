---
title: "Playwright Scraping Performance Tips (2026)"
slug: "playwright-scraping-performance-tips"
summary: "Speed up Playwright scrapers. Context reuse, asset blocking, and concurrency without sacrificing success rate."
category: "Web Scraping"
tags: ["Playwright", "Performance", "Web Scraping"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2000"
---

## Introduction: Playwright Is Heavy

Playwright runs full browsers. Each instance uses 100MB+ RAM. Poor patterns lead to slow runs and memory bloat. This guide covers performance optimizations that preserve success rate.

---

## 1. Reuse Browser, Create Contexts

**Don't:** Launch a new browser per URL.

**Do:** One browser, many contexts. Contexts are lightweight (incognito-like).

```python
browser = p.chromium.launch()
for url in urls:
    context = browser.new_context()
    page = context.new_page()
    page.goto(url)
    # extract...
    context.close()
browser.close()
```

Contexts share the browser process. Much cheaper than launching per URL.

---

## 2. Block Unnecessary Assets

**Don't:** Load images, fonts, CSS if you only need HTML and text.

**Do:** Block or abort by route:

```python
page.route("**/*.{png,jpg,jpeg,gif,svg,woff2}", lambda r: r.abort())
```

Reduces bandwidth and speeds up `networkidle`. Use when you don't need visual rendering.

---

## 3. Tune wait_until

**networkidle** waits for no network activity. Slow on chatty pages. Use **domcontentloaded** or **load** when content is ready earlier. Or **wait_for_selector** for the specific element you need—often faster than networkidle.

---

## 4. Cap Concurrency

More parallel browsers = more throughput, but also more blocks. Start with 3–5 per domain. Increase only if success rate stays high. Use a semaphore or worker pool to limit.

---

## 5. Connection Reuse

Reuse browser and contexts. Don't create new Playwright instances in a loop. One `sync_playwright()` context, one browser, many contexts/pages.

---

## Troubleshooting

**High memory** — Reuse contexts. Close them when done. Don't hold references to many pages. Check for leaks in custom code.

**Slow despite optimization** — Check if `networkidle` is the bottleneck. Try `domcontentloaded` or selector-based wait. Block assets.

---

## Summary

Reuse browser and contexts. Block images/fonts when not needed. Tune wait strategy. Cap concurrency per domain. Avoid per-URL browser launches.

---

**Further reading:** [Playwright Web Scraping Tutorial](/en/blog/playwright-web-scraping-tutorial) · [Python Scraping Performance Optimization](/en/blog/python-scraping-performance-optimization) · [Headless Browser Scraping Guide](/en/blog/headless-browser-scraping-guide)
