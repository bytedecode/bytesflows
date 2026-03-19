---
title: "Scraping Marketplace Data (2026)"
slug: "scraping-marketplace-data"
summary: "Technical strategies for scraping online marketplaces. Handle dynamic listings, pagination, and anti-bot protection for reliable product and seller data."
category: "Web Scraping"
tags: ["Use-cases", "Web Scraping"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2000"
---

## Introduction: The Marketplace Data Challenge

You need product listings, prices, and seller info from eBay, Etsy, or similar marketplaces. These sites use JavaScript for search results and infinite scroll, and they aggressively block automated access. Requests alone often return empty or captcha pages. The solution: headless browser automation plus residential proxies.

This guide walks through practical strategies for scraping marketplace data reliably.

## Typical Data Points

| Data | Example | Extraction approach |
|------|---------|---------------------|
| Product title | "Vintage Lamp 1920s" | DOM selector or `data-*` attribute |
| Price | $45.99 | Watch for sale vs regular price; normalize currency |
| Seller | seller_id, feedback score | Often in JSON or `data-` attributes |
| Images | High-res URL | Prefer CDN URLs over base64 |
| Listings count | Pagination total | Parse from "Page 1 of N" or API response |
| Category | Breadcrumb path | CSS or structured data |

## Architecture: Discovery vs Detail

Many marketplaces have two layers:

1. **Discovery** (search, category, browse): Returns lists of product URLs or IDs. Often uses infinite scroll or "Load more."
2. **Detail** (product page): Full data for one item. May be static HTML or AJAX-loaded.

Use a headless browser for discovery if the results are JS-rendered. For detail pages, try Requests first if the HTML contains the data; fall back to Playwright if it's loaded dynamically.

## Example: Playwright Marketplace Scraper

```python
from playwright.sync_api import sync_playwright

def scrape_listings(url, proxy_url):
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            proxy={"server": proxy_url.split("@")[1].split("/")[0],
                   "username": "user", "password": "pass"}
        )
        page = browser.new_page()
        page.goto(url, wait_until="networkidle")
        for _ in range(5):
            page.mouse.wheel(0, 800)
            page.wait_for_timeout(1000)
        items = page.locator(".listing-card").all()
        for item in items:
            title = item.locator(".title").inner_text()
            price = item.locator(".price").inner_text()
            link = item.locator("a").get_attribute("href")
            print(f"{title} | {price} | {link}")
        browser.close()
```

Adjust selectors to match the target site. Use residential proxies to avoid blocks when scaling.

## Handling Pagination and Infinite Scroll

| Pattern | Strategy |
|---------|----------|
| Page numbers (1, 2, 3...) | Loop over `?page=N` or equivalent; stop when no results |
| "Load more" button | `page.click("button:has-text('Load more')")` then wait for new items |
| Infinite scroll | Scroll down in a loop; wait for network idle; stop after N scrolls or when no new items |

Always add small random delays between actions to mimic human behavior and reduce detection risk.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Empty listing area | Content loaded by JS | Use Playwright; wait for `.listing-card` or similar before extracting |
| CAPTCHA after few pages | IP flagged | Use rotating residential proxy; reduce request rate |
| Selectors break | Site layout changed | Use resilient selectors (e.g. `data-testid`); add fallbacks |
| Prices in wrong format | Different locales/formats | Normalize: strip currency, parse number, standardize decimals |

## Verification

1. Scrape one category page and confirm at least 10 listings with title, price, link.
2. Compare a sample of extracted prices with manual browser check.
3. Run for 50–100 URLs with proxy; monitor success rate and CAPTCHA frequency.

## Further reading

- [Scraping e-commerce websites](/en/blog/scraping-ecommerce-websites)
- [Scraping infinite scroll pages](/en/blog/scraping-infinite-scroll-pages)
- [Scraping price comparison data](/en/blog/scraping-price-comparison-data)
