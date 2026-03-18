---
title: "Scraping Infinite Scroll Pages (2026)"
slug: "scraping-infinite-scroll-pages"
summary: "Handle infinite scroll in Playwright. Trigger loading, wait for new content, and extract without missing items."
category: "Web Scraping"
tags: ["Infinite Scroll", "Playwright", "Web Scraping"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=2000"
---

## Introduction: Content That Loads on Scroll

Many sites (social feeds, product listings, search results) load more content as you scroll. Initial HTML has only the first batch. To get everything, you must simulate scrolling and wait for new content. This guide shows how with Playwright.

---

## How Infinite Scroll Works

The page listens for scroll events. When you near the bottom, it fetches more data and appends to the DOM. Your scraper must: (1) scroll, (2) wait for new items, (3) repeat until no more load or a limit.

---

## Basic Pattern

```python
from playwright.sync_api import sync_playwright
import time, random

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto("https://example.com/feed", wait_until="networkidle")
    
    prev_count = 0
    for _ in range(20):  # Max scroll rounds
        page.mouse.wheel(0, 800)
        time.sleep(random.uniform(1, 3))
        items = page.locator(".feed-item")
        count = items.count()
        if count == prev_count:
            break
        prev_count = count
    
    data = page.locator(".feed-item").all_inner_texts()
    browser.close()
```

Scroll in steps. Wait between scrolls. Stop when item count stops growing. Use a max iteration to avoid infinite loops.

---

## Sticky Session

Infinite scroll often needs a **sticky proxy** session. Same IP for the whole scroll sequence. If the IP changes mid-scroll, the server may break the session. Use a session ID in the proxy username for sticky behavior.

---

## Waiting for New Content

Options:
- **Fixed wait** — `time.sleep(2)` after each scroll. Simple but may be too short or too long.
- **Wait for selector** — `page.wait_for_selector(".new-item", timeout=5000)` if new items have a specific class.
- **Wait for count change** — Poll `locator.count()` until it increases or a timeout.
- **networkidle** — Risky; some pages have constant background traffic. Prefer selector or count.

---

## Troubleshooting

**Missing items** — Scroll slower. Increase wait. Some sites load on "scroll to bottom"; ensure you scroll enough. Check if content is in an iframe.

**Blocked** — Use residential proxy. Add longer delays. Sticky session for the full scroll.

---

## Summary

Scroll in steps, wait for new content, repeat until no growth or limit. Use sticky proxy for the session. Add randomized delays. Stop when count stabilizes or max rounds reached.

---

**Further reading:** [Playwright Web Scraping Tutorial](/en/blog/playwright-web-scraping-tutorial) · [Scraping Dynamic Websites with Python](/en/blog/scraping-dynamic-websites-python) · [Proxy Rotation Strategies](/en/blog/proxy-rotation-strategies)
