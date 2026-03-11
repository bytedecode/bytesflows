---
title: "Using Proxies with Playwright - Configuration Guide (2026)"
slug: "using-proxies-playwright"
summary: "How to use proxies with Playwright: HTTP and SOCKS, per-browser config, rotating residential proxies. Code examples and best practices."
category: "playwright"
tags: ["Playwright", "proxy", "residential proxy", "browser automation"]
language: "en"
coverImage: "https://picsum.photos/seed/using-proxies-playwright/2000/1000"
---

## Using Proxies with Playwright

Playwright supports **HTTP and SOCKS proxies** at launch. You pass a `proxy` object with `server`, and optionally `username` and `password` for authenticated proxies. For scraping at scale, use a [rotating residential proxy](/en/blog/residential-proxies) gateway so each browser (or context) gets a different IP. See [Playwright Web Scraping Tutorial](/en/blog/playwright-web-scraping-tutorial) and [Best Proxies for Web Scraping](/en/blog/best-proxies-for-web-scraping).

## Basic Proxy Configuration

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(
        proxy={
            "server": "http://proxy.example.com:8080",
            "username": "user",
            "password": "pass"
        }
    )
    page = browser.new_page()
    page.goto("https://example.com")
```

With a **rotating residential proxy** provider, set `server` to the provider’s gateway (e.g. `http://gateway.bytesflows.com:8001`). Each new browser or context can get a new IP. Read [Rotating Proxies for Web Scraping](/en/blog/rotating-proxies-web-scraping) and [How Proxy Rotation Works](/en/blog/proxy-rotation-strategies). Use [Proxy Checker](/en/blog/proxy-checker) to verify the IP Playwright is using.

## Per-Context vs Per-Browser

- **Per-browser** — One proxy for all pages in that browser. Good for session-like scraping. [Proxy rotation strategies](/en/blog/proxy-rotation-strategies).
- **Per-context** — In some setups you can create multiple contexts with different proxies for parallel sessions. [Playwright at scale](/en/blog/playwright-web-scraping-tutorial) and [scraping data at scale](/en/blog/scraping-data-at-scale).

For [Cloudflare](/en/blog/bypass-cloudflare-web-scraping) and anti-bot sites, combine [residential proxies](/en/blog/residential-proxies) with Playwright’s real browser. [Handling Cloudflare with Playwright](/en/blog/bypass-cloudflare-web-scraping) and [avoid detection](/en/blog/scrape-websites-without-getting-blocked).

## Best Practices

- **Use residential proxies** — [Residential Proxies](/en/blog/residential-proxies) and [why residential is best](/en/blog/residential-proxies-improve-scraping) for Playwright.
- **Rotate** — New browser or context for new IP when needed. [Proxy Rotator](/en/blog/proxy-rotator) to test. [Using Proxies with Python](/en/blog/python-scraping-proxy) for Python + proxy patterns.
- **Handle failures** — Retry with a new proxy on block or CAPTCHA. [Handling CAPTCHAs](/en/blog/handling-captchas-in-scraping) and [avoid IP bans](/en/blog/avoid-ip-bans-web-scraping).

More: [Playwright Proxy Configuration](/en/blog/playwright-web-scraping-tutorial), [Ultimate Web Scraping Guide](/en/blog/ultimate-guide-web-scraping-2026), [Proxies](/en/proxies).

## Node.js Example

In Node.js you pass the same `proxy` option to `chromium.launch()`:

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    proxy: {
      server: 'http://proxy.example.com:8080',
      username: 'user',
      password: 'pass'
    }
  });
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await browser.close();
})();
```

With a [rotating residential proxy](/en/blog/residential-proxies) gateway, each new `browser` or `context` can get a new exit IP. See [Playwright web scraping tutorial](/en/blog/playwright-web-scraping-tutorial) and [best proxies for web scraping](/en/blog/best-proxies-for-web-scraping). Use [Proxy Checker](/en/blog/proxy-checker) to confirm the IP.

## Handling Proxy Failures

Proxies can be slow, offline, or blocked by the target. In Playwright, a failed request will throw or return an error. Best practice: catch errors, retry with the same or a new proxy (new browser/context if using [rotating proxies](/en/blog/rotating-proxies-web-scraping)), and back off on repeated failure. See [avoid IP bans](/en/blog/avoid-ip-bans-web-scraping) and [common proxy mistakes](/en/blog/avoid-ip-bans-web-scraping). For [Cloudflare](/en/blog/bypass-cloudflare-web-scraping) or CAPTCHA, combine [residential proxies](/en/blog/residential-proxies) with [handling CAPTCHAs](/en/blog/handling-captchas-in-scraping). [Scraping test](/en/blog/scraping-test) helps validate before scaling.

## Environment Variables

Some providers support proxy via environment variables (e.g. `HTTP_PROXY`, `HTTPS_PROXY`). Playwright can pick these up depending on version and config. For explicit control and [proxy rotation](/en/blog/proxy-rotation-strategies), passing `proxy` in code is usually better. [How proxy rotation works](/en/blog/proxy-rotation-strategies) and [proxy rotation strategies](/en/blog/proxy-rotation-strategies). [Using proxies with Python](/en/blog/python-scraping-proxy) for Python-side patterns. [Residential proxies](/en/blog/residential-proxies) and [Proxies](/en/proxies) for product options.

---

**Further reading:**
- [Ultimate web scraping guide](/en/blog/ultimate-guide-web-scraping-2026)
- [Best proxies for web scraping](/en/blog/best-proxies-for-web-scraping)
- [Residential proxies](/en/blog/residential-proxies)
- [Proxy rotation](/en/blog/proxy-rotation-strategies)
- [Web scraping architecture](/en/blog/web-scraping-architecture-explained)
- [Scraping data at scale](/en/blog/scraping-data-at-scale)
- [Avoid IP bans](/en/blog/avoid-ip-bans-web-scraping)
- [Playwright web scraping](/en/blog/playwright-web-scraping-tutorial)
- [Headless browser](/en/blog/headless-browser-scraping-guide)
- [Bypass Cloudflare](/en/blog/bypass-cloudflare-web-scraping)
- [How websites detect scrapers](/en/blog/how-websites-detect-scrapers)
- [Python web scraping guide](/en/blog/python-web-scraping-guide)
- [Proxy pools](/en/blog/proxy-pools-web-scraping)
- [Proxy Checker](/en/blog/proxy-checker)
- [Scraping Test](/en/blog/scraping-test)
- [Proxy Rotator](/en/blog/proxy-rotator)
- [Robots Tester](/en/blog/robots-tester)
- [Ethical web scraping](/en/blog/ethical-web-scraping-practices)
- [Web scraping legal](/en/blog/web-scraping-legal-considerations)
- [Common web scraping challenges](/en/blog/common-web-scraping-challenges)
- [Web scraping without getting blocked](/en/blog/scrape-websites-without-getting-blocked)
- [Proxies](/en/proxies)
