---
title: "Scraping Dynamic Websites with Python (2026)"
slug: "scraping-dynamic-websites-python"
summary: "Comprehensive 2026 guide to scraping dynamic websites using Python. Explore Selenium, Playwright, and async patterns paired with residential proxies to bypass modern anti-bot systems."
category: "Web Scraping"
tags: ["Python", "Web Scraping"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=2000"
---

## Introduction: The Empty Page Problem

You fetch a URL with `requests` and get HTML—but the content you need is missing. The page loads it via JavaScript after the initial response. That's a **dynamic** (or client-rendered) site. To scrape it, you need something that runs JavaScript like a real browser. This guide covers when to use browser automation, Playwright vs Selenium, and how to pair it with proxies.

---

## Why requests Fails on Dynamic Sites

Many modern sites (React, Vue, Next.js) send a minimal HTML shell. The real content is injected by JavaScript. `requests` gets the shell, not the rendered result. You'll see empty divs, loading spinners, or placeholder text. The only fix is to execute the JavaScript.

---

## Playwright vs Selenium

| Factor | Playwright | Selenium |
|--------|------------|----------|
| Speed | Faster, auto-waits | Slower, manual waits |
| Setup | `pip install playwright && playwright install` | Browser driver management |
| Browsers | Chromium, Firefox, WebKit | Chrome, Firefox, etc. |
| API | Modern, async-friendly | Older, more verbose |

**Recommendation:** Use Playwright for new projects. Selenium is still viable but Playwright is faster and easier to integrate with async and proxies.

---

## Basic Playwright Example

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("https://example-spa.com/products", wait_until="networkidle")
    page.wait_for_selector(".product-list")
    items = page.locator(".product").all_inner_texts()
    browser.close()
```

**Key points:** `wait_until="networkidle"` gives the SPA time to load. `wait_for_selector` ensures the content is present before extraction. Use `locator` for robust, auto-waiting queries.

---

## Adding a Proxy

For strict or high-volume targets, add a residential proxy at launch:

```python
browser = p.chromium.launch(proxy={
    "server": "http://p1.example.com:8001",
    "username": "user", "password": "pass"
})
```

Each new browser typically gets a new IP from a rotating gateway. Use a realistic viewport (1920×1080) and User-Agent.

---

## Waiting Strategies

Dynamic content appears at different times. Options:

- **networkidle** — Wait until no network activity for 500ms. Good for most SPAs.
- **domcontentloaded** — DOM ready, JS may still run. Often too early.
- **wait_for_selector** — Wait for a specific element. Most reliable for extraction.

```python
page.goto(url, wait_until="networkidle")
page.wait_for_selector(".product-card", timeout=10000)
page.wait_for_timeout(2000)  # Extra buffer if needed
```

---

## Troubleshooting

**Empty content** — Page may need more time. Use `wait_for_selector` or increase timeout. Check if the site uses infinite scroll (scroll to trigger load).

**Blocked** — Add residential proxy. Use playwright-stealth for automation leaks. Add delays between navigations.

**Slow** — Disable images if not needed: `page.route("**/*.{png,jpg,jpeg,gif}", lambda r: r.abort())`. Reuse browser contexts instead of launching per URL.

---

## Summary

Dynamic sites require a browser. Use Playwright to run JavaScript and extract rendered content. Wait for `networkidle` or specific selectors. Add residential proxies for strict targets. Prefer Playwright over Selenium for new projects.

---

**Further reading:** [Playwright Web Scraping Tutorial](/en/blog/playwright-web-scraping-tutorial) · [Bypass Cloudflare for Web Scraping](/en/blog/bypass-cloudflare-web-scraping) · [Headless Browser Scraping Guide](/en/blog/headless-browser-scraping-guide)
