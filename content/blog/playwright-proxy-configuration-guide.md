---
title: "Playwright Proxy Configuration Guide (2026)"
slug: "playwright-proxy-configuration-guide"
summary: "Comprehensive 2026 guide to Playwright proxy configuration. Learn to integrate residential proxies and rotation strategies to build resilient, undetectable scraping pipelines."
category: "Proxy Services"
tags: ["Browser", "Playwright", "Residential Proxy"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=2000"
---

## When Playwright Gets Blocked Even With Good Code

Your Playwright script runs locally, but from a server it gets CAPTCHAs or blocks. The code and selectors are fine; the issue is the **IP**. Servers and datacenter IPs are flagged. Routing traffic through **residential proxies** fixes most of these blocks.

This guide shows how to configure proxies in Playwright (Python and Node) and how to verify they work.

## Problem → Cause → Solution

| Problem | Cause | Solution |
|---------|-------|----------|
| Blocks from server | Datacenter IP flagged | Use residential proxy |
| CAPTCHA on protected sites | IP reputation low | Rotating residential proxy |
| Wrong geo / localized content | Exit IP in wrong country | Geo-targeted proxy (e.g. US, DE) |
| Proxy not used | Misconfiguration | Pass proxy at launch; verify with ipify |

## Proxy at Launch (Python)

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        proxy={
            "server": "http://gateway.example.com:8001",
            "username": "your_user",
            "password": "your_pass"
        }
    )
    page = browser.new_page()
    page.goto("https://api.ipify.org")
    print(page.content())  # Should show proxy IP
    browser.close()
```

With rotating residential proxies, the gateway rotates the IP per request or per session depending on provider. Use the same `proxy` dict for each browser; no code change per IP.

## Proxy at Launch (Node)

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    proxy: {
      server: 'http://gateway.example.com:8001',
      username: 'your_user',
      password: 'your_pass'
    }
  });
  const page = await browser.newPage();
  await page.goto('https://api.ipify.org');
  console.log(await page.content());
  await browser.close();
})();
```

## Per-Context Proxy (Advanced)

If your provider supports different endpoints per context, you can assign a different proxy to each context for maximum IP diversity:

```python
browser = await p.chromium.launch(headless=True)
ctx1 = await browser.new_context(proxy=proxy_config_1)
ctx2 = await browser.new_context(proxy=proxy_config_2)
```

## Verification

1. Run the ipify script above; confirm output shows the proxy exit IP.
2. Check geo: use a geo-IP service or target a geo-specific page.
3. Run against a test URL that returns headers; ensure `X-Forwarded-For` or similar reflects proxy IP when applicable.

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `Target closed` / connection reset | Proxy unreachable or auth wrong | Verify host, port, credentials; test with curl |
| Still seeing server IP | Proxy not passed to launch | Pass `proxy` to `launch()`, not `new_context` |
| Slow first response | Proxy cold start | Normal; subsequent requests faster |
| 407 Proxy Auth Required | Bad credentials | Check username/password; some providers use token in URL |

## Further Reading

- [Using proxies with Playwright](/en/blog/using-proxies-playwright)
- [Bypass Cloudflare for web scraping](/en/blog/bypass-cloudflare-web-scraping)
- [Proxy rotation strategies](/en/blog/proxy-rotation-strategies)
