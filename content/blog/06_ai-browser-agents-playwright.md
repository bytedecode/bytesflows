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

AI browser agents use an LLM to decide what to do in a browser—click, type, navigate, extract—while Playwright executes those actions. This creates autonomous workflows: research, form filling, data extraction, and more. But when agents run at scale, they face the same problem as traditional scrapers: IP blocking. This guide covers how to add proxies and anti-detection so your agents run reliably.

---

## How AI Browser Agents Work

Typical architecture:

1. **LLM** receives a task (e.g. "Find the price of X on site Y").
2. **Agent loop:** LLM proposes an action (goto, click, type, extract). Playwright performs it.
3. **Page state** (HTML, screenshot, or structured data) goes back to the LLM.
4. Loop continues until the task is done.

Playwright is the execution layer. It’s stable, well-documented, and handles real browsers. The agent logic (prompts, tool use, planning) sits on top.

---

## Why Agents Need Proxies

When many agents run from one server, they share one IP. That IP makes hundreds or thousands of requests. Anti-bot systems detect this quickly: 403s, CAPTCHAs, or session invalidations.

Proxies solve this by routing each agent (or each browser instance) through a different IP. Residential proxies are best for strict targets—they look like real users and pass anti-bot checks far more often than datacenter IPs.

---

## Proxy Setup for Agent Browsers

Each agent run should use its own browser, and thus its own proxy/IP. With a rotating gateway, each `browser.launch()` gets a new IP automatically.

```python
from playwright.sync_api import sync_playwright

PROXY = "http://user:pass@p1.bytesflows.com:8001"

def run_agent_task(task_description):
    with sync_playwright() as p:
        browser = p.chromium.launch(proxy={"server": PROXY})
        context = browser.new_context()
        page = context.new_page()
        # Agent loop: LLM suggests actions, Playwright executes
        # ... your agent logic
        browser.close()
```

If you run multiple agents in parallel (e.g. 10 concurrent tasks), each gets its own browser and thus its own IP from the rotation.

---

## When to Use Sticky vs. Rotating

**Rotating:** Each new task gets a new IP. Best when tasks are independent (e.g. "get price from site A," "get price from site B").

**Sticky:** Same IP for the whole task. Required when the task involves login, multi-step checkout, or anything that depends on session cookies. If the IP changes mid-task, the session may break.

For most agent workflows, rotating is fine. For login flows or account-based automation, switch to sticky and pass a session ID in the proxy config.

---

## Anti-Detection for Agents

Agents can trigger detection in two ways: too many requests (rate/IP) and behavior that looks robotic (timing, patterns).

**1. Add delays between actions.** After each Playwright action, wait 1–3 seconds (with jitter). Don’t let the agent click through pages at machine speed.

**2. Cap concurrency.** Don’t run 50 agents against the same domain at once. Start with 3–5 and increase only if success rates stay high.

**3. Realistic viewports and user agents.** Set `page.set_viewport_size({"width": 1920, "height": 1080})` and use consistent, modern user agents.

**4. Handle failures.** On 403, CAPTCHA, or timeout, close the browser and retry with a new one (new IP). Don’t retry the same IP immediately.

---

## Scaling Agent Workloads

As you add more agents:

- **Proxy pool size** must grow with concurrency. More agents = more simultaneous browsers = more IPs needed.
- **Per-domain concurrency** still applies. Even with 100 IPs, 30 agents hitting the same site can trigger blocks.
- **Monitor** success rate and block rate. If they degrade, slow down or add more proxy capacity.

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
        # Simplified: in reality, LLM would decide selectors/actions
        price = page.query_selector(".price").inner_text()
        browser.close()
    return price
```

Each call uses a new browser and a new IP. The random delay reduces pattern-based detection.

---

## Summary

1. AI browser agents = LLM + Playwright. Proxies prevent IP blocking when scaling.
2. Use one browser per task; with a rotating gateway, each gets a new IP.
3. Add delays between actions and cap concurrency per domain.
4. Use sticky sessions for login or multi-step flows.
5. Monitor success and block rates as you scale.

👉 **Try BytesFlows Residential Proxies** — rotation and sticky modes for agent workloads.

---

**Further reading:** [Playwright Proxy Setup](/en/blog/playwright-proxy-setup) · [Avoid IP Bans in Web Scraping](/en/blog/avoid-ip-bans-web-scraping) · [Scraping Data at Scale](/en/blog/scraping-data-at-scale)
