---
title: "Rotating Residential Proxies with Playwright"
slug: "rotating-residential-proxies-playwright"
summary: "How to use rotating residential proxies with Playwright for web scraping: proxy optimization, anti-detection, and scaling strategies in 2026."
category: "AI & Automation"
tags: ["Rotating proxies", "Residential proxy", "Playwright", "Web scraping", "Proxy rotation"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=2000"
---

## Rotating Residential Proxies with Playwright

Rotating residential proxies send each request (or each browser session) through a different residential IP. Combined with Playwright’s real browser, they are one of the most effective ways to scrape protected sites at scale. This guide explains how rotation works, when to use it vs. sticky sessions, and how to integrate it with Playwright.

---

## What "Rotating Residential" Means

**Residential** means the IPs come from real Internet Service Providers—the same ranges used by home and mobile users. Anti-bot systems treat these more leniently than datacenter IPs (AWS, GCP, etc.), which are often pre-flagged as bots.

**Rotating** means you don’t keep the same IP. Each new browser launch, or each new context, gets a different exit IP from the provider’s pool. That spreads your traffic across many addresses, so no single IP hits rate limits or gets banned from overuse.

---

## Why This Works Well with Playwright

Playwright drives a real Chromium (or Firefox/WebKit) instance. It has realistic TLS fingerprints, runs JavaScript, and handles cookies and sessions like a normal browser. Many sites that block `requests` or curl will allow Playwright—*if* the IP looks legitimate.

The bottleneck is usually the IP. A datacenter IP + Playwright still often triggers checks. A residential IP + Playwright passes far more often. So the combination of rotating residential proxies + Playwright is very effective for Cloudflare-protected sites, e-commerce, SERP scraping, and similar targets.

---

## How to Configure Rotating Proxies in Playwright

Most residential proxy providers give you a gateway URL. Every connection to that gateway gets assigned an IP from their pool. You don’t manage rotation yourself—the provider does it.

```python
from playwright.sync_api import sync_playwright

PROXY_GATEWAY = "http://username:password@p1.bytesflows.com:8001"

with sync_playwright() as p:
    browser = p.chromium.launch(
        proxy={"server": PROXY_GATEWAY}
    )
    page = browser.new_page()
    page.goto("https://example.com")
    # ... your logic
```

**Important:** With a rotating gateway, each new `browser` instance typically gets a new IP. So a simple pattern is: open browser → do work → close browser. Next time you open a browser, you get a fresh IP.

---

## Rotating vs. Sticky: When to Use Which

**Rotating (new IP every time):** Best for independent requests—product scraping, SERP collection, broad crawling. Each request is isolated, so you want to minimize requests per IP. Rotation does that automatically.

**Sticky (same IP for a time window):** Required when you need session continuity. Examples: login flows, multi-step checkouts, account-based automation. If the IP changes mid-session, the site may invalidate cookies or require re-auth.

Most providers support sticky via a session ID. You add it to the username, e.g. `user-session-abc123`. All requests with that session ID use the same IP for 10–30 minutes (varies by provider). Check your provider’s docs for the exact format.

---

## Practical Rotation Pattern for Scraping

```python
import random
from playwright.sync_api import sync_playwright

PROXY = "http://user:pass@p1.bytesflows.com:8001"

def scrape_url(url):
    with sync_playwright() as p:
        browser = p.chromium.launch(proxy={"server": PROXY})
        page = browser.new_page()
        page.set_viewport_size({"width": 1920, "height": 1080})
        page.goto(url)
        page.wait_for_timeout(random.randint(2000, 5000))
        html = page.content()
        browser.close()
    return html

# Each call = new browser = new IP
for url in url_list:
    data = scrape_url(url)
    # process, store, etc.
```

Every `scrape_url()` call creates a new browser, so with a rotating gateway you get a new IP each time. The random delay and viewport help reduce pattern-based detection.

---

## Anti-Detection When Using Rotation

Rotation alone isn’t enough. You still need to avoid obvious bot behavior:

1. **Add random delays** between navigations and clicks. Fixed 1-second delays are a red flag.
2. **Use realistic viewports** (e.g. 1920×1080). Odd or tiny sizes can trigger checks.
3. **Cap concurrency** per domain. Even with 1000 IPs, hitting one site with 50 parallel browsers looks coordinated.
4. **Don’t burst.** Spreading requests over time is safer than 100 requests in 10 seconds.

---

## Troubleshooting

**"I'm still getting blocked"** — Verify you’re using residential (not datacenter) proxies. Increase delays and reduce concurrency. Some targets are very strict; you may need higher-quality proxy tiers.

**"Sometimes it works, sometimes it doesn’t"** — Normal with rotation. Some IPs in the pool may have lower reputation. Implement retries with a fresh browser (fresh IP) on failure.

**"Session is lost mid-flow"** — You might be using rotating mode when you need sticky. Switch to sticky for login or multi-step flows.

---

## Summary

- Rotating residential proxies assign a new IP per connection; Playwright gets a new IP with each new browser.
- Use rotating for independent scraping tasks; use sticky for login and session-dependent flows.
- Combine rotation with delays, realistic viewports, and concurrency limits.
- Each `browser.launch()` with a rotating gateway = new IP. Structure your code accordingly.

👉 **Try BytesFlows Residential Proxies** — rotating and sticky modes, high success rates for Playwright automation.

---

**Further reading:** [Playwright Proxy Setup](/en/blog/playwright-proxy-setup) · [Bypass Cloudflare Web Scraping](/en/blog/bypass-cloudflare-web-scraping) · [Avoid IP Bans in Web Scraping](/en/blog/avoid-ip-bans-web-scraping)
