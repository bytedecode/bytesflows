---
title: "Python Proxy Scraping Guide (2026)"
slug: "python-proxy-scraping-guide"
summary: "Complete 2026 guide to Python proxy scraping. Master residential IP integration in Requests, Scrapy, and Playwright to build undetectable Pythonic scrapers."
category: "Proxy Services"
tags: ["Python", "Residential Proxy", "Web Scraping"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=2000"
---

## Introduction: Python + Proxies for Reliable Scraping

Python is the default choice for web scraping. But scraping without proxies from a single IP leads to blocks. This guide shows how to integrate residential proxies with the main Python stacks: **requests**, **Scrapy**, and **Playwright**. You'll see working examples, when to use each, and how to avoid common mistakes.

---

## Choosing the Right Stack

| Target | Stack | Proxy needed |
|--------|-------|--------------|
| Static HTML, low protection | requests + BeautifulSoup | Optional for small scale |
| Static, high volume | Scrapy + rotating proxy | Yes, residential |
| JS-rendered, Cloudflare | Playwright + proxy | Yes, residential |
| APIs with rate limits | requests + proxy | Yes |

**Rule of thumb:** If the target has anti-bot protection or you scale beyond a few hundred requests, use residential proxies. For Cloudflare and similar, use Playwright—requests cannot run JS challenges.

---

## requests + Proxy

For simple HTTP pages, `requests` with a proxy is enough.

```python
import requests
proxies = {
    "http": "http://user:pass@p1.example.com:8001",
    "https": "http://user:pass@p1.example.com:8001"
}
r = requests.get("https://target.com", proxies=proxies, timeout=10)
print(r.status_code)
```

With a rotating gateway, each request typically uses a new IP. Add delays between requests: `time.sleep(random.uniform(2, 5))`.

**Limitation:** `requests` has a non-browser TLS fingerprint. Cloudflare and similar will block or challenge. Use Playwright for those targets.

---

## Scrapy + Proxy

Scrapy supports proxies via `REQUEST_META` or a custom middleware.

**Settings:**

```python
# settings.py
ROTATING_PROXY_LIST = [
    "http://user:pass@p1.example.com:8001"
]
DOWNLOADER_MIDDLEWARES = {
    'scrapy.downloadermiddlewares.httpproxy.HttpProxyMiddleware': 110,
}
```

**Per-request proxy (for rotating gateway):**

```python
def start_requests(self):
    for url in self.start_urls:
        yield scrapy.Request(url, meta={'proxy': 'http://user:pass@p1.example.com:8001'})
```

With a rotating gateway, the same proxy URL returns different exit IPs per request. Add `DOWNLOAD_DELAY` and `RANDOMIZE_DOWNLOAD_DELAY` to avoid fixed timing.

**Limitation:** Scrapy uses Twisted's HTTP client, not a browser. No JS execution. Use Playwright for JS-heavy or Cloudflare-protected sites.

---

## Playwright + Proxy

For JS-rendered pages and anti-bot sites, Playwright with a proxy is the standard approach.

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(proxy={
        "server": "http://p1.example.com:8001",
        "username": "user", "password": "pass"
    })
    page = browser.new_page()
    page.goto("https://target.com", wait_until="networkidle")
    page.wait_for_timeout(3000)
    content = page.content()
    browser.close()
```

Use a realistic viewport (1920×1080) and User-Agent. For Cloudflare, add a 2–5 second wait after `goto`.

---

## Best Practices

1. **Use env vars for credentials.** Store proxy user/pass in `os.environ`, not in code.
2. **Add randomized delays.** `time.sleep(random.uniform(2, 6))` between requests.
3. **Handle failures.** On 403/429, retry with a new browser or session (new IP). Use exponential backoff.
4. **Monitor success rate.** If it drops below 90%, slow down or add proxy capacity.
5. **Sticky sessions when needed.** For login or checkout flows, use a session ID in the proxy username so the same IP is kept.

---

## Troubleshooting

**403 or block** — Switch to residential if on datacenter. For Cloudflare, use Playwright, not requests. Add more delays.

**Empty HTML** — Page is JS-rendered. Use Playwright. Wait for `networkidle` or a specific selector before extracting.

**Proxy auth error** — Check username/password format. Some gateways use `user-session-xyz:pass` for sticky sessions.

---

## Summary

- **requests:** Simple HTTP, no JS. Add proxy for scale. Not for Cloudflare.
- **Scrapy:** High-volume static scraping. Configure proxy in settings or meta. Not for JS.
- **Playwright:** JS and anti-bot. Proxy in `launch()`. Use for Cloudflare and similar.

---

**Further reading:** [Using Proxies with Playwright](/en/blog/using-proxies-playwright) · [Proxy Rotation Strategies](/en/blog/proxy-rotation-strategies) · [Bypass Cloudflare for Web Scraping](/en/blog/bypass-cloudflare-web-scraping)
