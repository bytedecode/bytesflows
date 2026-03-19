---
title: "Using Proxies with Python Scrapers (2026)"
slug: "using-proxies-python-scrapers"
summary: "Integrate rotating residential proxies with Requests, Scrapy, and Playwright in Python. Bypass blocks and scale your scrapers reliably."
category: "Proxy Services"
tags: ["Proxy", "Python", "Residential Proxy", "Web Scraping"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=2000"
---

## Introduction: Why Proxies Matter in Python Scraping

Your Python scraper works locally. When you run it from a server or scale to hundreds of requests, the target site starts returning 403 or CAPTCHA. The reason is simple: too many requests from one IP. Proxies solve this by routing traffic through different IPs. **Rotating residential proxies** (IPs that look like home users) have the highest success rate on protected sites.

This guide shows how to add proxies to the main Python scraping stacks: Requests, Scrapy, and Playwright.

## Requests: Basic Proxy Setup

Pass a `proxies` dict to `requests.get()` or `requests.post()`:

```python
import requests

proxies = {
    "http": "http://user:pass@gateway.example.com:8080",
    "https": "http://user:pass@gateway.example.com:8080"
}

r = requests.get("https://target.com", proxies=proxies)
r.raise_for_status()
```

Use a `Session` to reuse connections and headers:

```python
session = requests.Session()
session.proxies.update(proxies)
session.headers["User-Agent"] = "Mozilla/5.0 ..."
r = session.get("https://target.com")
```

With a rotating gateway, each request (or each new session) can use a different exit IP. Combine with Beautiful Soup or lxml for parsing.

## Scrapy: Proxy Middleware

Scrapy supports proxies via middleware. Set the proxy URL in the request meta or use a middleware that reads from a pool:

```python
# In settings.py
ROTATING_PROXY_LIST = [
    "http://user:pass@gateway.example.com:8080",
]

# Or use a single rotating gateway
DOWNLOADER_MIDDLEWARES = {
    "scrapy.downloadermiddlewares.httpproxy.HttpProxyMiddleware": 110,
}

# In spider - set proxy per request
def start_requests(self):
    for url in self.start_urls:
        yield scrapy.Request(
            url,
            meta={"proxy": "http://user:pass@gateway.example.com:8080"}
        )
```

For rotating residential proxies, one gateway URL is usually enough; the provider handles rotation.

## Playwright: Browser Proxy Config

Pass proxy options when launching the browser:

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        proxy={
            "server": "http://gateway.example.com:8080",
            "username": "user",
            "password": "pass"
        }
    )
    page = browser.new_page()
    page.goto("https://target.com")
    print(page.title())
    browser.close()
```

Use Playwright when the target is JS-heavy or protected (Cloudflare, etc.). Residential proxies significantly improve pass rates.

## Decision: Which Client, Which Proxy Type

| Target type | Client | Proxy type |
|-------------|--------|------------|
| Static HTML | Requests | Datacenter or residential |
| Simple JS | Requests (if API calls) or Playwright | Residential recommended |
| Strict anti-bot (Amazon, LinkedIn) | Playwright | Residential required |
| High volume, many domains | Scrapy + gateway | Rotating residential |

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `407 Proxy Authentication Required` | Wrong username/password | Verify credentials; check for special chars (URL-encode if needed) |
| Connection timeout to proxy | Gateway unreachable or overloaded | Check provider status; try different endpoint |
| Still getting blocked | Datacenter proxy or high rate | Switch to residential; reduce concurrency per IP |
| Playwright proxy not used | Config in wrong place | Proxy must be in `browser.launch()`, not per-page |

## Verification

1. Run a test script that fetches a "what is my IP" page through the proxy; confirm the IP matches the expected region.
2. Scrape a few known-good URLs and verify status 200 and expected content.
3. Gradually increase concurrency while monitoring success rate; back off if blocks rise.

## Further reading

- [Python proxy scraping guide](/en/blog/python-proxy-scraping-guide)
- [Proxy rotation strategies](/en/blog/proxy-rotation-strategies)
- [Using proxies with Playwright](/en/blog/using-proxies-playwright)
