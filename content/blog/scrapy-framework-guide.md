---
title: "Scrapy Framework Guide for Web Scraping (2026)"
slug: "scrapy-framework-guide"
summary: "Comprehensive 2026 Scrapy framework guide for industrial data extraction. Learn to build advanced Spiders, optimize middleware pipelines, and manage distributed proxy rotation at scale."
category: "framework"
tags: ["Scrapy", "Python", "web scraping", "framework", "crawler"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=2000"
---

## What is Scrapy?

**Scrapy** is a Python framework for building **crawlers** and **scrapers**: you define spiders that request URLs, parse responses, and yield items that flow through pipelines (validation, storage, dedup). It handles scheduling, retries, and concurrency. For Python scraping in general, see [Python Web Scraping Guide](/en/blog/python-web-scraping-guide) and [Best Python Libraries](/en/blog/best-python-libraries-web-scraping). For scale, use [residential proxies](/en/blog/residential-proxies) and [Best Proxies for Web Scraping](/en/blog/best-proxies-for-web-scraping).

## Spiders, Items, and Pipelines

- **Spiders** — Define start URLs and rules to follow links and parse pages. Use selectors (CSS/XPath) to extract data into **Item** objects.
- **Items** — Structured output (e.g. product name, price). Pipelines clean, validate, and store them. [Extracting structured data](/en/blog/python-web-scraping-guide).
- **Pipelines** — Process items (DB, API, file). For [building a Python scraping API](/en/blog/python-web-scraping-guide) or feeding data to other systems.

Compare with [BeautifulSoup vs Scrapy vs Playwright](/en/blog/best-python-libraries-web-scraping): Scrapy is best for site-wide crawls and [distributed crawlers](/en/blog/scraping-data-at-scale). For JS-rendered pages, combine with [Playwright](/en/blog/playwright-web-scraping-tutorial) or use [Scraping Dynamic Websites with Python](/en/blog/scraping-dynamic-websites-playwright).

## Using Proxies in Scrapy

Configure a **download middleware** that sets the `proxy` meta key per request. With a [rotating residential proxy](/en/blog/residential-proxies) gateway, each request can use a different IP. See [Python Proxy Scraping Guide](/en/blog/python-scraping-proxy), [Rotating Proxies in Python](/en/blog/rotating-proxies-web-scraping), and [Proxy Rotation Strategies](/en/blog/proxy-rotation-strategies). Use [Proxy Checker](/en/blog/proxy-checker) to verify. [Avoid IP bans](/en/blog/avoid-ip-bans-web-scraping) and [best proxies](/en/blog/best-proxies-for-web-scraping) apply to Scrapy too.

## Scaling and Best Practices

- **Concurrent requests** — Tune `CONCURRENT_REQUESTS` and per-domain limits. [Scraping data at scale](/en/blog/scraping-data-at-scale) and [Python scraping performance](/en/blog/python-web-scraping-guide).
- **Respect robots.txt** — Scrapy can obey robots.txt; see [Ethical Web Scraping](/en/blog/ethical-web-scraping-best-practices-2025) and [Robots.txt Tester](/en/blog/robots-tester).
- **Distributed** — Use [distributed crawlers with Scrapy](/en/blog/scaling-scrapers-distributed-systems) (e.g. scrapyd, Redis scheduler) and [proxy pools](/en/blog/best-proxies-for-web-scraping).

More: [Python Scraping Framework Comparison](/en/blog/best-python-libraries-web-scraping), [Ultimate Web Scraping Guide](/en/blog/ultimate-guide-web-scraping-2026), [Residential Proxies](/en/blog/residential-proxies).

## Writing a Simple Spider

A minimal Scrapy spider defines `name`, `start_urls`, and a `parse` method that extracts data and optionally yields new requests:

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

For [extracting structured data](/en/blog/python-web-scraping-guide) and [building a Python scraping API](/en/blog/python-web-scraping-guide), add Item classes and pipelines. For JS-rendered content, use [Playwright](/en/blog/playwright-web-scraping-tutorial) or [scraping dynamic websites](/en/blog/scraping-dynamic-websites-playwright); Scrapy can integrate with Playwright via middleware.

## Proxy Middleware Example

In `settings.py` enable a proxy middleware; in the middleware, set `request.meta['proxy']` to your [rotating residential proxy](/en/blog/residential-proxies) gateway (e.g. `http://user:pass@gateway:port`). Each request then goes through the proxy. See [Python proxy scraping guide](/en/blog/python-scraping-proxy), [rotating proxies in Python](/en/blog/rotating-proxies-web-scraping), and [how proxy rotation works](/en/blog/proxy-rotation-strategies). [Proxy Checker](/en/blog/proxy-checker) to verify. [Best proxies for web scraping](/en/blog/best-proxies-for-web-scraping) and [avoid IP bans](/en/blog/avoid-ip-bans-web-scraping).

## When to Choose Scrapy vs Playwright

- **Scrapy** — Site-wide crawls, many URLs, static or predictable HTML. [Distributed crawlers](/en/blog/scaling-scrapers-distributed-systems), [proxy pools](/en/blog/proxy-pools-web-scraping). [Web scraping architecture](/en/blog/web-scraping-architecture-explained).
- **Playwright** — JavaScript-heavy pages, [Cloudflare](/en/blog/bypass-cloudflare-web-scraping), [dynamic websites](/en/blog/scraping-dynamic-websites-playwright). [Playwright web scraping tutorial](/en/blog/playwright-web-scraping-tutorial), [using proxies with Playwright](/en/blog/using-proxies-playwright).

[BeautifulSoup vs Scrapy vs Playwright](/en/blog/beautifulsoup-vs-scrapy-vs-playwright) and [best web scraping tools](/en/blog/best-web-scraping-tools). [Residential Proxies](/en/blog/residential-proxies) and [Proxies](/en/proxies).

---

**Further reading:**
- [Ultimate web scraping guide](/en/blog/ultimate-guide-web-scraping-2026)
- [Best proxies for web scraping](/en/blog/best-proxies-for-web-scraping)
- [Residential proxies](/en/blog/residential-proxies)
- [Proxy rotation](/en/blog/proxy-rotation-strategies)
- [Web scraping architecture](/en/blog/web-scraping-architecture-explained)
- [Scraping data at scale](/en/blog/scraping-data-at-scale)
- [Avoid IP bans](/en/blog/avoid-ip-bans-web-scraping)
- [Playwright web scraping](/en/blog/playwright-web-scraping-tutorial)
- [Headless browser](/en/blog/headless-browser-scraping-guide)
- [Bypass Cloudflare](/en/blog/bypass-cloudflare-web-scraping)
- [How websites detect scrapers](/en/blog/how-websites-detect-scrapers)
- [Python web scraping guide](/en/blog/python-web-scraping-guide)
- [Proxy pools](/en/blog/proxy-pools-web-scraping)
- [Proxy Checker](/en/blog/proxy-checker)
- [Scraping Test](/en/blog/scraping-test)
- [Proxy Rotator](/en/blog/proxy-rotator)
- [Robots Tester](/en/blog/robots-tester)
- [Ethical web scraping](/en/blog/ethical-web-scraping-practices)
- [Web scraping legal](/en/blog/web-scraping-legal-considerations)
- [Common web scraping challenges](/en/blog/common-web-scraping-challenges)
- [Web scraping without getting blocked](/en/blog/scrape-websites-without-getting-blocked)
- [Proxies](/en/proxies)

**Next steps:** Use [residential proxies](/en/blog/residential-proxies) and [proxy rotation](/en/blog/proxy-rotation-strategies) when scaling. Validate with [Proxy Checker](/en/blog/proxy-checker) and [Scraping Test](/en/blog/scraping-test). See [ultimate web scraping guide](/en/blog/ultimate-guide-web-scraping-2026), [best proxies](/en/blog/best-proxies-for-web-scraping), [Proxies](/en/proxies).

- [What is web scraping](/en/blog/what-is-web-scraping-beginner-guide)
- [How web scraping works](/en/blog/how-web-scraping-works)
- [Web scraping at scale](/en/blog/web-scraping-at-scale-best-practices)
- [Scraping data at scale](/en/blog/scraping-data-at-scale)
- [Datacenter vs residential](/en/blog/datacenter-vs-residential-proxies)
- [Why residential](/en/blog/why-residential-proxies-best-scraping)
- [Rotating proxies](/en/blog/rotating-proxies-web-scraping)
- [Using proxies with Playwright](/en/blog/using-proxies-playwright)
- [Python proxy scraping](/en/blog/python-proxy-scraping-guide)
- [Browser fingerprinting](/en/blog/browser-fingerprinting-explained)
- [Handling CAPTCHAs](/en/blog/handling-captchas-in-scraping)
- [User-Agent Generator](/en/blog/user-agent-generator)
- [HTTP Header Checker](/en/blog/http-header-checker)
