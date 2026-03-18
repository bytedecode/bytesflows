---
title: "Scraping Search Results with Python (2026)"
slug: "scraping-search-results-python"
summary: "2026 guide to scraping SERP data with Python. Learn to capture high-value search engine results using advanced request headers and rotating residential IP addresses."
category: "Web Scraping"
tags: ["Python", "Web Scraping"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&q=80&w=2000"
---

## Introduction: The SERP Data Gold Mine

Search engine results pages (SERPs) contain rich data: organic rankings, featured snippets, ads, and local pack. Scraping them helps with SEO, competitor analysis, and market research. But Google and Bing aggressively block automated access. This guide covers the challenges, when to use HTTP vs browser, and how to implement reliable SERP scraping with Python.

---

## Why SERP Scraping Is Hard

Search engines use strong anti-bot measures:

- **IP reputation** — Datacenter IPs are often blocked or heavily rate-limited. Residential IPs pass more often.
- **TLS fingerprint** — Python's `requests` and `httpx` have non-browser signatures. Google can detect them. For strict targets, a real browser (Playwright) is required.
- **Behavior** — Too many requests from one IP, or fixed timing, triggers blocks. Rotate IPs and add randomized delays.

**Decision:** For small volumes or non-Google (e.g. DuckDuckGo, Bing with low protection), `requests` + proxy may work. For Google at scale, use Playwright + residential proxies.

---

## Option 1: requests + Proxy (Simple SERPs)

For less protected engines or low volume:

```python
import requests
proxies = {"http": "http://user:pass@p1.example.com:8001", "https": "http://user:pass@p1.example.com:8001"}
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36"}
r = requests.get("https://duckduckgo.com/html/?q=web+scraping", proxies=proxies, headers=headers)
# Parse r.text for results
```

Use a rotating residential proxy. Add `time.sleep(random.uniform(2, 6))` between requests. Expect blocks on Google with this approach.

---

## Option 2: Playwright + Proxy (Google, Strict Targets)

For Google or high volume, use a real browser:

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(proxy={"server": "http://p1.example.com:8001", "username": "user", "password": "pass"})
    page = browser.new_page()
    page.goto("https://www.google.com/search?q=web+scraping", wait_until="networkidle")
    page.wait_for_timeout(3000)
    results = page.locator(".g").all_inner_texts()
    browser.close()
```

Residential proxy for IP trust. Real browser for TLS and fingerprint. Adjust selectors for current Google markup (they change often).

---

## Parsing SERP Structure

SERP HTML varies by engine. Common patterns:

- **Organic results** — Usually in containers with class like `.g` (Google) or similar. Extract title, URL, snippet.
- **Featured snippet** — Often in a distinct block. May need different selectors.
- **Ads** — Top/bottom ads have different markup. Filter or extract separately.

Use BeautifulSoup or lxml for HTML parsing. Prefer resilient selectors; engines update markup frequently.

---

## Best Practices

1. **Residential proxies** — Mandatory for Google at scale. Rotate per request or per session.
2. **Random delays** — 3–10 seconds between searches. Vary by `random.uniform`.
3. **Respect robots.txt** — Check Google's robots.txt. Some paths may be disallowed.
4. **Consider official APIs** — Google Search API, Bing API. Use when budget allows; avoid scraping when possible for ToS compliance.

---

## Troubleshooting

**CAPTCHA or block** — Switch to Playwright. Use residential proxies. Add more delays. Reduce concurrency.

**Empty or wrong results** — Selectors may have changed. Inspect page HTML. Use Playwright's `page.content()` to debug.

**Rate limited** — Too many requests from one IP. Rotate more often. Add longer delays.

---

## Summary

SERP scraping requires residential proxies and often a real browser (Playwright) for Google. Use requests for low-volume or less protected engines. Parse with resilient selectors. Add randomized delays. Consider official APIs when available.

---

**Further reading:** [Scraping SERP Data](/en/blog/scraping-serp-data) · [Bypass Cloudflare for Web Scraping](/en/blog/bypass-cloudflare-web-scraping) · [Proxy Rotation Strategies](/en/blog/proxy-rotation-strategies)
