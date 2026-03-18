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

Rotating residential proxies send each request (or each browser session) through a different residential IP. Combined with Playwright's real browser, they are one of the most effective ways to scrape protected sites at scale. This guide explains what rotation means in practice, when to use it vs. sticky sessions, how to integrate it with Playwright, and how to troubleshoot when things go wrong.

---

## A Scenario: Why Rotation Matters

You're scraping 1,000 product pages from an e-commerce site. Without proxies, you hit 403 after 30–50 requests. The site rate-limits by IP. You add a single proxy—better, but after 100 requests from that one IP you're blocked again.

With rotating residential proxies, each new browser gets a new IP. Request 1 exits from IP A, request 2 from IP B, and so on. No single IP handles more than one request. The site sees traffic spread across hundreds of addresses, each behaving like a normal user. You complete 1,000 requests with a 95%+ success rate. The difference is rotation: many IPs instead of one.

---

## What "Rotating Residential" Means

**Residential** means the IPs come from real Internet Service Providers—the same ranges used by home and mobile users. Anti-bot systems treat these more leniently than datacenter IPs (AWS, GCP, etc.), which are often pre-flagged. On Cloudflare, e-commerce, and SERP targets, residential IPs pass far more often than datacenter.

**Rotating** means you don't keep the same IP. Each new browser launch gets a different exit IP from the provider's pool. The provider handles assignment—you just connect to their gateway. Your code doesn't manage a list of IPs; it opens a browser, and the gateway assigns one automatically.

---

## Why Playwright + Rotating Residential Works

Playwright drives a real Chromium instance. It has realistic TLS fingerprints, runs JavaScript, and handles cookies like a normal browser. Many sites that block `requests` or curl will allow Playwright—*if* the IP looks legitimate.

The bottleneck is usually the IP. A datacenter IP + Playwright still often triggers challenges. A residential IP + Playwright passes far more often. Rotating ensures no single IP is overused. So: Playwright (real browser) + residential (good IP) + rotation (spread load) = one of the most reliable stacks for protected sites.

---

## How to Configure Rotating Proxies in Playwright

Most residential providers give you a gateway URL. Every connection gets an IP from their pool. You don't manage rotation—the provider does it.

```python
from playwright.sync_api import sync_playwright

PROXY = "http://username:password@gateway.example.com:8001"

with sync_playwright() as p:
    browser = p.chromium.launch(proxy={"server": PROXY})
    page = browser.new_page()
    page.goto("https://example.com")
    # ... your logic
```

**Critical point:** Each new `browser` instance gets a new IP. So the pattern is: open browser → do work → close browser. Next time you open a browser, you get a fresh IP. Structure your code so each scrape task uses its own browser when you need rotation.

---

## Rotating vs. Sticky: When to Use Which

**Rotating (new IP every time)** — Best for independent requests: product pages, SERP, broad crawling. Each request is isolated. You want to minimize requests per IP. Rotation does that automatically.

**Sticky (same IP for a time window)** — Required when you need session continuity. Examples: login flows, multi-step checkouts, account-based automation. If the IP changes mid-session, the site may invalidate cookies or require re-auth.

**Decision flow:** Does your task involve login, checkout, or multi-step flows that depend on cookies? → Use sticky. Otherwise → Use rotating.

Most providers support sticky via a session ID in the username, e.g. `user-session-abc123`. All requests with that session ID use the same IP for 10–30 minutes. Check your provider's docs for the exact format.

---

## Complete Scraping Pattern with Rotation

```python
import random
from playwright.sync_api import sync_playwright

PROXY = "http://user:pass@gateway.example.com:8001"

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

for url in url_list:
    data = scrape_url(url)
```

Each `scrape_url()` call = new browser = new IP. The viewport and random delay reduce pattern-based detection. For 100 URLs, you get up to 100 different IPs (or fewer if the provider reuses—either way, load is spread).

---

## Anti-Detection When Using Rotation

Rotation alone isn't enough. You still need to avoid obvious bot behavior:

**1. Add random delays** — Between navigations and clicks. Use `random.randint(2000, 5000)` (ms), not fixed 1-second delays. Fixed timing is a red flag.

**2. Use realistic viewports** — 1920×1080 or similar. Odd or tiny sizes can trigger checks. Match viewport to your user-agent (desktop UA = desktop viewport).

**3. Cap concurrency per domain** — Even with 1000 IPs, 50 parallel browsers against the same site looks coordinated. Start with 3–5 workers per domain. Increase only if success rate stays high.

**4. Don't burst** — Spreading 100 requests over 10 minutes is safer than 100 requests in 10 seconds. Add jitter between batches.

---

## Verifying Your Setup

Before scaling, confirm rotation works:

```python
# Run this a few times - you should see different IPs
with sync_playwright() as p:
    browser = p.chromium.launch(proxy={"server": PROXY})
    page = browser.new_page()
    page.goto("https://api.ipify.org?format=json")
    print(page.content())
    browser.close()
```

If you see the same IP every time, check whether you're reusing the same browser or whether your provider uses sticky by default. If you see your server's IP, the proxy isn't applied—verify the gateway URL and credentials.

---

## Troubleshooting

**"I'm still getting blocked"** — Verify residential (not datacenter) proxies. Increase delays and reduce concurrency. Some targets are very strict; you may need higher-quality proxy tiers or slower throughput.

**"Sometimes it works, sometimes it doesn't"** — Normal with rotation. Some IPs in the pool have lower reputation. Implement retries: on failure, close browser and retry with a new one (new IP). Add exponential backoff (1s, 2s, 4s) between retries.

**"Session is lost mid-flow"** — You're using rotating when you need sticky. For login or multi-step flows, switch to sticky. Add session ID to proxy username per your provider's format.

**"All requests show same IP"** — You may be reusing the same browser. Ensure each task opens a new browser. If using a connection pool or long-lived browser, that prevents rotation. Each scrape = new `launch()`.

---

## Summary

- Rotating = new IP per browser. Each `launch()` with a rotating gateway gets a fresh IP.
- Use rotating for independent scraping; use sticky for login or session-dependent flows.
- Combine rotation with delays, realistic viewports, and concurrency limits.
- Verify with an IP check that you're getting different IPs before scaling.

---

**Further reading:** [Playwright Proxy Setup](/en/blog/playwright-proxy-setup) · [Bypass Cloudflare Web Scraping](/en/blog/bypass-cloudflare-web-scraping) · [Avoid IP Bans in Web Scraping](/en/blog/avoid-ip-bans-web-scraping)
