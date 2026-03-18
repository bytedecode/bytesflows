---
title: "Geo Targeting with Playwright"
slug: "geo-targeting-playwright"
summary: "Use geo-targeted proxies with Playwright for location-based web scraping, SERP monitoring, and market intelligence in 2026."
category: "Proxy Services"
tags: ["Geo targeting", "Playwright", "Residential proxy", "Web scraping", "Location-based"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=2000"
---

## Geo Targeting with Playwright

Geo-targeted scraping means collecting data exactly as it appears to users in a specific country or region. Search results, prices, availability, and ads all change by location. With Playwright and geo-targeted proxies, you can get accurate, location-specific data for SERP monitoring, pricing intelligence, and market research. This guide covers how it works, how to configure it, how to verify it, and how to avoid common mistakes.

---

## A Scenario: Why Geo Matters

You're monitoring Google rankings for a keyword. You run a scraper from your US server. The results you get are US results. But your client cares about Germany. German users see different rankings—different organic results, different ads. Your data is useless for their market.

With a geo-targeted proxy that exits in Germany, Playwright's traffic appears to come from Germany. Google returns German results. You collect what German users actually see. The same principle applies to e-commerce (local prices, availability), ad verification (what ads show in each market), and compliance (data from specific jurisdictions).

---

## Why Geo Targeting Matters

**Search results (SERPs):** Google and others return different results by region. To monitor rankings or ad campaigns in a specific country, you need an exit IP in that country. There is no alternative.

**E-commerce:** Prices, discounts, and stock vary by region. A product may be $99 in the US and €89 in the EU, or available in one region and out-of-stock in another. Competitor and price intelligence requires accurate local data.

**Compliance and verification:** Some projects require data from specific jurisdictions. Ads and content must be verified as they appear in each market. Regulatory checks often need location-specific evidence.

**Market research:** Competitor analysis, pricing intelligence, and availability checks typically need multi-region coverage.

---

## How Geo Targeting Works

The proxy provider assigns you an exit IP in the requested country or city. When Playwright connects through that proxy, the target site sees traffic coming from that location. Geo is configured at the provider—Playwright just uses a proxy; it doesn't know or care about geo.

**Common config formats:**
- **Different gateway hostnames:** `us.gateway.example.com` for US, `de.gateway.example.com` for Germany
- **Country in username:** `user-country-us` or `user-us-session123`
- **Query params or custom headers:** Some providers use URL params or headers

Check your provider's docs. The principle is the same: you specify the region, the provider routes you to an IP there.

---

## Playwright Setup with Geo Proxies

From Playwright's perspective, a geo proxy is just a proxy. You pass the config as usual:

```python
from playwright.sync_api import sync_playwright

US_PROXY = "http://user:pass@us.gateway.example.com:8001"
DE_PROXY = "http://user:pass@de.gateway.example.com:8001"

with sync_playwright() as p:
    browser = p.chromium.launch(proxy={"server": US_PROXY})
    page = browser.new_page()
    page.goto("https://www.google.com/search?q=test")
    # Results will be as for a US user
```

Or with country in username:

```python
proxy = {"server": "http://gateway.example.com:8001",
         "username": "user-country-de", "password": "pass"}
browser = p.chromium.launch(proxy=proxy)
```

---

## Verifying Exit Location (Critical)

Before trusting geo data, verify the proxy exits where you expect. Misconfiguration is common.

```python
page.goto("https://ipinfo.io/json")
data = json.loads(page.content())
print(data["country"], data["city"])
```

Confirm the country (and city, if needed) matches your target. If it doesn't, fix the proxy config before scraping. One spot-check can save hours of debugging wrong data.

---

## Best Practices

**1. Use residential geo proxies.** Datacenter proxies with geo selection exist but are more likely to be detected. Residential IPs in the target region pass anti-bot checks better.

**2. Rotate within the region.** You may want different IPs for different requests, all in the same country. Many providers support "geo + rotating"—each request gets a new IP within the chosen region.

**3. Add delays and cap concurrency.** Geo doesn't exempt you from rate limits. Use random delays, realistic viewports, and limited parallel workers per domain.

**4. Match viewport and locale.** For language-sensitive targets, set `locale="de-DE"` for German, etc. Use a realistic viewport (1920×1080). Some sites adjust content by these signals.

---

## Multi-Region Collection

When scraping multiple countries:

- **Config map:** `{"US": US_PROXY, "DE": DE_PROXY, ...}`. Select proxy based on task.
- **One browser per region per batch:** Don't reuse the same browser for different regions. Switch proxy when switching region.
- **Track region per result:** Store a `region` field so you don't mix data later.
- **Sequential or parallel by region:** Process regions in sequence or run dedicated workers per region. Ensure proxy pool supports the regions you need.

---

## Troubleshooting

**Results don't match expected region:** Verify exit IP with ipinfo.io. Check proxy config uses the correct country parameter. Some providers use city-level targeting—ensure you're not over-restricting to a city with few IPs.

**Getting blocked:** Geo proxies are still subject to rate limits and anti-bot checks. Add delays, reduce concurrency, use residential proxies. For JS-heavy or protected sites, Playwright is required (not raw HTTP).

**Inconsistent geo across requests:** With rotating geo, each request may get a different IP. Ensure all IPs stay within the target region. If some requests show wrong geo, the pool may be misconfigured—check with your provider.

---

## Summary

1. Geo targeting = proxy exits in a specific country/city. Configure at the provider.
2. Playwright uses the proxy like any other; geo is transparent to it.
3. Verify exit location with ipinfo.io before trusting data.
4. Use residential geo proxies, rotate within region, and apply standard anti-detection.

---

**Further reading:** [Playwright Proxy Setup](/en/blog/playwright-proxy-setup) · [Rotating Residential Proxies with Playwright](/en/blog/rotating-residential-proxies-playwright) · [Avoid IP Bans in Web Scraping](/en/blog/avoid-ip-bans-web-scraping)
