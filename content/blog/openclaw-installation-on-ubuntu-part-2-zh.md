---
title: Ubuntu 安装 OpenClaw：本地 AI 工作流第二步
metaTitle: Ubuntu 安装 OpenClaw：本地 AI 工作流第二步
metaDescription: 一步步讲清如何在 Ubuntu 安装 OpenClaw，包括 Node.js 准备、CLI 安装、本地控制台启动、Token 验证与常见问题排查。
slug: openclaw-installation-on-ubuntu-part-2
summary: 一篇实用的 Ubuntu 安装 OpenClaw 指南，涵盖 Node.js 准备、CLI 安装、本地控制台启动、Token 验证与常见问题排查。
category: "AI Agents & Automation"
tags: []
language: zh
status: Draft
coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2000"
---

在本地 AI 工作流里，Ollama 负责模型服务，而 OpenClaw 更像是工作流和交互层。只有把 OpenClaw 安装并启动好，后面接模型、接工具、跑 Agent 才有稳定入口。
这篇文章聚焦 Ubuntu 环境下最实用的一条路径：准备 Node.js、安装 OpenClaw、启动本地界面，并确认 Token 验证流程正常。
建议配合阅读：[Ubuntu 安装 Ollama：本地运行 OpenClaw 的第一步](https://bytesflows.com/zh/blog/openclaw-local-ollama-setup-part-1)、[连接 OpenClaw 与 Ollama：本地 AI Agent 链路实战](https://bytesflows.com/zh/blog/openclaw-connect-to-ollama-part-3)。
## 这一步安装完成后你应该具备什么
完成后，至少要达到下面几个状态：
- Node.js 运行环境可用
- OpenClaw CLI 已安装
- 本地控制台可打开
- Token 鉴权能正常通过
如果这几件事都完成，后面连接 Ollama 的时候就会顺畅很多。
## 第一步：先检查 Node.js
OpenClaw 依赖 Node.js，所以第一件事不是直接装 OpenClaw，而是先确认运行环境是否足够新。
Ubuntu 常见安装方式如下：
```bash
sudo apt update
sudo apt install -y nodejs npm
node -v
npm -v
```
如果版本太旧，建议先升级再继续。很多后续的依赖异常，本质上都和运行时版本有关。
## 第二步：安装 OpenClaw
环境确认没问题后，再安装 OpenClaw CLI：
```bash
npm install -g openclaw
openclaw --version
```
只要 `openclaw --version` 能正常返回，说明 CLI 安装层基本已经到位。
## 第三步：启动本地运行时
安装完成后，直接启动 OpenClaw：
```bash
openclaw
```
默认情况下，本地控制台一般会运行在：
```
http://localhost:3000
```
如果页面打不开，不要先怀疑 OpenClaw 本身，先看是不是端口冲突、进程没起来，或者本地环境有拦截。
## 第四步：正确处理 Token 验证
第一次打开页面时，浏览器要求输入 Token 是正常行为。这不是报错，而是本地鉴权的一部分。
更稳妥的处理方式通常是：
1. 保持 `openclaw` 进程持续运行
1. 查看本地配置或启动信息中的 Token
1. 把 Token 粘贴到浏览器的验证框中
这个 Token 属于本地鉴权信息，不适合出现在公开截图、日志或仓库里。
## 常见问题排查
### `openclaw` 命令找不到
一般是 npm 全局安装路径没有加入 PATH。
### 3000 端口被占用
先释放端口，或者调整运行端口设置。
### 浏览器反复要求 Token
先确认使用的是当前运行环境下的正确 Token，避免复制了旧值或带了空格。
### OpenClaw 启动了，但界面不稳定
优先检查 Node.js 版本、终端运行状态，以及本地环境是否有影响运行的配置问题。
## 为什么这一步不能跳过
很多人会把注意力都放在后面的模型接入上，但其实如果 OpenClaw 自己的运行层没有先装稳，后面所有接模型、接工具、跑 Agent 的问题都会更难排查。
所以这一步的价值，不只是“装好一个 CLI”，而是先把本地工作流入口稳定下来。
## 结论
Ubuntu 安装 OpenClaw 的重点，不只是安装成功，而是要确认本地运行时、控制台访问和 Token 鉴权这三层都正常。只要这一步稳了，后续接 Ollama、本地模型和自动化工作流都会简单很多。
先把入口装稳，再去接模型，通常是更省时间的顺序。
## 延伸阅读
- [Ubuntu 安装 Ollama：本地运行 OpenClaw 的第一步](https://bytesflows.com/zh/blog/openclaw-local-ollama-setup-part-1)
- [连接 OpenClaw 与 Ollama：本地 AI Agent 链路实战](https://bytesflows.com/zh/blog/openclaw-connect-to-ollama-part-3)
- [OpenClaw 代理配置完整指南](https://bytesflows.com/zh/blog/openclaw-proxy-setup)
- [OpenClaw 浏览器自动化与代理实践](https://bytesflows.com/zh/blog/openclaw-browser-automation-proxies)
- [为什么 OpenClaw Agent 需要住宅代理](https://bytesflows.com/zh/blog/openclaw-residential-proxy)
