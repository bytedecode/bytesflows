---
title: "Mastering Crawlee: The Ultimate Web Scraping Tutorial for 2026"
slug: "crawlee-web-scraping-tutorial"
summary: "Step into the future of enterprise web scraping with Crawlee. Explore its unified interface for Cheerio and Playwright, intelligent request queuing, and built-in stealth features powered by high-trust residential proxies."
category: "crawlee"
tags: ["web-scraping","crawlee","playwright","typescript","automation","proxy"]
language: "en"
coverImage: "https://picsum.photos/seed/crawlee-web-scraping-tutorial/2000/1000"
---

## Introduction: Why Crawlee is the Game Changer

In the early years of web scraping, developers were forced to choose between simple HTTP libraries like `axios` or heavy browser automation tools like Selenium. There was no middle ground—until **Crawlee** arrived. 

Crawlee (formerly Apify SDK) is not just a library; it’s a full-featured scraping framework that handles the "boring" parts of scraping: request queues, data storage, and most importantly, [anti‑bot bypass](/en/blog/bypass-cloudflare-web-scraping). Whether you are a solo developer or part of a massive data engineering team, Crawlee provides the building blocks for reliable, production‑grade crawlers.

## The Three Pillars of Crawlee

One of Crawlee's best features is its unified interface. You can switch between different crawler types by changing just one class name, while keeping 90% of your logic identical.

### 1. CheerioCrawler (The Speed Demon)
When you don't need to execute JavaScript, `CheerioCrawler` is your best friend. It uses `cheerio` to parse HTML, making it incredibly fast and light on resources. It's perfect for static blogs, product listings, or any site where the data is in the initial HTML response.

### 2. PlaywrightCrawler (The Modern Standard)
This is our recommended choice for 90% of modern projects. It leverages [Playwright](/en/blog/playwright-web-scraping-tutorial) to manage real browser instances (Chromium, Firefox, WebKit). It handles JS-heavy sites, SPA (Single Page Applications), and [complex interactions](/en/blog/headless-browser-scraping-guide) with ease.

### 3. PuppeteerCrawler (The Veteran)
While Playwright is gaining ground, many legacy systems still rely on Puppeteer. Crawlee supports it fully, providing the same high-level abstractions for managing browser pools.

## Handling Proxies: The Key to Success

A crawler is only as good as its network. In Crawlee, proxy management is built directly into the `ProxyConfiguration` class. For serious projects, you should always favor [residential proxies](/en/blog/residential-proxies) over datacenter ones.

```typescript
import { PlaywrightCrawler, ProxyConfiguration } from 'crawlee';

// Initialize proxy configuration with Bytesflows Residential Pool
const proxyConfiguration = new ProxyConfiguration({
    proxyUrls: [
        'http://username:password@p1.bytesflows.com:8001'
    ]
});

const crawler = new PlaywrightCrawler({
    proxyConfiguration,
    requestHandler: async ({ page, request }) => {
        console.log(`Processing ${request.url}`);
        // Crawlee automatically handles proxy rotation here
        await page.goto(request.url);
        const title = await page.title();
        console.log(`Title of ${request.url} is: ${title}`);
    },
});

await crawler.run(['https://bytesflows.com']);
```

## Why Crawlee Wins at Scale

When we talk about [scraping data at scale](/en/blog/scraping-data-at-scale), standard scripts often fail due to memory leaks or unhandled errors. Crawlee solves this with:

-   **RequestQueue:** An smart "to-do list" that ensures every URL is crawled once, even if the process crashes and restarts.
-   **Dataset:** A reliable way to store results in JSON, CSV, or XML without worrying about file corruption.
-   **Autoscaling:** Crawlee monitors your CPU and RAM in real‑time, automatically increasing or decreasing the number of concurrent browser tabs to keep your server healthy.

## Avoiding Blocks: Fingerprinting & Stealth

By default, standard browser automation is a target for [anti-bot systems like Cloudflare](/en/blog/bypass-cloudflare-web-scraping). Crawlee includes built-in fingerprinting support. When paired with [rotating residential proxies](/en/blog/proxy-rotation-strategies), your traffic becomes indistinguishable from real users.

> [!TIP]
> Always use `useFingerprints: true` in your PlaywrightCrawler options. This randomizes properties like screen resolution, font lists, and GPU info to bypass [browser fingerprinting](/en/blog/browser-fingerprinting-explained).

## Practical Advice: Start Small, Think Big

1.  **Start with Cheerio:** If the site doesn't require JS, don't use a browser. You'll save 90% on server costs.
2.  **Use Sticky Sessions:** If you're scraping a site with a login or a shopping cart, ensure your proxy configuration uses sticky sessions to keep the same IP for the duration of the user journey.
3.  **Monitor Your Rejection Rate:** If more than 5% of your requests are returning 403 or 429, it's time to upgrade your [proxy trust score](/en/blog/residential-proxies-improve-scraping).

## Conclusion

Crawlee has lowered the barrier to entry for professional web scraping. By handling the complex infrastructure and anti-bot defense out of the box, it allows you to focus on what matters: the data. Combine it with a [robust residential proxy network](/en/proxies) and you'll have a system that can handle anything the web throws at it.
