---
title: "How to Avoid Detection in Playwright Scraping (2026)"
slug: "avoid-detection-playwright-scraping"
summary: "Avoid detection in Playwright scraping: stealth settings, headers, fingerprint, and proxies. Reduce bot signals and blocks with best practices."
category: "playwright"
tags: ["Playwright", "detection", "stealth", "anti-bot", "proxy"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=2000"
---

## Why Playwright Gets Detected

Playwright drives a real Chromium (or Firefox/WebKit) browser, so it’s already closer to a real user than a simple HTTP client. Sites can still detect automation via **browser flags** (e.g. `navigator.webdriver`), **fingerprint** (canvas, WebGL, fonts), **behavior** (timing, lack of mouse movement), and **IP** (datacenter vs [residential](/en/blog/residential-proxies)). This guide covers how to reduce detection when using Playwright for scraping. See [browser fingerprinting](/en/blog/browser-fingerprinting-explained), [how websites detect scrapers](/en/blog/how-websites-detect-scrapers), and [web scraping without getting blocked](/en/blog/scrape-websites-without-getting-blocked). For production, combine with [residential proxies](/en/blog/residential-proxies) and [best proxies for web scraping](/en/blog/best-proxies-for-web-scraping).

## Browser launch and context (reduce obvious bot flags)

Use a **realistic viewport**, **locale**, and **timezone** so the environment matches a normal user. Avoid headless if the site is very strict (use `headless: false` or the newer “headed/headless=auto” modes).

Example Playwright launch with basic stealth defaults:

```ts
import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true, // try false if a site is very strict
});

const context = await browser.newContext({
  viewport: { width: 1366, height: 768 },
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  locale: 'en-US',
  timezoneId: 'America/New_York',
});

const page = await context.newPage();
```

See [Playwright web scraping tutorial](/en/blog/playwright-web-scraping-tutorial) and [headless browser scraping](/en/blog/headless-browser-scraping-guide). [Bypass Cloudflare](/en/blog/bypass-cloudflare-web-scraping) and [handling CAPTCHAs](/en/blog/handling-captchas-in-scraping) when challenges appear.

## Proxies and IP (don’t look like a bot farm)

The **IP** is one of the strongest signals. Datacenter IPs are often blocked or limited. Use [rotating residential proxies](/en/blog/residential-proxies) so traffic comes from real-user IPs.

Playwright proxy example:

```ts
import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  proxy: {
    server: 'http://p1.bytesflows.com:8001',
    username: process.env.BYTESFLOWS_USERNAME,
    password: process.env.BYTESFLOWS_PASSWORD,
  },
});
```

Pair this with [proxy rotation strategies](/en/blog/proxy-rotation-strategies) so each session or request isn’t always from the same IP. See [using proxies with Playwright](/en/blog/using-proxies-playwright), [why residential proxies](/en/blog/why-residential-proxies-best-scraping), [avoid IP bans](/en/blog/avoid-ip-bans-web-scraping), and [Proxy Checker](/en/blog/proxy-checker). [Best proxies for web scraping](/en/blog/best-proxies-for-web-scraping) and [Proxies](/en/proxies).

## Fingerprint and headers (look like a real browser)

Playwright sends browser-like headers by default. To further reduce [fingerprinting](/en/blog/browser-fingerprinting-explained):

- Keep a consistent viewport and user agent per session.
- Avoid switching devices (mobile/desktop) too frequently on the same account.
- Don’t disable too many features (cookies, JS, images) unless necessary.

You can inspect your headers with [HTTP header checker](/en/blog/http-header-checker) and adjust. For high-security sites, consider:

- Using stable, realistic profiles (same UA + viewport + languages).
- Avoiding obviously automated patterns (e.g. requesting `/robots.txt` then hammering the site).

See [preventing scraper fingerprinting](/en/blog/preventing-scraper-fingerprinting), [browser stealth techniques](/en/blog/browser-stealth-techniques-scraping), [anti-bot systems](/en/blog/anti-bot-systems-explained), and [web scraping detection methods](/en/blog/web-scraping-detection-methods).

## Behavior: delays, scrolling, and retries

Bots often request pages too fast or with no mouse/scroll. Add **random delays** between actions and, when it helps, **simulate** scroll or click so behaviour looks more human:

```ts
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000 + Math.random() * 1500);

await page.mouse.move(200, 400, { steps: 10 });
await page.mouse.wheel(0, 600);
await page.waitForTimeout(800 + Math.random() * 1200);
```

Combine this with:

- Max request rate per IP / per account.
- Backoff and retry when you see 429/5xx or captchas.

See [web scraping without getting blocked](/en/blog/scrape-websites-without-getting-blocked), [avoid IP bans](/en/blog/avoid-ip-bans-web-scraping), [scraping dynamic websites](/en/blog/scraping-dynamic-websites-playwright), [Playwright at scale](/en/blog/playwright-web-scraping-tutorial), [ultimate web scraping guide](/en/blog/ultimate-guide-web-scraping-2026), and [Scraping Test](/en/blog/scraping-test).

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

**Next steps:**\n\n1. Turn one of your existing Playwright scripts into a “stealth” version using the launch/context and delay examples above.\n2. Add [residential proxies](/en/blog/residential-proxies) and [proxy rotation](/en/blog/proxy-rotation-strategies), then watch how your block/ban rate changes.\n3. Use [Proxy Checker](/en/blog/proxy-checker), [Scraping Test](/en/blog/scraping-test), and [HTTP Header Checker](/en/blog/http-header-checker) to iterate on your setup.\n\nFor a broader picture, see [ultimate web scraping guide](/en/blog/ultimate-guide-web-scraping-2026), [best proxies](/en/blog/best-proxies-for-web-scraping), and [web scraping without getting blocked](/en/blog/scrape-websites-without-getting-blocked).
