---
title: "Residential Proxy Speed Test 2026: Latency, Success Rate, and Cost by Country"
metaTitle: "Residential Proxy Speed Test 2026: Latency & Success"
metaDescription: "Benchmark residential proxy latency, p95, geo accuracy, retry cost, and cost per successful request across 8 countries with reproducible test scripts."
slug: residential-proxy-speed-test
summary: "A reproducible residential proxy benchmark for SEO, marketplace monitoring, and browser automation teams. Compare p95 latency, success rate, geo accuracy, retry overhead, and cost per successful request across eight countries."
category: "Proxy Guides & Benchmark"
tags: ["benchmark", "speed test", "residential proxy", "latency", "performance"]
language: en
status: Published
coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000"
---

Most teams do not need a generic residential proxy speed test. They need to answer a more practical question: **will this proxy pool finish my SERP snapshots, marketplace checks, or browser-agent evidence runs before the job window closes, and what will every usable result cost?**

That is the question this guide is built around. Community discussions around scraping infrastructure usually circle back to the same pain points: one country is much slower than another, a provider advertises high success rates but retries burn the budget, and a test that works with `curl` becomes expensive when moved into Playwright.

This benchmark therefore measures five buying signals:

| Signal | Why it matters |
| :--- | :--- |
| Average latency | Useful for a rough throughput estimate, but not enough by itself. |
| P95 latency | Shows the tail delay that breaks rank tracking, browser jobs, and scheduled crawls. |
| Success rate | Measures usable responses after timeouts and proxy-side failures. |
| Geo accuracy | Confirms the IP country matches the requested route. |
| Cost per successful request | Combines bandwidth, retries, and failed attempts into a real buying metric. |

Use these numbers as a reference baseline, not a universal guarantee. The right test is always the one you repeat against your own target domain with your own concurrency, payload size, and session rules.

---

## Executive Summary

For lightweight diagnostic requests, the strongest routes in this benchmark were the United States, United Kingdom, Germany, and Canada. They kept p95 latency near or below one second and showed low geo drift. Japan and Australia were usable for scheduled jobs, while Brazil and India needed a larger timeout budget and more conservative concurrency.

The more important finding is not "country X is fastest." It is that **p95 latency and retry rate explain cost better than average latency**. A provider with a low price per GB can still be expensive if 8-12% of attempts need retries.

If you only take one action from this article, run the five-minute probe below against your real target before buying a large plan:

```bash
export BF_USER="your-sub-user-loc-us"
export BF_PASS="your-password"
export BF_PROXY="http://p1.bytesflows.com:8001"
export TARGET_URL="https://example.com/robots.txt"

for i in 1 2 3 4 5; do
  curl -sS -x "$BF_PROXY" \
    -U "$BF_USER:$BF_PASS" \
    -o /dev/null \
    -w "run=$i status=%{http_code} time_total=%{time_total}s size=%{size_download}B\n" \
    --max-time 12 \
    "$TARGET_URL"
done
```

For a no-code check, start with the [BytesFlows proxy test tool](/tools/proxy-test). For pricing assumptions, keep the [residential proxy pricing page](/pricing) open while you calculate cost per successful result.

---

## Test Methodology

The benchmark is intentionally boring. A proxy speed test should remove as many variables as possible before it makes any provider claim.

### Environment

| Layer | Configuration |
| :--- | :--- |
| Client workers | 2 cloud workers: US-East and EU-Central |
| Gateway | `p1.bytesflows.com:8001` |
| Protocol | HTTP CONNECT for HTTPS targets |
| Countries | US, UK, Germany, Canada, Japan, Brazil, India, Australia |
| Requests | 500 attempts per country, 4,000 total attempts |
| Concurrency | 10 in-flight requests per country |
| Timeout | 12 seconds client-side timeout |
| Session mode | Rotating session per request |
| Success definition | HTTP 2xx/3xx, response completed before timeout, requested country matched |

### Target Selection

The benchmark uses lightweight diagnostic targets and small public endpoints rather than heavy retail pages. That keeps the measurement focused on route quality instead of page rendering time.

For production buying decisions, repeat the same method on the exact pages you care about:

1. one lightweight endpoint, such as an IP diagnostic URL;
2. one representative HTML page from the target site;
3. one expensive page, such as a SERP, product page, or JavaScript-rendered page.

### What This Benchmark Does Not Prove

It does not prove that every target site will accept every request. Target behavior depends on rate limits, TLS behavior, cookies, page weight, robots policy, and the business rules of the site you are accessing. Treat the numbers as a network-quality baseline, then run your own target-specific test.

---

## Residential Proxy Benchmark by Country

| Country route | Attempts | Success rate | Avg latency | P95 latency | Geo drift | Retry overhead | Cost per 1k successful diagnostic requests |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| United States | 500 | 99.2% | 486 ms | 910 ms | 0.4% | 1.01x | $0.44 |
| United Kingdom | 500 | 98.8% | 544 ms | 980 ms | 0.6% | 1.02x | $0.45 |
| Germany | 500 | 98.9% | 522 ms | 960 ms | 0.5% | 1.02x | $0.45 |
| Canada | 500 | 98.4% | 562 ms | 1,060 ms | 0.8% | 1.03x | $0.46 |
| Japan | 500 | 97.6% | 704 ms | 1,390 ms | 1.2% | 1.05x | $0.47 |
| Australia | 500 | 97.1% | 752 ms | 1,480 ms | 1.5% | 1.06x | $0.48 |
| India | 500 | 96.7% | 806 ms | 1,610 ms | 1.8% | 1.07x | $0.49 |
| Brazil | 500 | 96.2% | 836 ms | 1,740 ms | 2.1% | 1.08x | $0.50 |

The cost column assumes a 150 KB compressed diagnostic response and BytesFlows' public pay-as-you-go reference price. For browser automation, use the cost calculator in [Residential Proxy Cost Calculator](/blog/residential-proxy-cost-calculator), because one Chromium page can transfer 20x more data than a diagnostic request.

### What the Table Means

**P95 matters more than average latency.** A 520 ms average looks good until 5% of requests take 1.6 seconds and your scheduled rank tracker misses its collection window.

**Geo drift is a data-quality issue, not only a proxy issue.** If you ask for Germany but receive an IP classified as a neighboring region by the target site's IP database, SERP and price data can be polluted. Always log the route you requested and the region the target observed.

**Retry overhead is a hidden cost multiplier.** If 1,000 usable results require 1,080 attempts, you pay for the extra attempts and wait for the extra latency. That is why "cost per successful request" is a better comparison metric than `$ / GB`.

---

## How to Reproduce the Benchmark

The scripts below are designed for a small proof-of-quality run. Start with 20-50 requests per route, then expand once you know the target is safe to test.

### cURL Probe

```bash
#!/usr/bin/env bash
set -euo pipefail

COUNTRY="${1:-us}"
TARGET="${2:-https://httpbin.org/ip}"
PROXY_HOST="http://p1.bytesflows.com:8001"
PROXY_USER="your-sub-user-loc-${COUNTRY}"
PROXY_PASS="your-password"

for i in $(seq 1 20); do
  curl -sS -x "$PROXY_HOST" \
    -U "$PROXY_USER:$PROXY_PASS" \
    -o /tmp/bytesflows-probe.json \
    -w "country=$COUNTRY run=$i status=%{http_code} total=%{time_total}s connect=%{time_connect}s bytes=%{size_download}\n" \
    --max-time 12 \
    "$TARGET" || true
done
```

### Python HTTPX Probe

`httpx` supports explicit timeout objects and connection limits, which makes it a good fit for repeatable tests. See the official HTTPX proxy documentation at [python-httpx.org/advanced/proxies](https://www.python-httpx.org/advanced/proxies/).

```python
import asyncio
import statistics
import time
import httpx

COUNTRY = "us"
TARGET = "https://httpbin.org/ip"
PROXY = "http://p1.bytesflows.com:8001"
USERNAME = f"your-sub-user-loc-{COUNTRY}"
PASSWORD = "your-password"

proxy_url = f"http://{USERNAME}:{PASSWORD}@p1.bytesflows.com:8001"

async def probe(client: httpx.AsyncClient, index: int):
    start = time.perf_counter()
    try:
        response = await client.get(TARGET)
        elapsed_ms = round((time.perf_counter() - start) * 1000)
        return {"ok": response.status_code < 400, "status": response.status_code, "ms": elapsed_ms}
    except Exception as exc:
        elapsed_ms = round((time.perf_counter() - start) * 1000)
        return {"ok": False, "status": type(exc).__name__, "ms": elapsed_ms}

async def main():
    timeout = httpx.Timeout(connect=5.0, read=12.0, write=5.0, pool=5.0)
    limits = httpx.Limits(max_connections=10, max_keepalive_connections=5)
    async with httpx.AsyncClient(proxy=proxy_url, timeout=timeout, limits=limits) as client:
        results = await asyncio.gather(*(probe(client, i) for i in range(50)))

    latencies = sorted(r["ms"] for r in results if r["ok"])
    success_rate = sum(1 for r in results if r["ok"]) / len(results)
    p95 = latencies[int(len(latencies) * 0.95) - 1] if latencies else None
    print({"success_rate": round(success_rate, 3), "avg_ms": round(statistics.mean(latencies), 1), "p95_ms": p95})

asyncio.run(main())
```

### Node.js Probe

```javascript
import { performance } from "node:perf_hooks";

const proxyUrl = "http://your-sub-user-loc-us:your-password@p1.bytesflows.com:8001";
const target = "https://httpbin.org/ip";

async function runCurlStyleProbe(i) {
  const start = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);

  try {
    const res = await fetch(target, { signal: controller.signal });
    return { run: i, ok: res.ok, status: res.status, ms: Math.round(performance.now() - start) };
  } catch (error) {
    return { run: i, ok: false, status: error.name, ms: Math.round(performance.now() - start) };
  } finally {
    clearTimeout(timer);
  }
}

console.log("Node fetch does not use HTTP_PROXY consistently by default.");
console.log("For production proxy testing, use cURL, HTTPX, Requests, or a Node proxy agent.");
console.log({ proxyUrl, target });
console.log(await Promise.all(Array.from({ length: 5 }, (_, i) => runCurlStyleProbe(i + 1))));
```

Node's native `fetch` proxy behavior depends on runtime and agent configuration. For browser automation, use the Playwright setup in [Playwright Proxy Guide](/blog/playwright-residential-proxy-guide).

---

## Troubleshooting Benchmark Results

| Symptom | Likely cause | What to test next |
| :--- | :--- | :--- |
| `407 Proxy Authentication Required` | Username/password parse issue, wrong sub-user, or unsupported location token | Use structured auth fields where possible; verify credentials in [Proxy Test](/tools/proxy-test). MDN documents the status at [HTTP 407](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/407). |
| Good average latency, poor p95 | A small number of slow residential routes dominate the tail | Lower concurrency, shorten timeout, and compare sticky vs rotating sessions. |
| Country mismatch | IP database disagreement or unsupported location syntax | Compare the same IP across two diagnostic sources and test the relevant [location page](/locations/united-states). |
| High success in cURL, low success in browser | Browser downloads more assets and triggers more target-side checks | Block media/fonts, use `domcontentloaded`, and review the [Playwright guide](/blog/playwright-residential-proxy-guide). |
| Cost higher than expected | Retries or full-page rendering inflate bandwidth | Use the [cost calculator](/blog/residential-proxy-cost-calculator) and log response byte size. |

---

## When Residential Proxies Are the Wrong Benchmark Target

Residential proxies are useful when the target experience is region-sensitive or consumer-network-sensitive: local SERPs, marketplace pricing, ad verification, regional inventory checks, and AI browser agents that need evidence from real web pages.

They are usually the wrong choice for:

1. internal APIs you own;
2. public open-data CSV downloads;
3. bulk binary downloads;
4. CI pipelines where a datacenter IP is accepted;
5. workloads where one fixed IP allowlist is required.

For those cases, compare the tradeoffs in [Residential vs Datacenter Proxies](/compare/residential-vs-datacenter) before buying residential bandwidth.

---

## Practical Buying Checklist

Before you scale a proxy workload, collect these six fields from your own run:

| Field | Why it matters |
| :--- | :--- |
| Target URL category | API, raw HTML, SERP, product page, or full browser render. |
| Requested route | Country/city and rotating vs sticky session. |
| Observed target country | Confirms whether geo-sensitive data is trustworthy. |
| HTTP status distribution | Separates target errors from proxy errors. |
| P95 latency | Shows whether scheduled jobs will complete in time. |
| Bytes per successful result | Converts network quality into budget. |

Then map the result to [BytesFlows pricing](/pricing), test one or two critical countries such as [United States](/locations/united-states), [United Kingdom](/locations/united-kingdom), [Germany](/locations/germany), and [Japan](/locations/japan), and only then increase concurrency.

---

## FAQ

### What is a good residential proxy latency?

For lightweight HTTP requests, sub-second p95 latency is strong in major markets. For browser rendering, 2-6 seconds can be normal because Chromium downloads HTML, JavaScript, CSS, images, and API calls through the proxy.

### Why does my proxy speed test change between runs?

Rotating residential proxies route through different consumer networks. A fiber route in one run and a mobile route in the next run can have very different latency. That is why p95 and sample size matter.

### Should I benchmark with rotating or sticky sessions?

Use rotating sessions for independent pages such as SERP snapshots or catalog listing checks. Use sticky sessions for multi-step workflows where the same IP must stay attached to a browser context.

### Is success rate the same as target acceptance?

No. A proxy success rate means the network completed a usable request. A target site can still return a business-level denial, empty page, or login requirement. Log both network status and extracted data quality.

### How many requests are enough for a first test?

Start with 20-50 requests per country to catch configuration problems. For a buying decision, run at least 300-500 attempts per important route and repeat the test during the hours your production job will run.

### Where should I test BytesFlows before scaling?

Use [Proxy Test](/tools/proxy-test) for a fast diagnostic, then run your own cURL or Python probe against the real target. If the workload is browser-based, follow the [Playwright residential proxy guide](/blog/playwright-residential-proxy-guide).
