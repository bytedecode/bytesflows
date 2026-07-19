---
title: Ubuntu 安装 Ollama：本地运行 OpenClaw 的第一步
metaTitle: Ubuntu 安装 Ollama：本地运行 OpenClaw 的第一步
metaDescription: 一步步讲清如何在 Ubuntu 安装 Ollama、启动本地服务、拉取模型并完成验证，为后续接入 OpenClaw 做准备。
slug: openclaw-local-ollama-setup-part-1
summary: 一篇实用的 Ubuntu 安装 Ollama 指南，涵盖本地服务启动、模型拉取、验证方法与常见排查思路。
category: "AI Agents & Automation"
tags: []
language: zh
status: Published
coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2000"
---

如果你想在本地跑通 OpenClaw + 大模型，第一步通常不是先配置 Agent，而是先把本地模型服务稳定起来。对大多数用户来说，Ollama 就是这条链路的起点。
这篇文章聚焦最实用的一条路径：在 Ubuntu 安装 Ollama、启动本地服务、拉取模型，并完成一次最小可用验证。先把本地推理层跑通，后续连接 OpenClaw 会顺畅很多。
建议配合阅读：Ubuntu 安装 OpenClaw：本地 AI 工作流第二步、连接 OpenClaw 与 Ollama：本地 AI Agent 链路实战。
## 为什么先装 Ollama
在这套本地工作流里，Ollama 承担的是模型服务层。把它装好之后，你会得到：
- 一个可访问的本地推理地址
- 一个已经拉取好的本地模型
- 一个可以被 OpenClaw 直接接入的本地 Provider 基础
如果这一层不稳定，后面接 Agent、接工具都会变得更难排查。
## 第一步：更新系统环境
先把基础环境整理干净，避免后面因为依赖或系统状态导致安装异常。
```bash
sudo apt update
sudo apt upgrade -y
```
这一步虽然简单，但能减少很多后续噪音问题。
## 第二步：安装 Ollama
在 Ubuntu 上，常见做法是直接使用官方安装脚本：
```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama --version
```
只要版本命令能正常返回，说明安装层通常已经没有问题。
## 第三步：启动本地服务
安装完成后，启动 Ollama：
```bash
ollama serve
```
默认情况下，本地服务一般监听在：
```
http://127.0.0.1:11434
```
你可以先用简单请求做一次可用性确认：
```bash
curl http://127.0.0.1:11434
```
先确认地址通，再进行模型拉取，排障会简单很多。
## 第四步：拉取模型
本地服务起来之后，再拉取你准备在 OpenClaw 中使用的模型，例如：
```bash
ollama pull qwen2.5:14b
ollama list
```
这里最重要的是确认模型 ID 和你后续配置里要使用的名字一致。
## 第五步：做一次最小验证
不要只看“服务启动了”，一定要实际跑一次模型：
```bash
ollama run qwen2.5:14b
```
输入一个简单问题，如果能正常返回内容，说明本地推理链路已经可用。
## 常见问题排查
### 服务地址不通
先确认 `ollama serve` 进程是否仍在运行，而不是只装好了 CLI。
### 模型不存在
执行 `ollama list` 看本地是否真的有该模型。没有的话重新 `pull`。
### 响应很慢
优先看 CPU、内存、模型大小是否匹配。很多问题其实不是安装问题，而是机器资源不够。
### 安装看起来成功，但命令异常
重新检查 shell 环境和 Ollama 可执行文件是否在正确路径下。
## 结论
Ubuntu 安装 Ollama 的重点，不只是把命令装上，而是要确认本地服务真的在运行、模型真的已经拉好、最小验证确实能成功。只要这三步都完成，后面接入 OpenClaw 时会轻松很多。
先把本地模型层跑稳，再进入 Agent 和自动化配置，是最省时间的顺序。
## 延伸阅读
- Ubuntu 安装 OpenClaw：本地 AI 工作流第二步
- 连接 OpenClaw 与 Ollama：本地 AI Agent 链路实战
- [OpenClaw 代理配置完整指南](https://bytesflows.com/blog/openclaw-proxy-setup)
- [OpenClaw 浏览器自动化与代理实践](https://bytesflows.com/ai/openclaw)
- [为什么 OpenClaw Agent 需要住宅代理](https://bytesflows.com/ai/openclaw)
