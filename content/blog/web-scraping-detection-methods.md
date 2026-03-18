---
title: "Web Scraping Detection Methods (2026)"
slug: "web-scraping-detection-methods"
summary: "Anatomy of 2026 web scraping detection. Learn how modern anti-bot systems track fingerprints and behaviors, and discover stealth strategies using high-trust residential IPs."
category: "Anti-Bot & Security"
tags: ["Anti-Bot", "Bot Detection", "Detection"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=2000"
---

## Introduction: How Sites Know You're a Bot

When you scrape, the target collects signals to decide: human or bot? Understanding **which methods** they use helps you fix the right leaks. This guide walks through the main detection methods—IP, TLS, headers, fingerprint, and behavior—and what you can do about each.

---

## Method 1: IP and ASN Reputation

**What they check:** The request's IP address and its ASN (Autonomous System Number). Datacenter ASNs (AWS, GCP, OVH) are known and often flagged. Residential ISP ASNs are treated as lower risk.

**How it works:** Anti-bot vendors maintain reputation databases. Traffic from a known datacenter range gets a penalty. Too many requests from one IP triggers rate limits or blocks regardless of type.

**Defence:** Use rotating residential proxies. Spread requests across many IPs so no single address sees too much traffic.

---

## Method 2: TLS Fingerprinting (JA3/JA3S)

**What they check:** How your client performs the SSL/TLS handshake. The JA3 fingerprint captures ciphers, extensions, and curves. Each client stack (Python requests, Node https, Chrome) produces a distinct signature.

**How it works:** Before your HTTP request reaches the application, the TLS handshake is analyzed. Non-browser clients (requests, curl, axios) have signatures that differ from real Chrome. Cloudflare and similar use this to block scripts at the TLS layer.

**Defence:** Use Playwright or Puppeteer. They use a real Chromium binary with correct TLS. There is no reliable way to spoof JA3 from requests for strict targets.

---

## Method 3: HTTP Header Analysis

**What they check:** User-Agent, Accept, Accept-Language, header order, and consistency. Default library headers (e.g. `Python-requests/2.31.0`) are instantly recognizable.

**How it works:** Headers that don't match a real browser, or that contradict each other (e.g. Chrome UA with non-Chrome Accept headers), trigger checks.

**Defence:** Use Playwright—it sends browser-like headers. If using requests, set a realistic Chrome User-Agent and matching header set. Don't randomize headers per request in a way that creates contradictions.

---

## Method 4: JavaScript Browser Fingerprinting

**What they check:** Canvas hash, WebGL renderer, font list, screen resolution, timezone, and `navigator.webdriver`. Scripts run in the page and collect these traits.

**How it works:** Automation environments produce distinct fingerprints. `navigator.webdriver === true` is a direct bot signal. Mismatches (e.g. User-Agent says Windows but canvas suggests Mac) trigger blocks.

**Defence:** Use Playwright. Add playwright-stealth to patch automation leaks. Keep viewport, locale, and User-Agent consistent and matched to the proxy region.

---

## Method 5: Behavioral Analysis

**What they check:** Request timing, mouse movement, scroll patterns, and session flow. Bots tend to have regular, fast, or scripted patterns.

**How it works:** Fixed delays (e.g. exactly 2 seconds between every action) or instant scroll-to-bottom look robotic. Systems score behavioral signals and flag suspicious patterns.

**Defence:** Add randomized delays: `time.sleep(random.uniform(2, 6))`. Vary scroll and interaction timing. Cap concurrency. Don't blast requests.

---

## How Methods Combine

Sites rarely use one method alone. They score **IP**, **TLS**, **headers**, **fingerprint**, and **behavior**, then apply a policy. A datacenter IP might be allowed at low rate but blocked above a threshold. A residential IP with a bad fingerprint might still get a CAPTCHA. Your goal is to minimise the score across all layers.

---

## Decision Table: Fix by Symptom

| Symptom | Likely method | Fix |
|---------|---------------|-----|
| 403 immediately | IP or TLS | Residential proxy, Playwright |
| "Checking your browser" forever | TLS or fingerprint | Playwright, stealth, residential |
| CAPTCHA on every request | Multiple layers | Residential + Playwright + delays |
| Works then blocks | Rate or behavior | Add delays, rotate more |

---

## Summary

Detection methods: IP/ASN, TLS (JA3), headers, JS fingerprint, behavior. Use residential proxies for IP. Use Playwright for TLS and fingerprint. Add randomized delays for behavior. Patch automation leaks with stealth plugins. Test at small scale before scaling.

---

**Further reading:** [How Websites Detect Scrapers](/en/blog/how-websites-detect-scrapers) · [Preventing Scraper Fingerprinting](/en/blog/preventing-scraper-fingerprinting) · [Bypass Cloudflare for Web Scraping](/en/blog/bypass-cloudflare-web-scraping)
