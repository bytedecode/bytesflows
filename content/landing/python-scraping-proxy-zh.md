---
title: "Python 抓取代理指南 | 住宅代理配置与实战"
slug: "python-scraping-proxy"
summary: "Python 抓取代理实战：面向 Requests、Scrapy、Playwright 的住宅代理配置方案，帮助你降低封禁并稳定规模化采集。"
category: "landing"
tags: ["Python 抓取", "Python 代理", "住宅代理", "爬虫代理", "Playwright 代理"]
language: "zh"
coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2000"
---

## Python + 住宅代理抓取

Python 依然是网页抓取最实用的语言，但线上稳定性往往取决于网络层而不只是解析代码。若你经常遇到 403、429 或挑战页，住宅代理通常是关键解法。

本页给你一条可落地路线：选对技术栈、配好代理、稳步扩容、快速排障。

### Requests 快速示例

```python
import requests

proxies = {
    "http": "http://user:pass@gateway:port",
    "https": "http://user:pass@gateway:port",
}

response = requests.get("https://example.com", proxies=proxies, timeout=30)
print(response.status_code)
```

### 先选对技术栈

| 栈 | 适用场景 | 说明 |
|---|---|---|
| Requests + BeautifulSoup | 静态 HTML 页面 | 上手快，但对 JS 站能力有限 |
| Scrapy | 大规模抓取任务 | 并发、重试、管线能力完整 |
| Playwright | JS 重站与高防站 | 真浏览器执行，挑战页通过率更高 |

对比阅读： [最佳 Python 抓取库](/zh/blog/best-python-libraries-web-scraping)、[Python 抓取指南](/zh/blog/python-web-scraping-guide)、[Playwright 教程](/zh/blog/playwright-web-scraping-tutorial)。

### Python 中住宅代理的工作方式

大多数服务商会给你一个网关地址和认证信息。客户端只需把流量发到网关，由网关决定出口 IP：

- **Rotating**：每次请求更换出口 IP
- **Sticky**：短时间保持同一出口 IP

该模型可用于 Requests、Scrapy、aiohttp、Playwright。延伸： [住宅代理提升抓取成功率](/zh/blog/residential-proxies-improve-scraping)、[代理轮换策略](/zh/blog/proxy-rotation-strategies)。

### 轮换模式怎么选

- 列表页/搜索页/广覆盖采集：优先 **Rotating**
- 登录态/购物车/多步骤流程：优先 **Sticky**
- 依赖会话 Cookie 的任务，避免过度轮换

### 如何扩容且不掉成功率

1. 从保守并发开始。
2. 持续记录成功率、挑战率、重试率。
3. 优先优化 backoff 与重试策略。
4. 再逐步增加 worker 数量。
5. 定期复核代理质量与地域覆盖。

规模化参考： [大规模抓取指南](/zh/blog/scraping-data-at-scale)、[如何避免 IP 封禁](/zh/blog/avoid-ip-bans-web-scraping)、[无头浏览器抓取指南](/zh/blog/headless-browser-scraping-guide)。

### 代理问题排障流程

当请求失败时，建议按顺序排查：

1. 核对出口 IP 与目标地域是否正确。
2. 对目标 URL 做小样本请求测试。
3. 检查 Header 与浏览器特征是否真实。
4. 若遇 JS 挑战页，从 Requests 切换到 Playwright。
5. 复核并发、重试、轮换与会话策略。

更多思路： [常见抓取挑战](/zh/blog/common-web-scraping-challenges)、[浏览器指纹详解](/zh/blog/browser-fingerprinting-explained)、[不被封抓取实践](/zh/blog/scrape-websites-without-getting-blocked)。

### Python 工具代理配置速查

| 工具 | 代理配置方式 |
|---|---|
| requests | `proxies={"http": "...", "https": "..."}` |
| Scrapy | downloader middleware 或 `request.meta["proxy"]` |
| Playwright | `launch(proxy={ server, username, password })` |
| aiohttp | 每请求传 proxy 或 session 级 connector |

### 实战建议

- 高防目标优先使用 [住宅代理](/zh/proxies)。
- 网络错误和解析错误分开记录，便于定位瓶颈。
- 把反爬对抗当作持续运营能力，而不是一次性配置。

### FAQ（Schema-Friendly Q&A）

Q: Python 抓取应该优先选哪个框架？  
A: 静态页面优先 Requests，规模化任务优先 Scrapy，JS 与高防场景优先 Playwright。

Q: Python requests 如何接入住宅代理？  
A: 在 `proxies` 字典中填写网关地址与认证信息，并传入 `requests.get()` 或 Session。

Q: 什么时候用轮换，什么时候用 Sticky？  
A: 无状态批量采集用轮换；登录态和多步骤交互用 Sticky。

Q: 已经上了代理为什么还是被封？  
A: 常见原因包括请求头不真实、并发过高、重试策略不当，或目标站要求浏览器执行而非纯 HTTP 请求。

### 更多资源

- [Python 抓取最佳实践](/zh/blog/python-web-scraping-guide)
- [动态网站抓取（Playwright）](/zh/blog/playwright-web-scraping-tutorial)
- [住宅代理提升抓取成功率](/zh/blog/residential-proxies-improve-scraping)
- [最佳网页抓取代理](/zh/blog/best-proxies-for-web-scraping)

### 转化 CTA

想把 Python 爬虫升级为可持续生产系统？从 [住宅代理](/zh/proxies) 开始，先验证通过率，再按业务量稳定扩容。

---

[获取 Python 抓取代理](/zh/proxies) · [Python 抓取指南](/zh/blog/python-web-scraping-guide) · [中文博客](/zh/blog)
