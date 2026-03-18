---
title: "Scraping JavaScript Websites with Python (2026)"
slug: "scraping-javascript-websites-python"
summary: "Python guide to scraping JS-rendered sites. Playwright, Selenium, and when to use each. Bypass client-side rendering with browser automation."
category: "Web Scraping"
tags: ["Python", "JavaScript", "Web Scraping"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=2000"
---

## Introduction: The Empty HTML Problem

You fetch a URL with `requests` and get HTML—but the product list, prices, or main content are missing. The page loads them via JavaScript after the initial response. To scrape it, you need something that runs JavaScript like a browser. This guide shows how to do that with Python.

---

## Why requests Fails

Many sites (React, Vue, Next.js, Angular) send a minimal HTML shell. The real content is injected by client-side JavaScript. `requests` gets the shell only. You see empty divs or "Loading...". The fix is browser automation.

---

## Playwright (Recommended)

Playwright drives real Chromium, Firefox, or WebKit. Fast, auto-waiting API, good for scraping.

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("https://example-spa.com", wait_until="networkidle")
    page.wait_for_selector(".product-list")
    items = page.locator(".product").all_inner_texts()
    browser.close()
```

**Key:** `wait_until="networkidle"` lets the SPA load. `wait_for_selector` ensures content before extraction. Use `locator` for robust queries.

---

## Selenium (Alternative)

Selenium also drives browsers. Older, more verbose, but widely used.

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Chrome()
driver.get("https://example-spa.com")
WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, "product-list")))
items = [el.text for el in driver.find_elements(By.CLASS_NAME, "product")]
driver.quit()
```

You must handle waits explicitly. Playwright's auto-wait is simpler.

---

## Adding a Proxy

For strict or high-volume targets:

```python
browser = p.chromium.launch(proxy={"server": "http://p1.example.com:8001", "username": "user", "password": "pass"})
```

Use residential proxies for Cloudflare and similar.

---

## Waiting Strategies

| Strategy | When to use |
|----------|-------------|
| networkidle | Most SPAs. Waits for network quiet. |
| domcontentloaded | DOM ready, JS may still run. Often too early. |
| wait_for_selector | Specific element. Most reliable. |
| wait_for_timeout | Last resort. Fixed delay. |

Prefer `wait_for_selector` for extraction. Use `networkidle` as a baseline for navigation.

---

## Summary

JS-rendered sites require a browser. Use Playwright (preferred) or Selenium. Wait for `networkidle` or specific selectors. Add residential proxy for strict targets. Avoid `requests` for client-rendered content.

---

**Further reading:** [Scraping Dynamic Websites with Python](/en/blog/scraping-dynamic-websites-python) · [Playwright Web Scraping Tutorial](/en/blog/playwright-web-scraping-tutorial) · [Headless Browser Scraping Guide](/en/blog/headless-browser-scraping-guide)
