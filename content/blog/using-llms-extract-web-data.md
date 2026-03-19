---
title: "Using LLMs to Extract Web Data (2026)"
slug: "using-llms-extract-web-data"
summary: "The 2026 developer's blueprint for using LLMs in web scraping. Master the art of automated data extraction and parsing using advanced AI agents and residential proxy networks."
category: "AI & Automation"
tags: ["AI Scraping", "Web Scraping"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&q=80&w=2000"
---

## When Selectors Break on Every Layout Change

You scrape 50 sites; each has different HTML structure. Maintaining 50 XPath or CSS selectors is painful. Layout changes break parsers. You want one system that adapts. **LLMs can extract structured data from HTML** without hand-written selectors, as long as you provide clear instructions and a schema.

This guide covers when to use LLMs for extraction, a minimal pipeline, and how to avoid common pitfalls.

## Problem → Cause → Solution

| Problem | Cause | Solution |
|---------|-------|----------|
| Layout changes break selectors | Sites redesign HTML | LLM extracts by meaning, not structure |
| Inconsistent formats across sites | Each site different | One LLM prompt, many sites |
| Messy or nested HTML | Hard to parse with rules | LLM tolerates noise, returns JSON |
| High token cost at scale | Sending full HTML to API | Trim HTML, use small/fast models |

## When to Use LLMs vs Selectors

| Scenario | Prefer |
|----------|--------|
| One site, stable structure | CSS/XPath selectors (cheaper, faster) |
| Many sites, different layouts | LLM extraction |
| High volume, low budget | Selectors or hybrid (LLM only for fallback) |
| Unstructured text, tables, lists | LLM or specialized parsers |

## Minimal Pipeline: Fetch → Trim → Extract

```python
import requests
from bs4 import BeautifulSoup
import openai  # or anthropic, etc.

def fetch_and_extract(url: str) -> dict:
    r = requests.get(url, headers={"User-Agent": "Mozilla/5.0 ..."})
    soup = BeautifulSoup(r.text, "html.parser")
    # Keep only main content, limit tokens
    for tag in soup(["script", "style", "nav", "footer"]):
        tag.decompose()
    text = soup.get_text(separator="\n", strip=True)[:8000]
    
    prompt = f"""Extract product info from this HTML text. Return JSON: title, price, description.
    
Text:
{text}
"""
    resp = openai.ChatCompletion.create(model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}])
    import json
    return json.loads(resp.choices[0].message.content)
```

For production: add retries, schema validation, and optional proxy rotation for fetch step.

## Validation and Troubleshooting

| Issue | Check |
|-------|-------|
| LLM returns invalid JSON | Add "Return valid JSON only" to prompt; parse with try/except |
| Missed fields | Refine prompt; show 1–2 examples |
| Too expensive | Trim HTML aggressively; use smaller/faster models |
| Fetch blocked | Add residential proxies to the HTTP client |

## Further Reading

- [Structured data extraction with AI](/en/blog/structured-data-extraction-ai)
- [AI data extraction vs traditional scraping](/en/blog/ai-data-extraction-vs-traditional-scraping)
- [Using proxies with Python scrapers](/en/blog/using-proxies-python-scrapers)
