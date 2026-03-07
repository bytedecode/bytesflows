---
title: "Python Scraping with Residential Proxies"
slug: "python-scraping-proxy"
summary: "Use Python with residential proxies for web scraping. Requests, Scrapy, Playwright — rotate IPs and scale."
category: "landing"
tags: ["python scraping", "python proxy", "residential proxy python", "scraping with python"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2000"
---

## Python + Residential Proxies for Scraping

Use **Python with residential proxies** in Requests, Scrapy, Playwright, or any HTTP client. Rotate IPs per request or per session to avoid blocks and scale your Python scrapers.

### Quick example

```python
import requests

proxies = {
    "http": "http://user:pass@gateway:port",
    "https": "http://user:pass@gateway:port"
}
r = requests.get("https://example.com", proxies=proxies)
```

With a rotating gateway, each request can get a new residential IP.

### Choosing the right Python stack

- **Requests + Beautiful Soup** — Good for static HTML, simple pages. Add proxies as above. See [Using Requests for Web Scraping](/en/blog/using-requests-web-scraping) and [Python Web Scraping Tutorial for Beginners](/en/blog/python-web-scraping-tutorial-beginners).
- **Scrapy** — Best for large-scale crawling, built-in concurrency and retries. Configure proxies in middleware; see [Scrapy Framework Guide](/en/blog/scrapy-framework-guide) and [Using Proxies in Python Scrapers](/en/blog/using-proxies-python-scrapers).
- **Playwright (or Selenium)** — For JavaScript-heavy and anti-bot–protected sites. Use [Using Proxies with Playwright](/en/blog/using-proxies-playwright) and [Playwright Proxy Configuration Guide](/en/blog/playwright-proxy-configuration-guide).

For a comparison of libraries and when to use each, read [Best Python Libraries for Web Scraping](/en/blog/best-python-libraries-web-scraping) and [Python Scraping Framework Comparison](/en/blog/python-scraping-framework-comparison).

### Configuring residential proxies in Python

Most residential providers give you a single gateway (host:port) with username/password. The gateway assigns a new IP per request (rotating) or per session (sticky), depending on the product. In Python you typically set `proxies` once and every request goes through that gateway. For Scrapy, use a downloader middleware to set the proxy (and optionally rotate User-Agent). For Playwright, pass proxy in the browser launch options. Details: [Python Proxy Scraping Guide](/en/blog/python-proxy-scraping-guide) and [Residential Proxies to Improve Scraping](/en/blog/residential-proxies-improve-scraping).

### Performance and scaling

- Use async (e.g. aiohttp, Scrapy’s async) to increase throughput without overloading targets. See [Async Python Scraping with aiohttp](/en/blog/async-python-scraping-aiohttp).
- Combine proxy rotation with reasonable concurrency and retries. [Python Scraping Performance Optimization](/en/blog/python-scraping-performance-optimization) and [How Many Proxies You Need for Scraping](/en/blog/how-many-proxies-need-scraping) give practical guidance.
- For very large jobs, consider [Scaling Scrapers with Distributed Systems](/en/blog/scaling-scrapers-distributed-systems) and [Distributed Crawlers with Scrapy](/en/blog/distributed-crawlers-scrapy).

### Guides

- [Python Web Scraping Guide](/en/blog/python-web-scraping-guide) — from basics to production
- [Best Python Libraries for Web Scraping](/en/blog/best-python-libraries-web-scraping) — choose the right stack
- [Residential Proxies to Improve Scraping](/en/blog/residential-proxies-improve-scraping) — why and how to use them
- [Best Proxies for Web Scraping](/en/blog/best-proxies-for-web-scraping) — compare providers

### Tools

- [Proxy Checker](/en/blog/proxy-checker) — verify proxy IP and latency
- [Proxy Rotator Playground](/en/blog/proxy-rotator) — simulate IP rotation
- [Scraping Test](/en/blog/scraping-test) — test a URL with your proxy

### Example: Scrapy with rotating residential proxy

In Scrapy, set the proxy in a downloader middleware or in the request meta. Example pattern: set `proxy` to `http://user:pass@gateway:port` and optionally rotate `User-Agent` per request. The gateway will assign a new residential IP per request if your provider uses rotating mode. For full examples and middleware code, see [Using Proxies in Python Scrapers](/en/blog/using-proxies-python-scrapers) and [Scrapy Framework Guide](/en/blog/scrapy-framework-guide).

### Example: Playwright with sticky session

For Playwright, pass `proxy: { server: 'http://gateway:port', username: 'user', password: 'pass' }` in `launch()`. Use sticky (session) residential proxies when you need to complete a multi-step flow (e.g. login then scrape). Same IP for the session keeps cookies and state. [Using Proxies with Playwright](/en/blog/using-proxies-playwright) and [Playwright Proxy Configuration Guide](/en/blog/playwright-proxy-configuration-guide) show the exact options.

### Debugging proxy issues in Python

If requests fail or return challenge pages: (1) Verify proxy with [Proxy Checker](/en/blog/proxy-checker). (2) Test the same URL with [Scraping Test](/en/blog/scraping-test) and your proxy. (3) Check headers with [HTTP Header Checker](/en/blog/http-header-checker). (4) For JS challenges, switch to Playwright instead of Requests. [Common Proxy Mistakes in Scraping](/en/blog/common-proxy-mistakes-scraping) and [Common Web Scraping Challenges](/en/blog/common-web-scraping-challenges) cover more causes and fixes.

### Get proxies for Python scraping

Our [Residential Proxies](/en/proxies) work with any Python HTTP client or browser. You get a single gateway URL and credentials; use rotating or sticky depending on your plan. Combine with the guides above for reliable, scalable Python scraping.

### Quick reference: proxy in Python

| Library    | How to set proxy |
|-----------|-------------------|
| requests  | `proxies={'http':'http://user:pass@host:port', 'https':'...'}` |
| Scrapy    | Downloader middleware or `meta['proxy']` |
| Playwright| `launch(proxy={ server, username, password })` |
| aiohttp   | `connector` with proxy URL or pass proxy in request |

See [Using Proxies in Python Scrapers](/en/blog/using-proxies-python-scrapers), [Playwright Proxy Configuration Guide](/en/blog/playwright-proxy-configuration-guide), and [Python Proxy Scraping Guide](/en/blog/python-proxy-scraping-guide) for full examples.

### Summary

Python is the most popular language for web scraping. Pair it with [residential proxies](/en/proxies) for better success on strict sites. Use Requests/Scrapy for static HTML and Playwright for JavaScript-heavy or anti-bot–protected pages. Validate with [Proxy Checker](/en/blog/proxy-checker) and [Scraping Test](/en/blog/scraping-test), then scale with the guides linked above.

### More resources

- [Python Web Scraping Tutorial for Beginners](/en/blog/python-web-scraping-tutorial-beginners) — first steps.
- [Python Web Scraping Best Practices](/en/blog/python-web-scraping-best-practices) — production tips.
- [Scraping Dynamic Websites with Python](/en/blog/scraping-dynamic-websites-python) — JS and SPAs.
- [Building a Python Scraping API](/en/blog/building-python-scraping-api) — expose scrapers as a service.
- [Extracting Structured Data with Python](/en/blog/extracting-structured-data-python) — parsing and storage.

---

[Get Proxies for Python Scraping](/en/proxies) · [Python Web Scraping Guide](/en/blog/python-web-scraping-guide) · [Blog](/en/blog)
