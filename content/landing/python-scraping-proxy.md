---
title: "Python Scraping Proxy Guide | Residential Proxies for Python"
slug: "python-scraping-proxy"
summary: "Python scraping proxy setup with residential proxies for Requests, Scrapy, and Playwright. Rotate IPs, reduce blocks, and scale Python crawlers reliably."
category: "landing"
tags: ["python scraping", "python proxy", "residential proxy python", "scraping with python"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2000"
---

## Python + Residential Proxies for Scraping

Python is the most practical language for scraping, but stable results depend on network quality as much as code quality. If your crawler gets 403, 429, or challenge pages, residential proxies are often the fix.

This page covers stack selection, proxy setup patterns, scaling strategy, and debugging.

---

## Quick Requests Example

```python
import requests

proxies = {
    "http": "http://user:pass@gateway:port",
    "https": "http://user:pass@gateway:port",
}

response = requests.get("https://example.com", proxies=proxies, timeout=30)
print(response.status_code)
```

Replace `gateway:port` with your provider's endpoint. Both HTTP and HTTPS go through the same proxy. For a rotating residential gateway, each request typically gets a new exit IP.

---

## Pick the Right Stack for the Target

| Stack | Best for | Notes |
|-------|----------|-------|
| Requests + BeautifulSoup | Static HTML pages | Fastest to start, limited for JS-rendered content |
| Scrapy | Large crawling projects | Built-in concurrency, retries, pipelines; good for thousands of URLs |
| Playwright | JS-heavy and anti-bot targets | Real browser execution, passes Cloudflare and similar challenges |

**When to move from Requests to Playwright:** If you see "Checking your browser," CAPTCHA, or blank content where you expect data, the site likely requires JavaScript execution. Requests cannot run JS. Playwright can.

---

## How Residential Proxy Routing Works in Python

Most providers give one gateway endpoint with auth credentials. Your client sends traffic to the gateway; the provider assigns the exit IP.

- **Rotating mode:** New IP per request. Configured by default with most residential gateways.
- **Sticky mode:** Same IP for a session window. Add a session ID to the username (format varies by provider).

This model works across Requests, Scrapy, aiohttp, and Playwright. The proxy is configured per-request or per-session; the provider handles rotation logic.

---

## Rotation Mode Selection

- **Rotating** — For listing pages, search pages, broad crawling. Each request is independent; you want to minimize requests per IP.
- **Sticky** — For login, checkout, or any multi-step flow that depends on cookies. If the IP changes mid-flow, the session breaks.
- **Don't over-rotate for session flows** — Using rotating mode when you need sticky will cause intermittent failures.

---

## Proxy Setup by Library

| Library | Proxy setup |
|---------|-------------|
| requests | `proxies={"http": "...", "https": "..."}` passed to `get()` or session |
| Scrapy | Downloader middleware or `request.meta["proxy"]` |
| Playwright | `browser.launch(proxy={"server": "...", "username": "...", "password": "..."})` |
| aiohttp | Pass proxy URL to connector or per-request |

---

## Scaling Without Breaking Success Rate

1. Start with conservative concurrency (e.g. 3–5 workers per domain).
2. Measure success rate, block rate, and retry rate.
3. Tune backoff and retry logic—on failure, retry with a new session (new IP).
4. Increase workers gradually only when success rate stays high.
5. Re-check proxy health and geo coverage when you add new targets or regions.

**Common pitfall:** Doubling concurrency before validating that the current level is stable. Scale incrementally.

---

## Debugging Flow for Proxy Issues

When requests fail:

1. **Verify exit IP and location** — Use an IP check URL (e.g. `https://api.ipify.org`) through your proxy. Confirm the reported IP and country match expectations.
2. **Test on a real target URL** — A simple page may work while your actual target fails. Test the real URL.
3. **Inspect headers** — Some sites block based on `User-Agent`, `Accept-Language`, or missing headers. Match a real browser if possible.
4. **If JS challenge pages appear** — Move from Requests to Playwright. Requests cannot execute JavaScript; many anti-bot systems require it.
5. **Review concurrency and timing** — Too many parallel requests or fixed delays can trigger rate limits. Add jitter and cap workers.

---

## FAQ

**Which Python library is best for scraping with proxies?**  
Requests is fastest for static pages. Scrapy is best for large crawls with built-in concurrency and retries. Playwright is best for JavaScript-heavy or anti-bot protected targets.

**How do I set a residential proxy in Python requests?**  
Define the `proxies` dict with your gateway URL (including auth) and pass it to `requests.get()` or a `requests.Session`.

**Should I use rotating or sticky residential proxies?**  
Rotating for stateless crawling (listings, search). Sticky for login or multi-step workflows that need stable session cookies.

**Why do Python scrapers still get blocked with proxies?**  
Common causes: unrealistic headers, excessive concurrency, poor retry strategy, or a target that requires browser execution. Datacenter proxies on strict targets also fail often—use residential.

---

## Key Takeaways

- Use Requests for static pages, Scrapy for large crawls, Playwright for JS and anti-bot targets.
- Configure the proxy per library; rotating is default for most residential gateways.
- Start with low concurrency, validate success rate, then scale.
- When blocks persist, verify IP, test target, check headers, and consider Playwright.

---

[Get Proxies for Python Scraping](/en/proxies) · [Blog](/en/blog)
