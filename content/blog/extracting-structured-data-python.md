---
title: "Extracting Structured Data with Python (2026)"
slug: "extracting-structured-data-python"
summary: "From HTML to JSON: parsing techniques, selector strategies, and validation for reliable structured extraction in Python."
category: "Web Scraping"
tags: ["Python", "Extraction", "Web Scraping"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=2000"
---

## Introduction: HTML to Data

Scraping fetches HTML. Extraction turns it into structured data (JSON, CSV, DB rows). This guide covers parsing with BeautifulSoup and lxml, selector strategies, and validation.

---

## Parsing Libraries

| Library | Speed | Ease | Best for |
|---------|-------|------|----------|
| BeautifulSoup | Medium | Easy | Small/medium HTML, quick scripts |
| lxml | Fast | Medium | Large HTML, production |
| Playwright locators | N/A | Auto-wait | Dynamic pages |

Use BeautifulSoup for simplicity. Use lxml when speed matters. Use Playwright when the page is JS-rendered.

---

## Selector Strategies

**Prefer stable selectors:**
- `data-*` attributes (e.g. `data-product-id`)
- `id` when present and stable
- Semantic structure (e.g. `article`, `main`)

**Avoid fragile:**
- Layout classes (e.g. `div.col-3`) that change with redesigns
- Deep XPath that depends on exact structure
- Index-based selectors (e.g. "third div")

---

## Example: BeautifulSoup

```python
from bs4 import BeautifulSoup

soup = BeautifulSoup(html, "lxml")
products = []
for card in soup.select(".product-card"):
    products.append({
        "title": card.select_one(".title").get_text(strip=True),
        "price": card.select_one(".price").get_text(strip=True),
    })
```

Handle missing elements: use `select_one` and check for None before `.get_text()`.

---

## Example: Playwright

```python
items = await page.locator(".product").all_inner_texts()
# Or structured:
data = []
for i in range(await page.locator(".product").count()):
    el = page.locator(".product").nth(i)
    data.append({
        "title": await el.locator(".title").inner_text(),
        "price": await el.locator(".price").inner_text(),
    })
```

Locators auto-wait. Good for dynamic content.

---

## Validation

- **Schema** — Use Pydantic or jsonschema to validate extracted dicts.
- **Required fields** — Ensure they exist. Default or skip when missing.
- **Types** — Parse price strings to float. Handle "from $X", "N/A".
- **Sanity** — Price > 0, date in valid range.

---

## Summary

Use BeautifulSoup or lxml for static HTML. Use Playwright for dynamic. Prefer stable selectors. Validate output with schema. Handle missing elements and edge cases.

---

**Further reading:** [Scraping Dynamic Websites with Python](/en/blog/scraping-dynamic-websites-python) · [Structured Data Extraction with AI](/en/blog/structured-data-extraction-ai) · [Python Web Scraping Best Practices](/en/blog/python-web-scraping-best-practices)
