---
title: "Scraping Dynamic Websites with Playwright"
slug: "scraping-dynamic-websites-playwright"
summary: "Mastering dynamic web scraping with Playwright in 2026. Learn to handle single-page applications (SPAs), manage JS execution, and integrate residential proxies for reliable data collection."
category: "AI & Automation"
tags: ["Automation", "Playwright", "Proxy", "Residential Proxy", "Web Scraping"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2000"
---

## The Problem: Static Tools Fail on SPAs

You try to scrape a product page with Requests: the HTML you get is a shell; the prices and images load only after JavaScript runs. Modern single-page apps (SPAs) render content in the browser. To extract that data, you need a real browser. Playwright gives you a headless Chromium, Firefox, or WebKit with a stable API and built-in waiting for network and DOM.

## Why Sites Block Scrapers

Common protection layers:

- Rate limiting
- IP reputation scoring
- Browser fingerprinting
- JavaScript challenges
- CAPTCHA verification
- Behavioral detection

Residential proxies help: they use real ISP IPs that sites treat as normal users, reducing blocks.

## Basic Playwright Scraper

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("https://example.com/products", wait_until="networkidle")
    items = page.query_selector_all(".product-card")
    for item in items:
        title = item.query_selector("h3")
        print(title.inner_text() if title else "")
    browser.close()
```

## Using a Proxy with Playwright

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        proxy={
            "server": "http://gateway.example.com:8001",
            "username": "user",
            "password": "pass"
        }
    )
    page = browser.new_page()
    page.goto("https://example.com")
    print(page.title())
    browser.close()
```

## Best Practices for Reliable Scraping

1. **Wait for content:** Use `wait_until="networkidle"` or wait for a specific selector before extraction.
2. **Rotate IPs:** Use a rotating residential proxy gateway; each session can get a new IP.
3. **Randomize timing:** Add `page.wait_for_timeout(random.randint(1000, 3000))` between actions.
4. **Monitor block rates:** Track 403/429 and success rate; adjust concurrency and proxy pool as needed.

## Verification and Troubleshooting

**Verify:**
- Take a screenshot with `page.screenshot(path="debug.png")` and inspect what the scraper sees.
- Compare extracted data with manual browser inspection.

| Symptom | Cause | Fix |
|---------|-------|-----|
| Empty selectors | Content not loaded yet | Wait for specific element or `networkidle` |
| 403 / blocked | Anti-bot or IP ban | Use residential proxies; vary fingerprint |
| Timeouts | Slow JS or network | Increase timeout; check for infinite loaders |

---

**Further reading:**
- [Playwright web scraping tutorial](/en/blog/playwright-web-scraping-tutorial)
- [Bypass Cloudflare web scraping](/en/blog/bypass-cloudflare-web-scraping)
- [Best proxies for web scraping](/en/blog/best-proxies-for-web-scraping)
