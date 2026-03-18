---
title: "Distributed Crawlers with Scrapy (2026)"
slug: "distributed-crawlers-scrapy"
summary: "Scale Scrapy across multiple machines. Learn job distribution, shared queues, and proxy pooling for industrial-scale crawling."
category: "Web Scraping"
tags: ["Scrapy", "Distributed", "Web Scraping"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=2000"
---

## Introduction: Beyond One Machine

A single Scrapy process can handle thousands of URLs per minute. For millions, you need **distributed crawling**: multiple workers sharing a URL queue and storing results centrally. This guide covers Scrapy's scaling options and how to add proxy rotation.

---

## Scrapy Distributed Options

**1. Scrapy cluster (scrapy-cluster, etc.)** — Redis-backed queue. Multiple Scrapy instances pull URLs from Redis, push new URLs back, write items to Redis or DB. Good for horizontal scaling.

**2. Scrapyd** — Deploy Scrapy as a service. Run multiple Scrapyd nodes, each running spiders. Use an external scheduler (e.g. Celery) to dispatch jobs. Simpler but less integrated than Redis-based clusters.

**3. Custom** — Run multiple `scrapy crawl` processes. Share a URL source (queue, DB) and a result sink. Manual but flexible.

---

## Basic Architecture

```
[URL Queue: Redis/SQS]
        |
   +----+----+----+
   |    |    |    |
Worker1 Worker2 Worker3  (each: Scrapy + proxy)
   |    |    |    |
   +----+----+----+
        |
[Storage: DB / S3 / Redis]
```

Each worker pulls URLs, crawls, pushes discovered URLs, writes items. Proxies are configured per worker or per request via middleware.

---

## Proxy Setup in Scrapy

**Rotating proxy middleware:**

```python
# settings.py
DOWNLOADER_MIDDLEWARES = {
    'scrapy.downloadermiddlewares.httpproxy.HttpProxyMiddleware': 110,
}
ROTATING_PROXY_LIST = [
    'http://user:pass@gateway.example.com:8001'
]
```

With a rotating gateway, the same URL returns different exit IPs per request. For a proxy list, use a custom middleware that rotates through the list.

---

## Concurrency and Politeness

- **CONCURRENT_REQUESTS** — Default 16. Increase for more throughput; ensure proxy pool can handle it.
- **DOWNLOAD_DELAY** — Add per-domain delay. Use `RANDOMIZE_DOWNLOAD_DELAY` to vary it.
- **Per-domain concurrency** — Limit concurrent requests per domain to avoid rate limits.

---

## Handling Failures

- **Retries** — `RETRY_TIMES` for transient failures. `RETRY_HTTP_CODES` for which status codes to retry.
- **Proxy failover** — If a proxy fails repeatedly, exclude it. Custom middleware can track failure per proxy.
- **Duplicate filtering** — Use Scrapy's `DUPEFILTER` or a Redis-based filter for distributed deduplication.

---

## Summary

Distribute Scrapy with a shared URL queue (Redis) and central storage. Configure rotating proxies via middleware. Tune concurrency and delays per domain. Implement retries and proxy failover. Use Redis-based deduplication for distributed runs.

---

**Further reading:** [Scrapy Framework Guide](/en/blog/scrapy-framework-guide) · [Proxy Pools for Web Scraping](/en/blog/proxy-pools-web-scraping) · [Scraping Data at Scale](/en/blog/scraping-data-at-scale)
