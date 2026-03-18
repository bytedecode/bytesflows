---
title: "Bypass Cloudflare with Playwright"
slug: "bypass-cloudflare-playwright"
summary: "Learn how to bypass Cloudflare detection using Playwright and residential proxies in 2026. Proxy setup, stealth techniques, and anti-bot best practices."
category: "Anti-Bot & Security"
tags: ["Cloudflare", "Cloudflare bypass", "Playwright", "Residential proxy", "Web scraping"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=2000"
---

## Bypass Cloudflare with Playwright

Cloudflare protects millions of sites. When you hit a Cloudflare-protected page, you may see "Checking your browser" or get a 403 before the real content loads. This guide explains why Cloudflare blocks automation and how to pass it using Playwright plus residential proxies.

---

## Why Cloudflare Blocks You

Cloudflare doesn’t just look at your User-Agent. It uses several layers:

**1. IP reputation.** Datacenter IPs (AWS, GCP, DigitalOcean, etc.) are widely known. Cloudflare applies stricter rules to them. Residential IPs—from real ISPs—usually get more lenient treatment and often bypass the JavaScript challenge entirely for high-trust IPs.

**2. TLS fingerprinting.** The way your client (Python requests, Node’s https, etc.) performs the SSL handshake has a distinct "fingerprint." Scripts and non-browser clients have fingerprints that scream "automation." Playwright uses a real Chromium, so its TLS fingerprint matches normal Chrome.

**3. JavaScript challenges.** Cloudflare sometimes runs JS to verify the client is a real browser—checking canvas, WebGL, or timing. Headless browsers can pass these if they’re configured correctly; raw HTTP libraries cannot.

**4. Request patterns.** Too many requests too fast, or very regular timing, trigger rate limits and challenges.

So: you need a real browser (Playwright) + a good IP (residential proxy) + reasonable behavior (delays, no bursts).

---

## The Two Essentials: Real Browser + Residential Proxy

**Real browser:** `requests`, `aiohttp`, and similar libraries use non-browser TLS and cannot execute Cloudflare’s JS challenges. Playwright drives Chromium, so it looks like a real user at the network and JS layers.

**Residential proxy:** Even with Playwright, a datacenter IP often gets challenged or blocked. Residential IPs pass Cloudflare far more reliably. Use a rotating residential proxy so each session gets a clean IP.

---

## Step-by-Step Setup

### 1. Configure the Proxy

```python
from playwright.sync_api import sync_playwright

PROXY = "http://user:pass@p1.bytesflows.com:8001"

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        proxy={"server": PROXY}
    )
    page = browser.new_page()
    page.goto("https://protected-site.com")
    # ... wait and extract
```

### 2. Wait for the "Checking your browser" Page

Cloudflare’s challenge can take 2–10 seconds. Don’t assume `page.goto()` means you’re done. Wait for the actual content:

```python
page.goto("https://protected-site.com")
page.wait_for_load_state("networkidle")  # wait for JS to settle
page.wait_for_timeout(3000)  # extra buffer for Cloudflare challenge
# Now extract
```

### 3. Add Random Delays

Before scaling, add jitter. Fixed delays look robotic:

```python
import random
page.wait_for_timeout(random.randint(2000, 6000))
```

---

## Optional: Stealth and Fingerprint Hardening

Playwright’s default Chromium is already close to a real browser, but some sites check `navigator.webdriver`. If you still get blocked with correct proxy + wait logic, consider:

- **playwright-stealth** or similar plugins that patch common automation leaks
- Consistent viewport and user-agent (avoid mismatches)
- Slower, more human-like interaction (scroll, hover before click)

For many targets, proxy + correct wait logic is enough. Add stealth only if you hit persistent blocks.

---

## What to Avoid

- **Don’t use `requests` or `httpx` for Cloudflare sites.** They can’t run the JS challenge.
- **Don’t use datacenter proxies for strict targets.** Residential is usually required.
- **Don’t assume instant load.** Always wait for `networkidle` and add a buffer.
- **Don’t blast requests.** Cap concurrency and add delays.

---

## Troubleshooting

**Still seeing "Checking your browser" forever:** The IP may be low-reputation or the site may use heavier Enterprise/Bot Management. Try a different proxy provider or tier. Ensure you’re waiting long enough (some challenges take 5–10 seconds).

**403 after passing the challenge:** Possible rate limit or pattern detection. Slow down, add more jitter, reduce parallel workers.

**Works sometimes, fails sometimes:** Normal with rotating IPs. Some IPs in the pool have lower reputation. Implement retries: on failure, close browser and retry with a new one (new IP).

---

## Summary

1. Use Playwright (real browser) + residential proxy. Both are needed.
2. Wait for `networkidle` and add a 2–5 second buffer for Cloudflare’s challenge.
3. Add random delays and cap concurrency.
4. Use residential, not datacenter, proxies for Cloudflare-protected targets.

👉 **Try BytesFlows Residential Proxies** — high-trust residential IPs for Cloudflare bypass.

---

**Further reading:** [Playwright Proxy Setup](/en/blog/playwright-proxy-setup) · [Avoid IP Bans in Web Scraping](/en/blog/avoid-ip-bans-web-scraping) · [How Websites Detect Scrapers](/en/blog/how-websites-detect-scrapers)
