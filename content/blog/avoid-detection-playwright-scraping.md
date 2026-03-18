---
title: "How to Avoid Detection in Playwright Scraping (2026)"
slug: "avoid-detection-playwright-scraping"
summary: "Avoid detection in Playwright scraping: stealth settings, headers, fingerprint, and proxies. Reduce bot signals and blocks with best practices."
category: "Anti-Bot & Security"
tags: ["Anti-Bot", "Detection", "Playwright", "Residential Proxy", "Stealth"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=2000"
---

## Introduction: Why Playwright Still Gets Detected

Playwright drives a real Chromium browser, so it's closer to a real user than a simple HTTP client. Sites can still detect automation via **browser flags** (`navigator.webdriver`), **fingerprint** (canvas, WebGL), **behavior** (timing, lack of movement), and **IP** (datacenter vs residential). This guide covers how to reduce detection when using Playwright for scraping.

---

## 1. Browser Launch and Context (Reduce Obvious Flags)

Use a **realistic viewport**, **locale**, and **timezone** so the environment matches a normal user. Match them to your proxy region (e.g. US proxy → en-US, America/New_York).

**Example:**

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(
        viewport={"width": 1920, "height": 1080},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0 Safari/537.36",
        locale="en-US",
        timezone_id="America/New_York"
    )
    page = context.new_page()
    page.goto("https://target.com")
```

**Optional:** If a site is very strict, try `headless=False` (headed mode). Some systems are less aggressive on headed browsers. For automation at scale, headless + stealth is usually enough.

---

## 2. Proxies and IP

The IP is one of the strongest signals. Datacenter IPs are often blocked or limited. Use rotating residential proxies so traffic comes from real-user IPs.

```python
browser = p.chromium.launch(proxy={
    "server": "http://p1.example.com:8001",
    "username": "user",
    "password": "pass"
})
```

Pair with rotation so each session (or request) isn't always from the same IP. For session-based flows (login, checkout), use a sticky session ID in the username.

---

## 3. Fingerprint and Headers (Look Like a Real Browser)

Playwright sends browser-like headers by default. To further reduce fingerprint detection:

- **Keep consistency** — Same viewport and User-Agent per session. Don't switch device types (mobile/desktop) randomly on the same flow.
- **Don't over-disable** — Turning off cookies, JS, or images can create odd fingerprints. Only disable what you need.
- **Add stealth** — Use playwright-stealth to patch `navigator.webdriver` and other automation leaks when the default setup still gets flagged.

---

## 4. Behavior: Delays, Scrolling, Retries

Bots often request pages too fast or with no mouse/scroll. Add **random delays** and, when helpful, **simulate** scroll or movement:

```python
page.goto(url, wait_until="networkidle")
page.wait_for_timeout(1000 + int(1500 * random.random()))
page.mouse.move(200, 400, steps=10)
page.mouse.wheel(0, 600)
page.wait_for_timeout(800 + int(1200 * random.random()))
```

Combine with:
- **Max request rate per IP** — Cap concurrency per domain.
- **Backoff and retry** — On 429, 5xx, or CAPTCHA, close the session and retry with a new browser (new IP). Use exponential backoff.

---

## Checklist: Avoid Detection

| Layer | Action |
|-------|--------|
| IP | Use rotating residential proxies |
| Viewport | 1920×1080 or other realistic desktop size |
| Locale/timezone | Match proxy region |
| User-Agent | Consistent Chrome UA per session |
| Stealth | Add playwright-stealth if still detected |
| Behavior | Random delays, optional mouse/scroll |
| Failures | Retry with new browser, exponential backoff |

---

## Troubleshooting

**403 or block immediately** — IP or TLS. Switch to residential. Ensure Playwright (not requests) for strict sites.

**CAPTCHA on every request** — Multiple layers failing. Add playwright-stealth. Add more delays. Verify viewport/locale match proxy.

**Works then blocks** — Rate or behavior. Add delays. Reduce concurrency. Rotate more often.

---

## Summary

Reduce Playwright detection by: (1) realistic viewport, locale, timezone; (2) residential proxies; (3) consistent fingerprint; (4) playwright-stealth when needed; (5) randomized delays and optional movement; (6) retry with new IP on failure.

---

**Further reading:** [Playwright Web Scraping Tutorial](/en/blog/playwright-web-scraping-tutorial) · [Bypass Cloudflare for Web Scraping](/en/blog/bypass-cloudflare-web-scraping) · [Scrape Websites Without Getting Blocked](/en/blog/scrape-websites-without-getting-blocked)
