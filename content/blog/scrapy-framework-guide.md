---
title: "Scrapy Framework Guide for Web Scraping (2026)"
slug: "scrapy-framework-guide"
summary: "Comprehensive 2026 Scrapy framework guide for industrial data extraction. Learn to build advanced Spiders, optimize middleware pipelines, and manage distributed proxy rotation at scale."
category: "Web Scraping"
tags: ["Crawler", "Framework", "Python", "Scrapy", "Web Scraping"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=2000"
---

## What Is Scrapy?

**Scrapy** is a Python framework for building **crawlers** and **scrapers**. You define spiders that request URLs, parse responses, and yield items that flow through pipelines (validation, storage, dedup). It handles scheduling, retries, and concurrency. For scale, use residential proxies. Scrapy does not run JavaScript—for JS-rendered pages, use Playwright or combine Scrapy with Playwright middleware.

---

## Spiders, Items, and Pipelines

- **Spiders** — Define start URLs and rules to follow links. Use selectors (CSS/XPath) to extract data into **Item** objects.
- **Items** — Structured output (product name, price). Define fields and validation.
- **Pipelines** — Process items: clean, validate, store to DB or API. Run in order.

---

## Writing a Simple Spider

```python
import scrapy

class ProductSpider(scrapy.Spider):
    name = "products"
    start_urls = ["https://example.com/products"]

    def parse(self, response):
        for item in response.css(".product"):
            yield {
                "title": item.css(".title::text").get(),
                "price": item.css(".price::text").get(),
            }
        next_page = response.css("a.next::attr(href)").get()
        if next_page:
            yield response.follow(next_page, self.parse)
```

For structured data, define an Item class. Add pipelines for storage.

---

## Using Proxies in Scrapy

Configure a download middleware that sets `request.meta['proxy']`. With a rotating residential gateway, pass the gateway URL—each request gets a new IP. Example in settings:

```python
ROTATING_PROXY_LIST = ["http://user:pass@gateway.example.com:8001"]
DOWNLOADER_MIDDLEWARES = {
    'scrapy.downloadermiddlewares.httpproxy.HttpProxyMiddleware': 110,
}
```

Or use a custom middleware to rotate through a proxy list. Verify with a test request before scaling.

---

## Scaling and Best Practices

- **CONCURRENT_REQUESTS** — Default 16. Tune for throughput; ensure proxy pool can handle it.
- **DOWNLOAD_DELAY** — Add per-domain delay. Use `RANDOMIZE_DOWNLOAD_DELAY` to vary.
- **Respect robots.txt** — `ROBOTSTXT_OBEY = True` in settings.
- **Distributed** — Use scrapyd or Redis-backed scheduler for multiple workers. Share queue and storage.

---

## When to Choose Scrapy vs Playwright

| Scenario | Use |
|----------|-----|
| Site-wide crawls, static HTML | Scrapy |
| JS-rendered, Cloudflare | Playwright |
| Mixed | Scrapy for discovery, Playwright for hard pages |

Scrapy excels at volume and structure. Playwright for dynamic content and anti-bot.

---

## Troubleshooting

**Empty or wrong data** — Page may be JS-rendered. Use Playwright for those URLs. Or check selectors; site may have changed.

**403 or blocks** — Add residential proxy. Increase DOWNLOAD_DELAY. Reduce CONCURRENT_REQUESTS per domain.

**Slow** — Increase concurrency if proxy pool allows. Block unnecessary requests (images, analytics) via settings.

---

## Summary

Scrapy: spiders, items, pipelines. Use proxies for scale. Tune concurrency and delays. Respect robots.txt. Use Playwright for JS or anti-bot; Scrapy for static crawls.

---

**Further reading:** [Distributed Crawlers with Scrapy](/en/blog/distributed-crawlers-scrapy) · [Python Scraping Framework Comparison](/en/blog/python-scraping-framework-comparison) · [Proxy Rotation Strategies](/en/blog/proxy-rotation-strategies)
