---
title: "Avoid IP Bans in Automation"
slug: "avoid-ip-bans-automation"
summary: "Prevent IP bans in browser automation and web scraping: proxy rotation, anti-detection, and best practices for Playwright and Puppeteer in 2026."
category: "Anti-Bot & Security"
tags: ["IP bans", "Automation", "Proxy", "Web scraping", "Anti-detection"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=2000"
---

## Avoid IP Bans in Automation

IP bans are the main reason automation stops working. You start getting 403s, CAPTCHAs, or timeouts, and your scraper or bot becomes unusable. This guide explains *why* sites ban IPs and *what you can do* to avoid it—without just pointing you to other articles.

---

## Why Sites Ban IPs

Sites don’t ban IPs at random. They use signals to decide whether traffic is human or automated.

**1. Request volume and rate.** One IP making 100 requests per minute looks like a bot. Rate limiters and WAFs will throttle or block it.

**2. IP reputation.** Datacenter IP ranges (AWS, GCP, DigitalOcean, etc.) are widely known. Many anti-bot systems treat them as likely automation and apply stricter rules. Residential IPs—from real home or mobile connections—usually get more lenient treatment.

**3. Request patterns.** Bots tend to have very regular timing: exactly 2 seconds between requests, or bursts of 10 at once. Humans are messier. Predictable patterns trigger heuristics.

**4. Technical fingerprinting.** Beyond the IP, sites can check TLS fingerprints, HTTP/2 behavior, and JavaScript signals (e.g. `navigator.webdriver`). If these don’t match a normal browser, the IP can still get flagged even with low volume.

Understanding this helps you prioritize: spread load across IPs, use residential when possible, and make your traffic look less robotic.

---

## Five Practical Mitigations

### 1. Rotate IPs

Don’t send all traffic from one IP. Use a rotating proxy so each browser instance, context, or batch of requests uses a different exit IP. That way, even if one IP gets limited, others keep working.

**Practical rule:** For scraping, aim for roughly 1–5 requests per IP per minute on strict targets. More IPs = more throughput without hitting per-IP limits.

### 2. Prefer Residential Proxies for Strict Targets

Residential proxies route through real ISP-assigned IPs. They cost more than datacenter proxies but often pass anti-bot checks that datacenter IPs fail. For Cloudflare-protected sites, e‑commerce, or social platforms, residential is usually the safer choice.

### 3. Add Random Delays

Replace fixed delays with random ones. Instead of `time.sleep(2)` every time, use `time.sleep(random.uniform(1.5, 4.0))` or similar. Small jitter makes timing less regular and reduces pattern-based detection.

### 4. Cap Concurrency per Domain

Running 50 parallel browsers against the same domain from one proxy pool will still look like a coordinated attack. Start with 3–5 concurrent workers per domain and only increase if success rates stay high. Monitor block rates and back off when they rise.

### 5. Keep Browser Fingerprints Consistent

If you’re using Playwright or Puppeteer, the browser already provides a mostly realistic fingerprint. But inconsistent viewport sizes, missing or odd headers, or mismatched user-agent vs. actual behavior can trigger checks. Use realistic viewports (e.g. 1920×1080) and consistent user agents that match the browser you’re driving.

---

## Example: Playwright with Rotating Proxies

```python
import random
from playwright.sync_api import sync_playwright

PROXY = "http://user:pass@p1.bytesflows.com:port"

def scrape_one(url):
    with sync_playwright() as p:
        browser = p.chromium.launch(proxy={"server": PROXY})
        page = browser.new_page()
        page.set_viewport_size({"width": 1920, "height": 1080})
        page.goto(url)
        page.wait_for_timeout(random.randint(2000, 5000))  # random delay
        content = page.content()
        browser.close()
    return content

# Process URLs one by one = new IP per URL
for url in urls:
    data = scrape_one(url)
    # store, process, etc.
```

Each `scrape_one` call starts a new browser, so with a rotating gateway you get a new IP each time. The random delay and viewport help reduce pattern detection.

---

## When to Use Sticky Sessions

Rotating is great for independent requests. But for login flows, multi-step checkouts, or anything that depends on session cookies, you need the *same* IP for the whole flow. If the IP changes mid-session, the site may invalidate the session.

Most residential proxy providers support "sticky" sessions: the same IP for a configurable duration (e.g. 10–30 minutes). You typically pass a session ID in the username or a custom parameter. Check your provider’s documentation for the exact format.

---

## What to Do When You’re Already Banned

If an IP is already banned:

1. **Stop using it.** If you’re on a rotating pool, the next request will usually get a different IP. Don’t retry the same IP immediately.
2. **Increase delays.** You may have been going too fast. Add more jitter before retrying.
3. **Lower concurrency.** Reduce parallel workers for that domain.
4. **Verify proxy quality.** Some proxy providers have poor IP reputation. Try a different provider or pool if blocks persist.

---

## Summary

To avoid IP bans in automation:

- **Distribute load** across many IPs via rotation.
- **Use residential proxies** for strict, anti-bot–protected targets.
- **Add random delays** and **cap concurrency** per domain.
- **Keep fingerprints consistent** (viewport, user-agent, behavior).
- **Use sticky sessions** for login and multi-step flows.

These measures won’t eliminate all risk, but they significantly reduce how often you hit blocks. Start conservative (fewer concurrent workers, longer delays) and scale up only when success rates stay high.

👉 **Try BytesFlows Residential Proxies** — rotating residential IPs with session control and high success rates.

---

**Further reading:** [Proxy Rotation Strategies](/en/blog/proxy-rotation-strategies) · [How Websites Detect Scrapers](/en/blog/how-websites-detect-scrapers) · [Scrape Websites Without Getting Blocked](/en/blog/scrape-websites-without-getting-blocked)
