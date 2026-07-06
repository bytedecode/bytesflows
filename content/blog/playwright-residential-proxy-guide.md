---
title: "Playwright Proxy Guide: Rotating and Sticky Residential Sessions"
metaTitle: "Playwright Proxy Guide: Rotating vs Sticky Sessions"
metaDescription: "Set up residential proxies in Playwright with rotating IPs, sticky sessions, context isolation, 407 troubleshooting, and bandwidth controls."
slug: playwright-residential-proxy-guide
summary: "A production-focused Playwright proxy guide for teams running SERP checks, marketplace monitoring, QA evidence capture, and AI browser agents with rotating or sticky residential sessions."
category: "Web Scraping & Engineering"
tags: ["Playwright", "browser automation", "TypeScript", "residential proxy", "sticky session"]
language: en
status: Published
coverImage: "https://images.unsplash.com/photo-1618401471353-b98aedd04e11?auto=format&fit=crop&q=80&w=2000"
---

Playwright proxy problems usually appear as one of four symptoms: `407 Proxy Authentication Required`, every browser worker sharing the same IP, a sticky session changing halfway through a flow, or a proxy bill that jumps after moving from HTTP requests to full Chromium.

This guide focuses on those real production problems. It shows how to configure rotating and sticky residential proxies in Playwright, how to isolate sessions per `BrowserContext`, how to debug 407 errors, and how to keep bandwidth under control when every page load pulls dozens of assets.

The examples use BytesFlows' residential gateway:

```text
host: p1.bytesflows.com
port: 8001
protocol: http
username pattern: sub-user-loc-us-session-worker01-time-30
password: residential proxy sub-user password
```

For a quick connectivity check before running browser code, use [Proxy Test](https://bytesflows.com/tools/proxy-test). For plan sizing, keep [Pricing](https://bytesflows.com/pricing) and [Residential Proxy Cost Calculator](https://bytesflows.com/blog/residential-proxy-cost-calculator) open.

---

## When Playwright Actually Needs Residential Proxies

Do not start with Playwright just because a page is difficult. A browser is the most expensive extraction layer because it downloads scripts, styles, images, fonts, trackers, and background API calls.

| Workload | Better first option | Use Playwright with residential sessions when |
| :--- | :--- | :--- |
| Public JSON API | Python `httpx` or Node HTTP client | The API response depends on browser cookies or client-side state. |
| Static HTML | `requests`, `httpx`, Cheerio, or BeautifulSoup | Important data is generated after JavaScript execution. |
| SERP snapshot | Lightweight HTTP first | You need rendered layout evidence or country-specific browser behavior. |
| Marketplace price check | Direct HTML/API first | The page requires browser state, shipping region, or multi-step navigation. |
| AI browser agent | Playwright | The workflow needs evidence capture, screenshots, or page interaction. |

Playwright's official docs cover proxy configuration and network controls at [playwright.dev/docs/network](https://playwright.dev/docs/network). Browser contexts are documented at [playwright.dev/docs/browser-contexts](https://playwright.dev/docs/browser-contexts).

---

## Rotating vs Sticky Sessions

Use rotating sessions when each page is independent. Use sticky sessions when the target workflow has state.

| Mode | What changes | Best for | Risk if misused |
| :--- | :--- | :--- | :--- |
| Rotating residential IP | A fresh route can be assigned between requests or contexts | SERP checks, product list scans, ad placement checks | Multi-step flows can lose state. |
| Sticky residential session | Same route is held for a session window | Login checks, carts, forms, browser agents | Too many long sessions can tie up routes and increase idle traffic. |
| Country-targeted route | Route is filtered to a country | Local SERP and marketplace data | Smaller pool, often higher p95 latency. |
| City-targeted route | Route is filtered to a city | Local ads, shipping estimates, regional QA | Smaller pool and stricter fallback behavior. |

For country-specific checks, validate the final route on the relevant location page such as [United States](https://bytesflows.com/locations/united-states), [United Kingdom](https://bytesflows.com/locations/united-kingdom), [Germany](https://bytesflows.com/locations/germany), or [Japan](https://bytesflows.com/locations/japan).

---

## Setup: Environment Variables

Keep credentials out of source code. Use sub-user credentials from the residential proxy dashboard, not your main account password.

```bash
export BF_PROXY_SERVER="http://p1.bytesflows.com:8001"
export BF_PROXY_USER="your-sub-user-loc-us"
export BF_PROXY_PASS="your-residential-proxy-password"
export TARGET_URL="https://httpbin.org/ip"
```

If the password contains special characters, avoid embedding it inside a single proxy URL. Use Playwright's structured `server`, `username`, and `password` fields instead.

---

## Option A: Rotating Residential Proxy per Browser

This is the simplest setup. Every page in the browser uses the same proxy gateway credentials. It is useful for quick tests and small independent jobs.

```typescript
import { chromium } from "playwright";

const proxy = {
  server: process.env.BF_PROXY_SERVER ?? "http://p1.bytesflows.com:8001",
  username: process.env.BF_PROXY_USER ?? "your-sub-user-loc-us",
  password: process.env.BF_PROXY_PASS ?? "your-password",
};

const targetUrl = process.env.TARGET_URL ?? "https://httpbin.org/ip";

const browser = await chromium.launch({
  headless: true,
  proxy,
});

try {
  const page = await browser.newPage();
  await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
  console.log(await page.textContent("body"));
} finally {
  await browser.close();
}
```

Use this mode when each page can be collected independently. For multi-step workflows, use context-level sticky sessions instead.

---

## Option B: Sticky Residential Session per Browser Context

Most production teams should isolate proxy state at the `BrowserContext` level. One Chromium process can host multiple independent contexts, and each context can carry its own sticky session.

```typescript
import { chromium, type BrowserContext } from "playwright";

function buildStickyUser(workerId: number, country = "us") {
  const session = `worker${workerId}_${Date.now()}`;
  return `your-sub-user-loc-${country}-session-${session}-time-30`;
}

async function newStickyContext(workerId: number): Promise<BrowserContext> {
  const browser = await chromium.launch({ headless: true });

  return await browser.newContext({
    proxy: {
      server: process.env.BF_PROXY_SERVER ?? "http://p1.bytesflows.com:8001",
      username: buildStickyUser(workerId, "us"),
      password: process.env.BF_PROXY_PASS ?? "your-password",
    },
    viewport: { width: 1365, height: 900 },
    locale: "en-US",
    timezoneId: "America/New_York",
  });
}

const context = await newStickyContext(1);
const page = await context.newPage();

try {
  await page.goto("https://httpbin.org/ip", { waitUntil: "domcontentloaded", timeout: 30_000 });
  const first = await page.textContent("body");

  await page.goto("https://httpbin.org/headers", { waitUntil: "domcontentloaded", timeout: 30_000 });
  const second = await page.textContent("body");

  console.log({ first, second });
} finally {
  await context.close();
  await context.browser()?.close();
}
```

The point is not only to keep an IP stable. The point is to keep the same network route aligned with cookies, local storage, viewport, locale, and timezone for that specific workflow.

---

## Production Pattern: One Browser, Many Isolated Contexts

Launching one Chromium process per URL wastes CPU and memory. A more stable pattern is one browser process, multiple contexts, and a bounded concurrency queue.

```typescript
import { chromium, type Browser } from "playwright";

type Job = {
  url: string;
  country: "us" | "gb" | "de" | "jp";
  workerId: number;
};

function proxyUsername(job: Job) {
  return `your-sub-user-loc-${job.country}-session-job${job.workerId}-time-20`;
}

async function runJob(browser: Browser, job: Job) {
  const context = await browser.newContext({
    proxy: {
      server: "http://p1.bytesflows.com:8001",
      username: proxyUsername(job),
      password: process.env.BF_PROXY_PASS ?? "your-password",
    },
  });

  const page = await context.newPage();

  try {
    await page.route("**/*", (route) => {
      const type = route.request().resourceType();
      if (["image", "media", "font"].includes(type)) return route.abort();
      return route.continue();
    });

    await page.goto(job.url, { waitUntil: "domcontentloaded", timeout: 30_000 });
    return {
      url: job.url,
      title: await page.title(),
      ok: true,
    };
  } catch (error) {
    return {
      url: job.url,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    await context.close();
  }
}

const browser = await chromium.launch({ headless: true });

try {
  const jobs: Job[] = [
    { url: "https://example.com", country: "us", workerId: 1 },
    { url: "https://example.com", country: "gb", workerId: 2 },
  ];

  const results = await Promise.all(jobs.map((job) => runJob(browser, job)));
  console.log(results);
} finally {
  await browser.close();
}
```

This pattern solves three common problems:

1. contexts do not share cookies or local storage;
2. sticky sessions stay attached to the workflow that needs them;
3. the browser process is reused instead of restarted for every page.

---

## Diagnosing 407 Proxy Authentication Required

`407 Proxy Authentication Required` means the proxy gateway asked for valid credentials and did not receive credentials it could accept. MDN documents the status code at [HTTP 407](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/407) and the related header at [Proxy-Authorization](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Proxy-Authorization).

| Cause | How it appears | Fix |
| :--- | :--- | :--- |
| Password was placed inside a raw URL and contains `@`, `:` or `#` | Playwright never sends the intended password | Use `server`, `username`, and `password` fields. |
| Wrong credential source | Main account login works on the dashboard but fails in proxy traffic | Use residential proxy sub-user credentials from `dashboard/proxies/residential`. |
| Unsupported location token | 407 or route fallback after adding city/state text | Start with country-level `-loc-us`; add city only after confirming syntax. |
| Too much concurrency | Some workers fail while low-concurrency tests pass | Lower worker count and add a queue. |
| Secret accidentally includes whitespace | Credentials work when manually typed but fail in CI | Trim environment variables before passing them to Playwright. |

Use this local diagnostic before debugging the whole browser job:

```bash
curl -sS -x "http://p1.bytesflows.com:8001" \
  -U "$BF_PROXY_USER:$BF_PROXY_PASS" \
  -o /dev/null \
  -w "status=%{http_code} total=%{time_total}s\n" \
  --max-time 12 \
  "https://httpbin.org/ip"
```

If this fails, fix credentials before touching Playwright code.

---

## Reducing Browser Bandwidth

Browser traffic is where proxy costs surprise teams. A page that is 180 KB as raw HTML can become 3-6 MB when Chromium downloads scripts, images, fonts, and analytics requests.

### Block Heavy Resources

```typescript
await page.route("**/*", (route) => {
  const request = route.request();
  const type = request.resourceType();
  const url = request.url();

  if (["image", "media", "font"].includes(type)) {
    return route.abort();
  }

  if (url.includes("google-analytics.com") || url.includes("doubleclick.net")) {
    return route.abort();
  }

  return route.continue();
});
```

Do not block scripts blindly. Many modern sites render critical content through JavaScript. Start by blocking images, media, fonts, and known analytics endpoints; then compare extracted data quality.

### Use `domcontentloaded` for Data Pages

```typescript
await page.goto(targetUrl, {
  waitUntil: "domcontentloaded",
  timeout: 30_000,
});
```

`networkidle` can wait for background requests that are irrelevant to extraction. For many monitoring jobs, `domcontentloaded` is a better budget control.

### Measure Transferred Bytes

```typescript
let bytes = 0;

page.on("response", async (response) => {
  const headers = response.headers();
  const length = Number(headers["content-length"] ?? 0);
  if (Number.isFinite(length)) bytes += length;
});

await page.goto(targetUrl, { waitUntil: "domcontentloaded" });
console.log({ estimatedBytes: bytes, estimatedMB: (bytes / 1024 / 1024).toFixed(2) });
```

Use the result in the [cost calculator](https://bytesflows.com/blog/residential-proxy-cost-calculator).

---

## Troubleshooting Playwright Proxy Runs

| Symptom | Likely root cause | Fix |
| :--- | :--- | :--- |
| `net::ERR_TUNNEL_CONNECTION_FAILED` | Proxy CONNECT tunnel failed before the target request | Test with cURL, verify proxy credentials, lower concurrency. |
| 407 in Playwright but not cURL | Credentials are parsed differently | Use structured proxy fields; do not inline password in URL. |
| Same IP across workers | Proxy configured at browser level instead of context/session level | Build unique sticky usernames per context. |
| Sticky session changes mid-flow | Session window too short or context recreated | Increase `time`, keep the same context for the whole workflow. |
| Browser cost is much higher than expected | Assets and background APIs are loaded through the proxy | Block media/fonts, shorten waits, and measure bytes. |
| Target country is wrong | Location token or target IP database mismatch | Start with country route, verify with [Proxy Test](https://bytesflows.com/tools/proxy-test), then add city. |

---

## Who This Setup Is For

This setup is a good fit for:

1. SEO teams capturing localized SERP evidence for [rank tracking](https://bytesflows.com/solutions/seo);
2. marketplace monitoring teams checking region-specific price and availability;
3. QA teams validating country-specific user journeys;
4. AI browser agents that need screenshots, DOM state, and traceable evidence;
5. developers who need session-level control rather than a black-box scraping API.

It is not the right fit for:

1. static APIs where datacenter IPs are accepted;
2. bulk file downloads;
3. pages where data is already available in a public feed;
4. workflows that require one permanent allowlisted IP;
5. teams that cannot log and monitor retry cost.

For network choice, compare [Residential vs Datacenter Proxies](https://bytesflows.com/compare/residential-vs-datacenter). For trial sizing, start with [1GB free traffic on Pricing](https://bytesflows.com/pricing).

---

## FAQ

### Can Playwright use a different proxy per page?

Playwright proxy configuration is normally applied at browser launch or browser context creation. For production isolation, use one `BrowserContext` per workflow and assign a proxy session to that context.

### Why do I get 407 only at high concurrency?

High concurrency can expose account limits, sub-user limits, or connection spikes that a one-request test does not hit. Lower concurrency, add a queue, and verify the same credentials with cURL.

### Should sticky sessions be long or short?

Use the shortest window that covers the workflow. Ten to thirty minutes is usually enough for product checks, forms, carts, and evidence capture. Longer windows can waste residential routes when workers sit idle.

### Does a residential proxy fix browser fingerprint issues?

No. A proxy changes the network route. Playwright still needs sensible browser configuration, realistic locale/timezone alignment, and careful request behavior. Treat IP quality and browser behavior as separate layers.

### Should I block CSS?

Sometimes. Blocking CSS reduces transfer size, but it can break layout-dependent selectors and visual evidence. Block images, media, and fonts first; block CSS only after confirming the extracted data is still correct.

### Where should I test a session before production?

Start with [Proxy Test](https://bytesflows.com/tools/proxy-test), run a cURL credential check, then run one Playwright context against your actual target. After the session is stable, scale to a bounded worker pool.
