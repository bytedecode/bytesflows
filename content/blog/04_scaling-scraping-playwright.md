---
title: "Scaling Scraping with Playwright"
slug: "scaling-scraping-playwright"
summary: "Scale web scraping with Playwright: proxy infrastructure, concurrency, distributed design, and anti-detection strategies for 2026."
category: "AI & Automation"
tags: ["Playwright", "Scaling", "Web scraping", "Proxy", "Distributed scraping"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000"
---

## Scaling Scraping with Playwright

Scaling means handling more URLs, higher throughput, and stricter targets without getting blocked. This guide covers the bottlenecks you'll hit, how to size your proxy pool, three concurrency patterns (sequential, parallel, distributed), retry logic, what to monitor, and when to stop scaling.

---

## The Four Bottlenecks When Scaling

**1. IP capacity.** One IP can only send so many requests before rate limits or bans. For strict targets, aim for 1–5 requests per IP per minute. So 100 URLs/min needs roughly 20–100 IPs. A rotating residential proxy pool provides this. Pool size must grow with throughput—if you double workers, you need roughly double the IPs (or accept lower success rate).

**2. Concurrency per domain.** Even with many IPs, 50 parallel browsers against the same domain looks like an attack. Sites detect coordinated traffic. Start with 3–5 concurrent workers per domain. Increase only if success rate stays above 90% for several hundred requests. If success rate drops when you add workers, reduce concurrency.

**3. Anti-bot sensitivity.** Some sites are much stricter than others. Scale cautiously on strict targets: slower, fewer workers, more delays. A site that allows 5 workers may block at 10. Know your target before scaling.

**4. Resource usage.** Each Playwright browser uses CPU and memory. One machine can typically run 4–8 browser instances comfortably. For hundreds of parallel workers, you need multiple machines or a different architecture (e.g. serverless with short-lived browsers).

---

## Sizing Your Proxy Pool

**Rule of thumb:** For strict targets, 1–5 requests per IP per minute.

- 100 URLs/min → 20–100 IPs
- 500 URLs/min → 100–250 IPs
- 1000 URLs/min → 200–500+ IPs

These are guidelines. Monitor block rate. If blocks spike, add more IPs or slow down. A rotating residential gateway provides a pool automatically—you don't manage individual IPs. Your concurrency and request rate determine how many IPs you need from the pool.

---

## Three Concurrency Patterns

### Pattern A: Sequential with Rotation

One browser at a time. Each gets a new IP. Simple, safe, slow.

```python
for url in urls:
    with sync_playwright() as p:
        browser = p.chromium.launch(proxy={"server": PROXY})
        page = browser.new_page()
        page.goto(url)
        data = page.content()
        browser.close()
```

**When to use:** Small batches, validation, or when the target is very strict. Throughput: roughly 1–2 URLs per minute per browser (with delays).

### Pattern B: Parallel Workers with Cap

Multiple workers, each with its own browser and IP. Cap workers per domain.

```python
from concurrent.futures import ThreadPoolExecutor

def worker(url):
    with sync_playwright() as p:
        browser = p.chromium.launch(proxy={"server": PROXY})
        page = browser.new_page()
        page.goto(url)
        data = page.content()
        browser.close()
    return data

with ThreadPoolExecutor(max_workers=5) as ex:
    results = list(ex.map(worker, urls))
```

**When to use:** Thousands of URLs, single machine. 5 workers = 5x throughput. Keep `max_workers` at 3–5 per domain initially. Scale up only if success rate stays high.

### Pattern C: Queue-Based Distributed

URLs in a queue (Redis, SQS). Workers on multiple machines pull and process. Each worker = Playwright + proxy.

**When to use:** Hundreds of thousands of URLs, or when one machine isn't enough. Scale by adding more worker machines. Ensure proxy pool size grows with total worker count.

---

## Retry and Backoff

When a request fails (403, timeout, CAPTCHA), don't retry immediately with the same IP. Best practice:

1. Close the browser (release the IP).
2. Wait (exponential backoff: 1s, 2s, 4s).
3. Retry with a new browser (new IP).

```python
import time

def scrape_with_retry(url, max_retries=3):
    for attempt in range(max_retries):
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(proxy={"server": PROXY})
                page = browser.new_page()
                page.goto(url)
                return page.content()
        except Exception:
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
            else:
                raise
```

---

## Metrics to Track

- **Success rate** — % of requests that complete without block/error. Target: >90% for production.
- **Block rate** — 403s, CAPTCHAs, challenge pages. If it rises, slow down or add proxy capacity.
- **Latency** — p50, p95. Proxies add 100–500ms. Track if it degrades as you scale.
- **Throughput** — URLs per minute. Should grow with resources. If it plateaus, find the bottleneck (IP capacity, concurrency, or machine resources).

**Decision rule:** If success rate drops when you add workers, reduce concurrency or add more proxy capacity. Never scale at the cost of success rate.

---

## When to Stop Scaling

- **Success rate drops below 90%** — Reduce workers or add delays before adding more.
- **Block rate rises** — You're triggering anti-bot. Slow down, add proxy capacity, or accept lower throughput.
- **Cost outweighs benefit** — More proxy + compute may not be worth it. Optimize extraction and reduce redundant requests first.
- **Target changes** — Sites update defenses. Re-validate at small scale before resuming high throughput.

---

## Geo-Targeting When Scaling

If you need location-specific data (SERPs by country, regional pricing), your proxy provider must support geo-targeting. Specify the country in the proxy config. Each region may have different pool sizes—check with your provider. The Playwright setup is the same; only the proxy URL or parameters change.

---

## Summary

1. Proxy pool size scales with throughput; aim for 1–5 req/IP/min on strict targets.
2. Cap concurrency per domain (start with 3–5 workers).
3. Retry with new IP on failure; use exponential backoff.
4. Monitor success rate, block rate, and latency. Scale only when metrics are stable.
5. Distribute across machines when one server isn't enough.

---

**Further reading:** [Playwright Proxy Setup](/en/blog/playwright-proxy-setup) · [Proxy Pool Design](/en/blog/proxy-pool-design) · [Avoid IP Bans in Web Scraping](/en/blog/avoid-ip-bans-web-scraping)
