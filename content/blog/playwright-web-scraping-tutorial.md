---
title: "Playwright Web Scraping Tutorial: From Basics to Anti-Bot Mastery"
slug: "playwright-web-scraping-tutorial"
summary: "2026 Playwright web scraping tutorial for modern apps. Learn to capture React/Next.js content, manage infinite scrolls, and master stealth techniques with residential proxies."
category: "AI & Automation"
tags: ["Automation", "Playwright", "Tutorial", "Web Scraping", "Web scraping tutorial"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2000"
---

## Introduction: Why Playwright in 2026?

Modern web applications (React, Vue, Next.js) rely on client-side rendering. HTTP libraries like `requests` or `axios` often return only a skeleton HTML file. **Playwright**, developed by Microsoft, drives a real Chromium, Firefox, or WebKit browser. It executes JavaScript, handles dynamic content, and supports multi-context scenarios. This guide moves beyond basics to a production-ready scraper.

---

## Core Concepts: Contexts vs Pages

A **BrowserContext** is like an isolated incognito window. Each context has its own cookies, storage, and cache.

**Benefits:**
- **Isolation** — Run hundreds of parallel scrapers without data leaking between them.
- **Performance** — Launch the browser once, create many contexts for different tasks. Contexts are lighter than full browser instances.

```python
context1 = await browser.new_context()
context2 = await browser.new_context()
# context1 and context2 are isolated
```

---

## Solving the "Bot" Problem

Playwright out of the box leaves automation signals. Sites check `navigator.webdriver` and other fingerprint traits. To reduce detection:

1. **Use a stealth plugin** — playwright-stealth patches common automation leaks.
2. **Use residential proxies** — High-trust IPs reduce blocks. Rotating proxies spread load.
3. **Realistic viewport and User-Agent** — 1920×1080, consistent Chrome UA. Match locale to proxy region.

---

## Real-World Example: Dynamic Marketplace with Infinite Scroll

```python
import asyncio
from playwright.async_api import async_playwright

async def scrape_dynamic_store():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            proxy={"server": "http://p1.example.com:8001",
                   "username": "user", "password": "pass"}
        )
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0 Safari/537.36",
            viewport={"width": 1920, "height": 1080}
        )
        page = await context.new_page()
        await page.goto("https://example-shop.com/products", wait_until="networkidle")
        for _ in range(5):
            await page.mouse.wheel(0, 500)
            await asyncio.sleep(1)
        items = page.locator(".product-card")
        count = await items.count()
        for i in range(count):
            title = await items.nth(i).locator(".title").inner_text()
            price = await items.nth(i).locator(".price").inner_text()
            print(f"{title} | {price}")
        await browser.close()
```

**Key points:** Proxy for IP. Viewport 1920×1080. `locator` auto-waits for dynamic DOM. Scroll + sleep for lazy load.

---

## Best Practices for Scaling

1. **Use locators, not raw selectors** — Playwright's `locator` API auto-waits for elements. Handles dynamic shifts.
2. **Close resources** — Always close pages and contexts. Avoid zombie browser processes.
3. **Handle challenges** — On CAPTCHA or block, close the session and retry with a new browser (new IP). Don't hammer the same IP.
4. **Reuse contexts** — One browser, many contexts. Cheaper than one browser per URL.

---

## Troubleshooting

**Empty content** — Wait for the right moment. Use `wait_until="networkidle"` or `page.wait_for_selector(".product-list")`. Some SPAs need 2–5 seconds after load.

**Blocked despite proxy** — Add playwright-stealth. Ensure viewport and User-Agent match. Add randomized delays between navigations.

**Memory leak** — Close contexts and pages when done. Reuse contexts instead of creating new browsers for every URL.

---

## Summary

Playwright is the standard for JavaScript-rendered scraping. Use contexts for isolation and scale. Pair with residential proxies and stealth. Prefer locators for dynamic content. Handle infinite scroll with wheel + wait. Close resources and retry with new IP on failure.

---

**Further reading:** [Bypass Cloudflare for Web Scraping](/en/blog/bypass-cloudflare-web-scraping) · [Avoid Detection in Playwright Scraping](/en/blog/avoid-detection-playwright-scraping) · [Using Proxies with Playwright](/en/blog/using-proxies-playwright)
