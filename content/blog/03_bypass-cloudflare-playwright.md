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

Cloudflare protects millions of sites. When you hit a Cloudflare-protected page, you may see "Checking your browser" for several seconds, or get a 403 before the real content ever loads. This guide explains *why* Cloudflare blocks automation, *what* you need to pass it, and *how* to implement a working setup step by step. By the end, you'll have a concrete, runnable approach—not just theory.

---

## Why Cloudflare Blocks You

Cloudflare doesn't just look at your User-Agent. It uses several layers of detection. Understanding them helps you fix the right thing.

**1. IP reputation.** Cloudflare maintains reputation scores for IP ranges. Datacenter IPs (AWS, GCP, DigitalOcean, OVH, etc.) are widely known. Many are pre-flagged as high-risk. Residential IPs—from real ISPs used by homes and mobile users—usually get more lenient treatment. For high-trust residential IPs, Cloudflare often skips the JavaScript challenge entirely. For datacenter IPs, it often applies it every time or blocks outright.

**2. TLS fingerprinting.** The way your client performs the SSL/TLS handshake has a distinct "fingerprint." Python's `requests`, Node's `https`, curl, and similar produce fingerprints that differ from real Chrome or Firefox. Anti-bot systems can detect these. Playwright uses a real Chromium binary, so its TLS fingerprint matches normal Chrome. That's why `requests` + proxy usually fails on Cloudflare even with a residential IP—the TLS layer still looks like a script.

**3. JavaScript challenges.** Cloudflare sometimes runs JavaScript in the page to verify the client is a real browser. It may check canvas rendering, WebGL, timing, or other browser APIs. Scripts cannot execute JavaScript. Playwright can. So you need a real browser to pass this layer.

**4. Request patterns.** Even with a good IP and browser, too many requests too fast, or very regular timing (exactly 2 seconds between each), triggers rate limits and challenges. You need to add jitter and cap concurrency.

**Bottom line:** You need a real browser (Playwright) + a good IP (residential proxy) + reasonable behavior (delays, no bursts). Missing any one usually means failure.

---

## What You Need: Real Browser + Residential Proxy

**Real browser.** Libraries like `requests`, `aiohttp`, `httpx`, and curl use non-browser TLS and cannot execute Cloudflare's JS challenges. Playwright drives Chromium (or Firefox/WebKit), so it looks like a real user at both the network and JavaScript layers. There is no practical way to reliably bypass Cloudflare with `requests` alone for most protected sites.

**Residential proxy.** Even with Playwright, a datacenter IP often gets challenged or blocked. Cloudflare applies stricter rules to known datacenter ranges. Residential IPs pass far more reliably. Use a rotating residential proxy so each new browser session gets a fresh IP. That way, if one IP has lower reputation, the next request tries a different one.

---

## Step-by-Step Implementation

### Step 1: Configure the Proxy

Point Playwright at your provider's gateway. Replace with your actual credentials:

```python
from playwright.sync_api import sync_playwright

PROXY = "http://username:password@gateway.bytesflows.com:8001"

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        proxy={"server": PROXY}
    )
    page = browser.new_page()
    page.goto("https://protected-site.com")
    # We'll add wait logic next
```

**Format notes:** Use `http://` or `socks5://` for the server. Credentials can go in the URL (`user:pass@host:port`) or as separate `username` and `password` keys. Don't mix—use one or the other.

### Step 2: Wait for the "Checking your browser" Page

Cloudflare's challenge can take 2–10 seconds. Don't assume `page.goto()` returning means you're done. The page may still be running the challenge. Wait for the actual content:

```python
page.goto("https://protected-site.com", wait_until="networkidle")
page.wait_for_timeout(3000)  # Extra buffer - Cloudflare often needs 2-5 seconds
# Now the real content should be loaded. Extract here.
```

**Why `networkidle`:** It waits until the network is mostly idle (no pending requests for 500ms). Cloudflare's challenge makes requests; when they finish, the page usually loads. **Why the extra timeout:** Some challenges take 5–10 seconds. The 3-second buffer gives Cloudflare time to complete. If your target is very slow, increase to 5000 or 6000.

### Step 3: Add Random Delays

Before scaling, add jitter. Fixed delays (e.g. always 2 seconds) look robotic and can trigger pattern-based detection:

```python
import random
page.wait_for_timeout(random.randint(2000, 6000))
```

Use this *between* navigations or actions, not just after. When scraping multiple pages, wait a random 2–6 seconds before each `goto`.

### Step 4: Set a Realistic Viewport and Headers

Use a normal desktop viewport. Odd sizes (e.g. 800×600 or 1000×1) can trigger checks:

```python
context = browser.new_context(
    viewport={"width": 1920, "height": 1080},
    locale="en-US",
    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
page = context.new_page()
```

Keep user-agent and viewport consistent. Don't use a Chrome user-agent with a tiny viewport—mismatches are a red flag.

---

## Complete Working Example

Here's a full function you can adapt. It includes proxy, wait logic, delay, and basic error handling:

```python
from playwright.sync_api import sync_playwright
import random
import time

def scrape_cloudflare_protected(url, proxy_url, max_retries=2):
    """
    Scrape a Cloudflare-protected URL. Retries with new browser (new IP) on failure.
    """
    for attempt in range(max_retries):
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(
                    headless=True,
                    proxy={"server": proxy_url}
                )
                context = browser.new_context(
                    viewport={"width": 1920, "height": 1080},
                    locale="en-US"
                )
                page = context.new_page()
                
                time.sleep(random.uniform(2, 5))
                page.goto(url, wait_until="networkidle", timeout=30000)
                page.wait_for_timeout(random.randint(3000, 6000))
                
                html = page.content()
                browser.close()
                return html
                
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # 1s, 2s before retry
            else:
                raise
    return None
```

**Usage:** `html = scrape_cloudflare_protected("https://example.com", "http://user:pass@gateway:8001")`. Each retry gets a new browser and thus a new IP from your rotating proxy.

---

## Optional: Stealth and Fingerprint Hardening

Playwright's default Chromium is already close to a real browser. Most targets work with proxy + correct wait logic + delays. If you *still* get blocked:

- **playwright-stealth** or similar plugins patch `navigator.webdriver` and other common automation leaks. Install and apply before navigation.
- **Consistent fingerprint:** Use the same viewport, UA, and locale for all requests. Don't randomize these per request—sites expect consistency from a "user."
- **Slower interaction:** For flows that involve clicking or typing, add scroll, hover, or small delays between actions. Don't click through pages at machine speed.

Add stealth only if the basics (proxy + wait + delay) aren't enough. For many Cloudflare sites, they are.

---

## What to Avoid

- **Don't use `requests` or `httpx` for Cloudflare sites.** They cannot run the JS challenge. You will almost always fail.
- **Don't use datacenter proxies for strict targets.** Even with Playwright, datacenter IPs get challenged more often. Residential is the practical requirement.
- **Don't assume instant load.** Always wait for `networkidle` and add a 2–5 second buffer. Some challenges take up to 10 seconds.
- **Don't blast requests.** Cap concurrency (e.g. 3–5 parallel workers per domain). Add delays between requests. Burst traffic triggers rate limits regardless of IP quality.

---

## Troubleshooting

**"Checking your browser" forever / never finishes**  
The IP may have low reputation, or the site may use heavier Enterprise/Bot Management. Try a different proxy provider or tier. Ensure you're waiting long enough—increase the buffer to 5–10 seconds. Verify you're using residential, not datacenter.

**403 immediately or right after passing the challenge**  
Possible rate limit or pattern detection. Slow down: increase delays, reduce concurrent workers. Add more jitter. Check if you're reusing the same IP too often—with rotating, each browser should get a new IP.

**Works sometimes, fails sometimes**  
Normal with rotating IPs. Some IPs in the pool have lower reputation. Implement retries: on failure, close the browser and retry with a new one (new IP). Use exponential backoff between retries.

**Works locally, fails on server**  
Your server's IP may be different (e.g. datacenter). Ensure all traffic goes through the proxy. Verify with an IP check URL (e.g. `https://api.ipify.org`) that you're exiting through the proxy, not your server.

---

## Summary

1. **Use Playwright** (real browser) + **residential proxy** (good IP). Both are required.
2. **Wait for `networkidle`** and add a 2–5 second buffer for Cloudflare's challenge.
3. **Add random delays** between navigations and cap concurrency.
4. **Retry with new IP** on failure—close browser, launch new one, try again.
5. **Verify** with an IP check that you're using the proxy before debugging further.

---

**Further reading:** [Playwright Proxy Setup](/en/blog/playwright-proxy-setup) · [Avoid IP Bans in Web Scraping](/en/blog/avoid-ip-bans-web-scraping) · [How Websites Detect Scrapers](/en/blog/how-websites-detect-scrapers)
