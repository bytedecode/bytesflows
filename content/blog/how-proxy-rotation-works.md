---
title: "How Proxy Rotation Works for Web Scraping (2026)"
slug: "how-proxy-rotation-works"
summary: "Demystifying IP rotation for modern web scraping. Understand the technical difference between per-request and sticky sessions, and learn how to implement robust rotation gateways using residential proxy pools in 2026."
category: "Proxy Services"
tags: ["Ip rotation", "Proxy rotation", "Residential Proxy", "Rotating Proxy"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1620288627223-53302f4e8c74?auto=format&fit=crop&q=80&w=2000"
---

## Introduction: Why Rotation Matters

If you send 1,000 requests from one IP, you'll be blocked. **Proxy rotation** means routing requests through **different IPs** over time so no single IP gets too much traffic. A rotating residential proxy provider gives you a gateway: each request (or session) gets a new IP from their pool. That spreads load and reduces blocks. This guide explains how it works and when to use each mode.

---

## Per-Request vs Per-Session (Sticky)

### Per-request rotation

**What it is:** Every HTTP request uses a new IP. You connect to the same gateway (host:port); the provider assigns a different exit IP for each request.

**Best for:** Independent requests—SERP, product pages, search results, API calls. Each page or API call stands alone. No session state to preserve.

**Pros:** Maximum distribution. No single IP sees many requests. Hard to rate-limit.

**Cons:** Not suitable for flows that require cookies (login, checkout). Changing IP mid-session can invalidate the session.

### Per-session (sticky) rotation

**What it is:** The same IP is used for a time window (e.g. 5, 10, 30 minutes) or for a set of requests. You typically pass a session identifier (e.g. in the proxy username) so the gateway keeps you on one IP.

**Best for:** Multi-step flows—login, add to cart, checkout. Infinite-scroll pages. Anything that depends on cookies or server-side session state.

**Pros:** Maintains session. Essential when the site expects the same IP across several requests.

**Cons:** That IP sees more traffic. If the flow is long, the IP may still get rate-limited. Use sticky only when necessary.

---

## Decision Table: When to Use Which

| Use case | Rotation mode | Reason |
|----------|---------------|--------|
| SERP, product catalog | Per-request | Independent pages, no session |
| Login + scrape | Sticky | Session cookies |
| Add to cart, checkout | Sticky | Cart and session state |
| Infinite scroll | Sticky | Same page, multiple requests |
| API polling | Per-request or sticky | Depends on API session requirements |

---

## How the Gateway Works

You don't manage a list of IPs. You configure your HTTP client or browser to use the provider's **gateway** (host:port + auth). The gateway sits in front of a pool of residential IPs. For per-request mode, each outgoing request gets a new IP. For sticky mode, the gateway assigns an IP and keeps it for your session (based on username or session ID).

**Example (Python, per-request):**

```python
import requests
proxy = "http://user:pass@p1.example.com:8001"
proxies = {"http": proxy, "https": proxy}
r1 = requests.get("https://target.com/page1", proxies=proxies)
r2 = requests.get("https://target.com/page2", proxies=proxies)
# r1 and r2 typically use different exit IPs
```

**Example (Playwright, sticky session):**

```python
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch(proxy={
        "server": "http://p1.example.com:8001",
        "username": "user-session-abc123",
        "password": "pass"
    })
    page = browser.new_page()
    page.goto("https://target.com/login")
    # ... login, then scrape ... all same IP
```

The `session-abc123` in the username tells the gateway to keep the same IP for this browser session.

---

## Integration with Scrapers

Configure your HTTP client or browser to use the gateway. No need to fetch or manage IP lists. For Playwright, pass `proxy` to `chromium.launch()`. For `requests`, set `proxies` on the request or session. The gateway handles rotation.

---

## Troubleshooting

**All requests still from same IP** — Check if you're using sticky mode (session ID in username). For per-request, ensure you're not reusing a single requests.Session with connection pooling that might pin to one IP. Try a fresh request per URL.

**Session breaks mid-flow** — Sticky duration may have expired. Shorten the flow or request a longer sticky window from your provider.

**High block rate despite rotation** — Each IP may still get too many requests if concurrency is high. Reduce workers or add more proxy capacity. Add delays between requests.

---

## Summary

- **Per-request:** New IP every request. Use for independent pages.
- **Sticky:** Same IP for a session. Use for login, checkout, multi-step flows.
- **Gateway:** One endpoint, provider handles the pool. Configure proxy in your client and go.

---

**Further reading:** [Proxy Rotation Strategies](/en/blog/proxy-rotation-strategies) · [Rotating Proxies for Web Scraping](/en/blog/rotating-proxies-web-scraping) · [Avoid IP Bans in Web Scraping](/en/blog/avoid-ip-bans-web-scraping)
