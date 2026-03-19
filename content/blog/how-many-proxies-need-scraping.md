---
title: "How Many Proxies Do You Need (2026)"
slug: "how-many-proxies-need-scraping"
summary: "Strategic capacity planning for your scraping infrastructure. Learn how to calculate the optimal number of proxies for your 2026 projects based on target difficulty, request volume, and desired success rates."
category: "Proxy Services"
tags: ["Proxy", "Residential Proxy", "Web Scraping"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2000"
---

## When Your Success Rate Crashes as You Scale

You run 100 requests from one IP: 95 succeed. You ramp to 1,000 requests from the same IP: blocks and CAPTCHAs spike. The cause is not your code; it is request density per IP. The fix: more IPs and smarter distribution.

**How many proxies do you need?** It depends on target difficulty, concurrency, and acceptable success rate. This guide gives a practical formula and decision table.

## The Core Formula

**Concurrent sessions** × **Requests per IP per hour** ≈ **Total throughput**

- **Easy targets** (static sites, low anti-bot): 50–200 requests per IP per hour.
- **Medium targets** (e-commerce, some JS): 10–50 per IP per hour.
- **Hard targets** (Amazon, LinkedIn, Cloudflare): 5–20 per IP per hour.

Example: 1,000 pages/hour from a medium target → 1,000 ÷ 30 ≈ **34 IPs** at 30 req/IP/hr.

## Decision Table

| Target difficulty | Pages/hour | Req/IP/hr (approx) | IPs needed |
|-------------------|------------|---------------------|------------|
| Easy (blogs, news) | 5,000 | 100 | 50 |
| Medium (product catalogs) | 2,000 | 40 | 50 |
| Hard (Amazon, Cloudflare) | 500 | 10 | 50 |
| Very hard (LinkedIn, strict) | 200 | 5 | 40 |

With rotating residential proxies, each request can use a new IP; the limit is concurrent connections and provider throughput, not IP count. For sticky sessions (e.g. login flows), you need enough IPs to match concurrent sessions.

## Per-IP Concurrency Limits

Sending 10 requests per second from one IP triggers rate limits. Typical safe levels:

| Site type | Concurrent req per IP | Delay between requests |
|-----------|------------------------|------------------------|
| Easy | 2–5 | 1–3 s |
| Medium | 1–2 | 3–5 s |
| Hard | 1 | 5–15 s |

Scale by adding IPs, not by increasing requests per IP.

## Validation Steps

1. Start with 1 IP, 1 req/min; measure success rate.
2. Gradually increase to 2, 5, 10 req/hr per IP until blocks appear.
3. Set your limit below that; multiply by target pages/hr to get IP count.
4. Use a Proxy Checker to confirm exit IP and country match expectations.

## Common Mistakes

| Mistake | Result | Fix |
|---------|--------|-----|
| Too few IPs for hard targets | Blocks, low success rate | Add more residential IPs or slow down |
| High concurrency per IP | Rate limits, temporary bans | Lower concurrency; add IPs |
| Mixing datacenter and residential | Residential needed for hard sites | Use residential for e-commerce, SERP, etc. |
| No monitoring | Can't tune | Log success rate and block rate per IP or pool |

## Further Reading

- [Proxy rotation strategies](/en/blog/proxy-rotation-strategies)
- [Proxy pools for web scraping](/en/blog/proxy-pools-web-scraping)
- [Avoid IP bans](/en/blog/avoid-ip-bans-web-scraping)
