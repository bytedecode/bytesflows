---
title: "Using Proxies with Playwright - Configuration Guide (2026)"
slug: "using-proxies-playwright"
summary: "Advanced 2026 guide to Playwright proxy integration. Master the configuration of rotating residential IPs across Python and Node.js environments for high-performance browser automation."
category: "AI & Automation"
tags: ["Browser automation", "Playwright", "Residential Proxy"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2000"
---

## Using Proxies with Playwright

Playwright supports HTTP and SOCKS proxies at launch. You pass a `proxy` object with `server`, and optionally `username` and `password` for authenticated proxies. For scraping at scale, use a rotating residential proxy gateway so each browser (or context) gets a different IP. This guide covers configuration, per-browser vs per-context, and handling failures.

---

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

With a rotating residential proxy provider, set `server` to the provider's gateway (e.g. `http://gateway.bytesflows.com:8001`). Each new browser or context typically gets a new IP from the rotation. Credentials can go in the URL (`http://user:pass@gateway:port`) or as separate `username` and `password` keys.

**Common mistake:** Don't put credentials inside `server` if you're also passing `username` and `password`. Use one or the other.

---

## Per-Browser vs Per-Context

**Per-browser:** One proxy for all pages in that browser. Simple. Good when you want one IP for a whole session (e.g. a login flow or multi-step scrape).

**Per-context:** Different proxies for different browser contexts. Use when you want parallel scraping with different IPs. In Playwright, you can create multiple contexts; depending on your setup, each can use a different proxy. For most residential gateways, each new browser gets a new IP automatically, so a simple pattern is: one browser per task, each task gets its own IP.

---

## Best Practices

**Use residential proxies for strict targets.** Datacenter IPs are often pre-flagged. Residential IPs pass anti-bot checks far more often, especially with Playwright's real browser.

**Rotate when needed.** For independent requests (product pages, search results), use a new browser per batch so each gets a new IP. For login or session flows, use sticky sessions so the same IP persists.

**Handle failures.** On 403, timeout, or CAPTCHA, close the browser and retry with a new one (new IP). Don't retry the same IP immediately. Implement exponential backoff: wait 1s, then 2s, then 4s before retrying.

**Verify before scaling.** Use an IP check URL (e.g. `https://api.ipify.org`) through your proxy to confirm exit IP and region. Test on a real target URL before increasing concurrency.

---

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

With a rotating residential gateway, each new `browser` or `context` gets a new exit IP. Structure your code so each scrape task uses its own browser when you need rotation.

---

## Handling Proxy Failures

Proxies can be slow, offline, or blocked by the target. In Playwright, a failed request will throw or return an error. Best practice:

1. **Catch errors** — Wrap `page.goto()` and other calls in try/except (Python) or try/catch (Node).
2. **Retry with new proxy** — Close the browser and launch a new one. With a rotating gateway, that gives you a new IP.
3. **Back off on repeated failure** — If the same URL fails 3 times with different IPs, pause before retrying. Use exponential backoff.
4. **For Cloudflare or CAPTCHA** — Ensure you're using residential proxies and a real browser. Add delays and realistic viewports. If blocks persist, reduce concurrency.

---

## Environment Variables

Some providers support proxy via environment variables (e.g. `HTTP_PROXY`, `HTTPS_PROXY`). Playwright can pick these up in some configurations. For explicit control and reproducibility, passing `proxy` in code is usually better. It avoids env conflicts and makes rotation behavior clear. Store credentials in env vars for security, but pass them to `launch()` explicitly:

```python
import os
proxy = {
    "server": os.environ["PROXY_SERVER"],
    "username": os.environ["PROXY_USER"],
    "password": os.environ["PROXY_PASS"],
}
browser = p.chromium.launch(proxy=proxy)
```

---

## Summary

- Pass `proxy` with `server` and credentials to `browser.launch()`.
- Each new browser gets a new IP with a rotating gateway.
- Use residential proxies for strict targets; handle failures with retry and backoff.
- Verify exit IP before scaling.

---

**Further reading:** [Playwright Proxy Setup](/en/blog/playwright-proxy-setup) · [Bypass Cloudflare Web Scraping](/en/blog/bypass-cloudflare-web-scraping) · [Avoid IP Bans in Web Scraping](/en/blog/avoid-ip-bans-web-scraping)
