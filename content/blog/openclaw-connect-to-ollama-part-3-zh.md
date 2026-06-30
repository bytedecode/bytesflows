---
title: 连接 OpenClaw 与 Ollama：本地 AI Agent 链路实战
metaTitle: 连接 OpenClaw 与 Ollama：本地 AI Agent 链路实战
metaDescription: 一步步讲清如何把 OpenClaw 接入本地 Ollama，包括 Provider 配置、默认模型设置、端到端测试与常见问题排查。
slug: openclaw-connect-to-ollama-part-3
summary: 一篇实战型中文指南，讲清如何把 OpenClaw 接入本地 Ollama，包括 Provider 配置、默认模型设置、端到端测试与常见问题排查。
category: artificial-intelligence
tags: []
language: zh
status: Draft
coverImage: "https://prod-files-secure.s3.us-west-2.amazonaws.com/1b86c8d6-c558-42ad-ac16-ce995d98cd79/667b8d7f-c8c1-4b13-a516-7faf4bc1ec64/ChatGPT_Image_2026%E5%B9%B43%E6%9C%8817%E6%97%A5_17_10_42.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB4663MIAMQSA%2F20260630%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260630T113727Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEPv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJHMEUCIA9M4trPgLx2RO7pgvj%2Bfamk8ZsTBwMkmmfZBaH97%2F4aAiEAgI7WpLJg5m0%2Fie%2BKwHKj6FP3muts2H8S9p8%2BgY0%2BeAAqiAQIw%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw2Mzc0MjMxODM4MDUiDHb4drhiNcPxQExtKCrcA9cNM4RI2%2F4yLmDJ%2FyxXPQ4CcOH%2B9U8D0I9h6sxfQChn0gbw1ZZC6BXdrkUL0oOPa0IdpfcWgpxF8so461aBqyZgquCWqYQh3x36TKPhxUtxp9e7l%2FwIOn3p9wcAUDQZMZFNHPJOTvyHxWSa4JoMDRZL65tov3CNA%2FIGtAsfifJkaxbYxQnm456BQf8KoM9Nd39usvJnoRYHtc6rJMx3pqclHweOqnKeI6CCziZ%2BxoHhJh06nl4WTgfZnLwMeP2SfbBit0b0Q7K%2FzlZ%2B4Oo5I65RNYSAM4loDsTDEN7zqXXnrrXrtNkFoWHIVquMXM8OHf%2F9KrX2MsxmYFq9%2FlBeEM%2BkBjk8gQ6Ew1oqarz712VAFsZwrYS%2F935iCeI0rU9s%2FZwohooztOvmZ%2B%2BVjrxyK8%2ByV2cEr2iys5zYcuHesKFWosKv5pa17VnIrKeee8raCdW%2BUwxG2gr0XI762Mo2CovH4CRRO5tISnkQAankE%2F9j5n7Yto1c3be8AX3BEJ%2BfiUtmkIU5FsFmgZPRhtdtk5f3GDrQ8MqYKTKNRXGdXO8BxYvoSklIryjt01lhHJ%2BMQqsUMROj6cDIq6TbIHjjUuqu3VlfpJpspYOuZmLD1Wg9vHRDUEbc60IS9e3%2BMIO0jtIGOqUBI3IEa00v8mTGqwiD1knCkKiFGy%2Flm3rfkaN%2FsR77bt9yho5MR09WBSnBesg%2ByqzN0gRk22brIzZg3sDyf1RAqBFkF5QLZZ1%2Bil%2F7oCCJBl0Ubptm2I%2BWxpZTwxbOyWX1gAQILRZdDcgra%2BpsEyDJ5fjAqS8P%2BU03nO0VyNUJHTsS6QtkN%2BQH1K2i9BhWSvi7dxLcQ8gndB1hQkCRYGzmP%2FjHSCx%2B&X-Amz-Signature=39e480d8d8d5d453e88b133f8db84f578987f45dd9f441f57f844a08bd506dd4&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject"
---

当 Ollama 和 OpenClaw 都已经安装完成后，真正的关键步骤才开始：把两者正确接起来，让 OpenClaw 能稳定调用本地模型。
这一步如果配置清楚，后续的 Agent、工具调用和本地自动化都会顺畅很多。如果这里配置混乱，后面的大多数问题都会变成“明明启动了，但就是跑不通”。
这篇文章重点解决三个问题：
- 如何确认 Ollama 的服务地址和模型名
- 如何在 OpenClaw 中正确配置 Provider
- 如何做一次端到端验证，确认本地链路真的打通
建议配合阅读：[Ubuntu 安装 Ollama：本地运行 OpenClaw 的第一步](https://bytesflows.com/zh/blog/openclaw-local-ollama-setup-part-1)、[Ubuntu 安装 OpenClaw：本地 AI 工作流第二步](https://bytesflows.com/zh/blog/openclaw-installation-on-ubuntu-part-2)。
## 开始前先确认 4 件事
在改配置之前，先确认下面这些前提已经满足：
- Ollama 服务已经启动并可访问
- 目标模型已经拉取到本地
- OpenClaw 已经能正常启动
- 你清楚 OpenClaw 该连接哪个 Ollama 地址
这一步很重要，因为很多“配置错误”其实根本不是配置问题，而是服务没启动或模型没装好。
## 第一步：确认 Ollama Endpoint
本地部署时，Ollama 常见地址一般是：
- `http://127.0.0.1:11434/v1`
- `http://192.168.x.x:11434/v1`
关键不是照抄某个示例，而是确认这个地址和你真实的运行环境一致。OpenClaw 需要连到能访问的实际 Endpoint，而不是“看起来像对的地址”。
## 第二步：在 OpenClaw 中配置 Provider
接下来修改 `~/.openclaw/openclaw.config`，让 OpenClaw 知道：
- Provider 名称是什么
- `baseUrl` 指向哪里
- 使用哪个模型 ID
- 兼容哪种 API 格式
一个常见写法如下：
```json
models: {
  mode: 'merge',
  providers: {
    ollama: {
      baseUrl: 'http://192.168.10.20:11434/v1',
      apiKey: 'ollama-local',
      api: 'openai-completions',
      models: [
        {
          id: 'qwen2.5:14b',
          name: 'Qwen-14b',
          api: 'openai-completions'
        }
      ]
    }
  }
}
```
真正决定成败的通常是三件事：地址对不对、模型名对不对、Provider 路径对不对。
## 第三步：设置默认模型路径
Provider 建好之后，还需要把默认 Agent 模型指向刚才配置的本地模型。也就是确认 OpenClaw 默认使用的模型路径，确实引用到了你本地 Ollama Provider 下的那个模型。
这一步建议先保持简单：
- 默认模型先只配一个
- 不要一开始就堆很多 Provider
- 并发参数也先保守
先跑通，再优化，比一开始就做复杂配置更稳。
## 第四步：做一次端到端验证
最直接的验证方式不是看配置文件，而是实际发一个简单问题，确认整个链路是否真的工作：
1. OpenClaw 正常启动
1. OpenClaw 把请求发给 Ollama
1. Ollama 调起本地模型
1. UI 中拿到正常返回
如果这 4 步都成立，说明本地 AI Agent 基础链路已经打通。
## 常见问题排查
### 连接失败
先确认 `ollama serve` 还在运行，并且 OpenClaw 所在环境能访问这个地址。
### 模型不存在
执行 `ollama list` 检查模型是否真的存在。若没有，再执行 `ollama pull` 拉取。
### 响应很慢
通常先看本机 CPU、内存和模型大小是否匹配。很多“配置问题”其实是硬件资源不足。
### 配置看起来没问题，但就是不生效
优先复查 Provider 名称、模型 ID、默认模型路径是否完全一致。路径只要有一个地方不匹配，就会出现“看起来对，实际上没连上”的情况。
## 结论
连接 OpenClaw 与 Ollama，本质上就是把“本地模型服务”和“本地 Agent 运行层”正确接起来。只要 Ollama 地址、模型 ID、Provider 配置和默认模型路径一致，绝大多数问题都能避免。
先把最小链路跑通，再去扩展工具调用、抓取能力和更复杂的 Agent 工作流，效率通常会高很多。
## 延伸阅读
- [Ubuntu 安装 Ollama：本地运行 OpenClaw 的第一步](https://bytesflows.com/zh/blog/openclaw-local-ollama-setup-part-1)
- [Ubuntu 安装 OpenClaw：本地 AI 工作流第二步](https://bytesflows.com/zh/blog/openclaw-installation-on-ubuntu-part-2)
- [OpenClaw 代理配置完整指南](https://bytesflows.com/zh/blog/openclaw-proxy-setup)
- [为什么 OpenClaw Agent 需要住宅代理](https://bytesflows.com/zh/blog/openclaw-residential-proxy)
- [OpenClaw 浏览器自动化与代理实践](https://bytesflows.com/zh/blog/openclaw-browser-automation-proxies)
