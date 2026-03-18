---
title: "Playwright Proxy Setup Guide (2026)"
slug: "playwright-proxy-setup"
summary: "Complete guide to Playwright proxy setup in 2026: configure rotating residential proxies, optimize anti-detection, and apply real-world scaling strategies for web automation."
category: "AI & Automation"
tags: ["Playwright", "Proxy setup", "Residential proxy", "Web scraping", "Browser automation"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2000"
---

## Playwright Proxy Setup Guide (2026)

Playwright is excellent for browser automation and web scraping—it drives real browsers, handles JavaScript-heavy pages, and gives you full control over the browsing session. But if you run it without proxies, most target sites will block you quickly: one server IP sending hundreds of requests looks like a bot.

This guide walks you through configuring proxies in Playwright, choosing the right rotation strategy, and adding anti-detection measures so your automation runs reliably.

---

## Why Proxies Are Essential for Playwright

When Playwright runs on your server, all traffic exits from that server’s IP. Targets see:

- A single IP making many requests in short order
- Requests coming from a datacenter range (easily flagged)
- Request patterns that don’t match normal human browsing

Result: rate limits, 403 errors, CAPTCHA challenges, or temporary IP bans.

Proxies solve this by routing traffic through different IPs. Residential proxies (IPs from real ISPs) look like normal users and typically pass anti-bot checks far better than datacenter IPs. With a rotating residential proxy, each browser or context can use a different IP, spreading the load and reducing block risk.

---

## Step 1: Basic Proxy Configuration

Playwright accepts a `proxy` object at browser launch. The minimal form:

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(
        proxy={
            "server": "http://proxy.example.com:8080",
            "username": "your_username",
            "password": "your_password"
        }
    )
    page = browser.new_page()
    page.goto("https://example.com")
    # ... your automation logic
```

**Format:** `proxy.server` can be `http://host:port` or `socks5://host:port`. If your provider uses URL auth, you can pass credentials in the URL: `http://user:pass@gateway.example.com:8001`.

**Common mistake:** Don’t put credentials in `proxy.server`. Use `username` and `password` keys, or a properly formatted URL.

---

## Step 2: Per-Browser vs Per-Context Proxy

**Per-browser:** One proxy for all pages in that browser instance. Simple, good when you want one IP for the whole session (e.g. a login flow).

**Per-context:** Different proxies for different browser contexts. Use this when you want to parallelize scraping with different IPs. In Playwright, create multiple contexts and (depending on your setup) launch separate browsers or use provider-specific features to assign different proxies per context.

For a rotating gateway like BytesFlows, each new browser instance usually gets a new IP. So a simple pattern is:

```python
# Each browser = new IP from the rotating pool
for url in url_list:
    with sync_playwright() as p:
        browser = p.chromium.launch(proxy={"server": "http://user:pass@p1.bytesflows.com:port"})
        page = browser.new_page()
        page.goto(url)
        data = page.content()
        # ... extract, store, then browser closes
```

Each loop gets a fresh browser and thus a fresh IP from the rotation.

---

## Step 3: Rotation Strategy—When to Rotate vs Stick

**Rotating (new IP per request):** Best for broad crawling, product scraping, SERP collection—anything where each request is independent. Fewer requests per IP means lower ban risk.

**Sticky (same IP for a time window):** Essential for login flows, multi-step checkouts, or account-based automation. If the IP changes mid-session, the site may invalidate the session.

Most residential proxy providers support both. Sticky is usually controlled by a session ID in the username (e.g. `user-session-abc123`). Check your provider’s docs for the exact format.

---

## Step 4: Anti-Detection Basics

Proxies alone aren’t enough. You also need to reduce detection signals:

**1. Add delays.** Use `import random` and `page.wait_for_timeout(random.randint(2000, 5000))` between major actions. Fixed 1-second delays look robotic.

**2. Use realistic viewports.** Set `viewport={"width": 1920, "height": 1080}` or similar. Tiny viewports or odd dimensions can trigger checks.

**3. Avoid obvious automation flags.** Playwright’s default Chromium is already closer to a real browser than `requests`, but some sites check `navigator.webdriver`. Consider a stealth plugin if you hit persistent blocks.

**4. Cap concurrency.** Don’t open 100 browsers at once to the same domain. Start with 3–5 parallel workers and increase only if success rate stays high.

---

## Step 5: Verify Your Setup

Before scaling, confirm the proxy works and you’re exiting through the expected IP:

```python
with sync_playwright() as p:
    browser = p.chromium.launch(proxy={"server": "http://user:pass@gateway.example.com:port"})
    page = browser.new_page()
    page.goto("https://api.ipify.org?format=json")
    print(page.content())  # Should show your proxy’s exit IP
    browser.close()
```

If you see your server’s own IP, the proxy isn’t applied. Double-check the server URL, credentials, and that your environment can reach the proxy.

---

## Troubleshooting

**Connection refused / timeout:** Verify the proxy host and port, that credentials are correct, and that your server has outbound access to the proxy. Some providers use different ports for HTTP vs SOCKS.

**Still getting blocked:** Increase delays, reduce concurrency, and ensure you’re using residential (not datacenter) proxies for strict targets. Check whether the site uses Cloudflare or similar—those often need residential IPs plus realistic browser behavior.

**CAPTCHA appearing:** Usually means rate or pattern detection. Slow down, add more jitter, and consider a higher-quality proxy pool.

---

## Summary

1. Add a `proxy` dict to `browser.launch()` with server and credentials.
2. Use rotating proxies for independent requests; use sticky sessions for login or multi-step flows.
3. Add random delays, realistic viewports, and concurrency limits.
4. Verify with an IP check page before scaling.

With this setup, Playwright plus residential proxies can handle high-volume scraping with much lower block rates than running without proxies.

👉 **Try BytesFlows Residential Proxies** — rotating residential IPs with session control, suitable for Playwright automation.

---

**Further reading:** [Using Proxies with Playwright](/en/blog/using-proxies-playwright) · [Bypass Cloudflare Web Scraping](/en/blog/bypass-cloudflare-web-scraping) · [Avoid IP Bans in Web Scraping](/en/blog/avoid-ip-bans-web-scraping)
