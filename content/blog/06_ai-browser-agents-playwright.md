---
title: "AI Browser Agents with Playwright"
slug: "ai-browser-agents-playwright"
summary: "Build and run AI browser agents with Playwright: proxy setup, anti-detection, and scaling strategies for autonomous web automation in 2026."
category: "AI & Automation"
tags: ["AI agents", "Playwright", "Browser automation", "Residential proxy", "Web scraping"]
language: "en"
coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=2000"
---

## AI Browser Agents with Playwright

AI browser agents combine an LLM with browser automation: the LLM decides what to do (navigate, click, type, extract), and Playwright executes those actions. This creates autonomous workflows—research, form filling, data extraction—without hand-written selectors for every page. But when agents run at scale, they hit the same problem as traditional scrapers: IP blocking. This guide covers how to add proxies and anti-detection so your agents run reliably.

---

## A Scenario: Why Agents Need Proxies

You've built an agent that researches products across five e-commerce sites. It works perfectly for 10 tasks. When you run 100 tasks in parallel from your server, you start getting 403s after 20–30. The sites see one IP making hundreds of requests and block it.

Proxies fix this by routing each agent (or each browser) through a different IP. With a rotating residential gateway, each `browser.launch()` gets a new IP. 100 agents = up to 100 different IPs. The sites see distributed traffic instead of one overloaded address. Success rate jumps from 20% to 95%+. The agent logic doesn't change—only the network layer.

---

## How AI Browser Agents Work

Typical architecture:

1. **LLM** receives a task (e.g. "Find the price of product X on site Y").
2. **Agent loop:** LLM proposes an action (goto, click, type, extract). Playwright performs it.
3. **Page state** (HTML, screenshot, or structured data) goes back to the LLM.
4. Loop continues until the task is done or a stopping condition is met.

Playwright is the execution layer. It's stable, handles real browsers, and supports proxies natively. The agent logic (prompts, tool use, planning) sits on top. You integrate the proxy at browser launch—everything else stays the same.

---

## Proxy Setup for Agent Browsers

Each agent run should use its own browser. With a rotating gateway, each browser gets a new IP automatically.

```python
from playwright.sync_api import sync_playwright

PROXY = "http://user:pass@gateway.example.com:8001"

def run_agent_task(task_description):
    with sync_playwright() as p:
        browser = p.chromium.launch(proxy={"server": PROXY})
        context = browser.new_context()
        page = context.new_page()
        page.set_viewport_size({"width": 1920, "height": 1080})
        # Agent loop: LLM suggests actions, Playwright executes
        # ... your agent logic
        browser.close()
```

If you run 10 agents in parallel, each gets its own browser and thus its own IP. No code changes needed in the agent loop—just ensure each task uses `launch()` separately.

---

## When to Use Sticky vs. Rotating

**Rotating** — Each new task gets a new IP. Best when tasks are independent: "get price from site A," "get price from site B," "extract data from site C." No session continuity needed.

**Sticky** — Same IP for the whole task. Required when the task involves login, multi-step checkout, or anything that depends on session cookies. If the IP changes mid-task, the site may invalidate the session.

**Decision:** Does your agent need to stay logged in or complete a multi-step flow? → Sticky. Otherwise → Rotating.

For most agent workflows (research, extraction, one-off tasks), rotating is fine. For login flows or account-based automation, switch to sticky and pass a session ID in the proxy config per your provider's format.

---

## Anti-Detection for Agents

Agents can trigger detection in two ways: request volume (too many from one IP) and behavior (robotic timing).

**1. Add delays between actions.** After each Playwright action (click, type, goto), wait 1–3 seconds with jitter. Don't let the agent click through pages at machine speed. Use `page.wait_for_timeout(random.randint(1000, 3000))` between actions.

**2. Cap concurrency per domain.** Don't run 50 agents against the same site at once. Start with 3–5. Even with 100 IPs, 30 coordinated agents on one domain can trigger rate limits.

**3. Realistic viewports and user agents.** Set `page.set_viewport_size({"width": 1920, "height": 1080})` and use consistent, modern user agents. Mismatches trigger checks.

**4. Handle failures.** On 403, CAPTCHA, or timeout, close the browser and retry with a new one (new IP). Don't retry the same IP immediately. Add exponential backoff between retries.

---

## Example: Simple Agent with Proxy

```python
import random
from playwright.sync_api import sync_playwright

def agent_extract_price(url, product_name):
    with sync_playwright() as p:
        browser = p.chromium.launch(proxy={"server": PROXY})
        page = browser.new_page()
        page.set_viewport_size({"width": 1920, "height": 1080})
        page.goto(url)
        page.wait_for_timeout(random.randint(2000, 5000))
        el = page.query_selector(".price")
        price = el.inner_text() if el else ""
        browser.close()
    return price
```

Each call uses a new browser and a new IP. The random delay reduces pattern-based detection. In a full agent, the LLM would decide the selector or extraction logic; the proxy setup is the same.

---

## Scaling Agent Workloads

As you add more agents:

- **Proxy pool size** must grow with concurrency. 20 agents = at least 20 IPs in rotation. For strict targets, aim for 1–5 requests per IP per minute.
- **Per-domain concurrency** still applies. Cap how many agents hit the same domain at once. Use a semaphore or rate limiter if needed.
- **Monitor** success rate and block rate. If they degrade, slow down (add delays, reduce concurrent agents) or add more proxy capacity.

---

## Troubleshooting

**"Agents work alone, fail when parallel"** — One IP is overloaded. Ensure each agent uses its own browser (own `launch()`). Don't share a browser across agents.

**"403 or CAPTCHA after a few tasks"** — Likely IP or behavior. Use residential proxies (not datacenter). Add more delays between actions. Reduce concurrent agents per domain.

**"Session lost mid-task"** — You need sticky, not rotating. For login or multi-step flows, add session ID to proxy config. Check provider docs for format.

**"Inconsistent results"** — Some IPs in the pool may have lower reputation. Implement retries with new browser (new IP) on failure. Track which tasks fail and whether they succeed on retry.

---

## Summary

1. AI browser agents = LLM + Playwright. Proxies prevent IP blocking when scaling.
2. Use one browser per task; with a rotating gateway, each gets a new IP.
3. Add delays between actions and cap concurrency per domain.
4. Use sticky sessions for login or multi-step flows.
5. Monitor success and block rates; scale proxy pool with agent count.

---

**Further reading:** [Playwright Proxy Setup](/en/blog/playwright-proxy-setup) · [Avoid IP Bans in Web Scraping](/en/blog/avoid-ip-bans-web-scraping) · [Scraping Data at Scale](/en/blog/scraping-data-at-scale)
