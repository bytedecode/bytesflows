---
title: "Browser Stealth Techniques (2026)"
slug: "browser-stealth-techniques-scraping"
summary: "Master the art of 'looking human' while scraping. Explore essential browser stealth techniques for 2026, including environment spoofing, fingerprint randomization, and the critical role of high-trust residential proxy networks."
category: "Anti-Bot & Security"
tags: ["Anti-Bot", "Bot Detection", "Detection"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2000"
---

## Introduction: Why Browsers Get Caught

Playwright and Puppeteer drive real browsers, but they leave automation traces. Sites check `navigator.webdriver`, viewport consistency, and behavioral patterns. **Stealth techniques** reduce these signals so your scraper looks like a normal user. This guide covers the main methods and when to apply them.

---

## 1. Patch Automation Flags

**The leak:** `navigator.webdriver === true` in automation. Anti-bot scripts check this.

**Fix:** Use **playwright-stealth** (or puppeteer-extra-plugin-stealth). These plugins override the property and patch other common leaks (permissions, plugins, languages).

```python
from playwright.sync_api import sync_playwright
from playwright_stealth import stealth_sync

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    stealth_sync(page)
    page.goto("https://target.com")
```

Apply stealth before any navigation. Use when the default browser still gets flagged.

---

## 2. Consistent Viewport and Headers

**The leak:** Unusual viewport (800×600) or mismatch between User-Agent and viewport (e.g. "Chrome" with mobile dimensions).

**Fix:** Use a common desktop size (1920×1080, 1366×768). Match User-Agent to the viewport and device type. Keep them consistent per session—don't randomize per request in a way that creates contradictions.

```python
context = browser.new_context(
    viewport={"width": 1920, "height": 1080},
    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36"
)
```

---

## 3. Locale and Timezone

**The leak:** US IP with `ja-JP` locale, or Japanese IP with `America/New_York` timezone. Geo inconsistency triggers checks.

**Fix:** Match locale and timezone to the proxy's exit region. US proxy → `en-US`, `America/New_York`. UK proxy → `en-GB`, `Europe/London`.

```python
context = browser.new_context(
    locale="en-US",
    timezone_id="America/New_York"
)
```

---

## 4. Behavioral Mimicry

**The leak:** No mouse movement, instant scroll-to-bottom, fixed delays between actions.

**Fix:** Add randomized delays: `page.wait_for_timeout(1000 + int(2000 * random.random()))`. For scroll, use `page.mouse.wheel(0, 300)` in steps with pauses. Optional: `page.mouse.move(x, y, steps=10)` for curved movement. Many sites don't require this; add only when needed.

---

## 5. Residential Proxies

**The leak:** All other signals can be perfect, but a datacenter IP still gets blocked.

**Fix:** Use rotating residential proxies. High-trust IPs reduce the chance that anti-bot systems escalate to fingerprint or behavior checks.

---

## Decision Table

| Symptom | Action |
|---------|--------|
| Blocked despite correct UA | Add playwright-stealth |
| Blocked with stealth | Check locale, timezone match proxy |
| CAPTCHA on every request | Residential proxy + more delays |
| Works then fails | Add behavioral delays, reduce concurrency |

---

## What to Avoid

- **Don't randomize viewport per request** — Creates inconsistent fingerprint. Pick one and stick to it per session.
- **Don't disable too much** — Turning off JS, cookies, or images can create odd fingerprints. Only disable what you need.
- **Don't skip proxies for strict targets** — Stealth alone isn't enough if the IP is datacenter.

---

## Summary

Use playwright-stealth to patch automation flags. Keep viewport, User-Agent, locale, and timezone consistent and matched to the proxy. Add randomized delays. Pair with residential proxies. Avoid over-randomization that creates contradictions.

---

**Further reading:** [Preventing Scraper Fingerprinting](/en/blog/preventing-scraper-fingerprinting) · [Avoid Detection in Playwright Scraping](/en/blog/avoid-detection-playwright-scraping) · [Bypass Cloudflare for Web Scraping](/en/blog/bypass-cloudflare-web-scraping)
