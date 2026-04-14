# Bytesflows · GitHub 仓库与增长协作说明（内部）

> **读者说明**  
> **产品用户、开发者读者请使用根目录 [README.md](../README.md) 与 [官网](https://bytesflows.com/en/proxies)，不必阅读本页。**  
> 本页供 **市场、增长、内容维护者** 内部对齐：说明本仓库在 GitHub 上如何配合官网与代理产品页，避免在对外 README 里堆叠内部话术。
>
> **主转化路径（已定）：以代理产品页为优先** —— README、Description 与对外 Campaign 外链优先指向 **[Proxies](https://bytesflows.com/en/proxies)**，博客与定价为次级支撑。  
> 下文从传播目标、关键词叙事、转化路径、内容资产四部分说明；文末为配套材料链接。

---

## 一、传播目标：我们在 GitHub 上要达成什么

| 目标层级 | 说明 |
|----------|------|
| **被发现** | 当用户搜索 `web scraping`、`residential proxy`、`Playwright proxy` 等意图词时，有机会通过 **GitHub 站内搜索、Google 对公开仓库的收录、Topic 聚合页** 看到本仓库。 |
| **被理解** | 在 **标题（Description）与首屏 README** 中，用一句话讲清：**我们是谁、解决什么问题、与正式站内容的关系**，避免「只有代码没有故事」。 |
| **被点击** | 优先导向 **代理产品页（/en/proxies）** 完成方案认知与试用/购买意向；博客、工具、定价为 **信任加深与决策辅助**，不抢主路径首位。 |
| **被信任** | 持续输出 **可检索、可引用的指南与工具说明**，强化「技术型代理 + 教育内容」的品牌心智，支撑自然外链与口碑检索。 |

**一句话策略：** GitHub 负责 **意图匹配与品牌背书**；进入主站后 **先落代理产品页，再分流至博客与工具**。关键词叙事与主站 Proxies 落地页保持一致，避免口径分裂。

---

## 二、关键词与信息架构：对外说什么、怎么说

**核心主题集群（与站内 Topic Cluster 对齐）：**

- **需求侧意图：** web scraping、data collection、SERP / e‑commerce 采集、反爬与指纹  
- **方案侧意图：** residential proxy、rotating proxies、geo‑targeting、与 Playwright / Python 栈结合  
- **品牌与商业意图：** Bytesflows、dynamic residential proxies、pricing、与「免费工具」相关的长尾词  

**GitHub 侧落地方式（信息架构）：**

- **Description：** 一句 **含品牌 + 场景 + 官网** 的摘要，兼顾搜索词与自然阅读（具体文案备选见配套材料 [REPO_SETUP.md](./REPO_SETUP.md)）。  
- **Topics：** 覆盖 **技术栈 + 场景 + 品牌**，便于在 GitHub 话题页与相关仓库旁 **被联想展示**。  
- **Website：** 统一指向 **https://bytesflows.com**，作为 **权威流量入口**，与所有对外物料一致。  
- **README 首屏：** 首段即完成 **价值主张 + 三条以内利益点**；首屏 CTA 顺序为 **Proxies → Blog → Pricing**（与「代理产品页为主」一致），兼顾 **Snippet 与社交分享** 的可读性。  
- **社交预览图（可选）：** 强化分享至 Twitter / Slack 时的 **点击率与品牌识别**，与主站视觉规范对齐。

---

## 三、转化路径：从「发现仓库」到「访问主站」

```
GitHub 搜索 / Google / Topic 页
        ↓
仓库 Description + README 首屏（关键词 + 价值主张）
        ↓
【主】代理产品页 — 方案、能力、试用/购买入口
        ↓
【辅】博客 / 工具 / Landing — 教育、信任、长尾意图
        ↓
定价 / 再营销 — 商业决策与回流
```

**主站承接矩阵（传播与 SEO 共用；优先级已标注）：**

| 优先级 | 角色 | URL |
|--------|------|-----|
| **P0** | **代理产品与方案（主转化）** | https://bytesflows.com/en/proxies |
| P1 | 内容中枢（英文博客） | https://bytesflows.com/en/blog |
| P1 | 商业决策（定价） | https://bytesflows.com/en/pricing |
| — | 收录与结构校验 | https://bytesflows.com/sitemap.xml |

内容生产与选题节奏，见 **[docs/SEO_STRATEGY.md](../docs/SEO_STRATEGY.md)** 与 **[docs/README.md](../docs/README.md)** 中的整体策略说明。

---

## 四、内容资产与协同：策略文档在哪里、怎么配合

以下材料用于 **选题、内链、Topic Cluster、工具与 Landing 规划**，与本仓库在 GitHub 上的对外表述 **共用同一套关键词**，由市场 / 增长 / 内容协作维护：

| 资产 | 在方案中的作用 |
|------|----------------|
| [docs/README.md](../docs/README.md) | 内容选题、内链与写作规范的 **总览入口** |
| [docs/SEO_STRATEGY.md](../docs/SEO_STRATEGY.md) | 总策略：sitemap、Topic Cluster、漏斗与 Developer Hub 方向 |
| [docs/content-and-discovery-tips.md](../docs/content-and-discovery-tips.md) | 可发现性与分发角度的补充 |
| [docs/INTERNAL_LINKS_RULES.md](../docs/INTERNAL_LINKS_RULES.md) | 内链规则，支撑 **权重与主题聚合** |
| [docs/TOPIC_CLUSTER_100.md](../docs/TOPIC_CLUSTER_100.md) | 大规模选题与 slug 规划 |
| [docs/CONTENT_STRUCTURE.md](../docs/CONTENT_STRUCTURE.md) | 内容类型与路由对应，便于 **Campaign 与落地页对齐** |
| [REPO_SETUP.md](./REPO_SETUP.md) | GitHub About 文案与 Topics **可直接复制执行** 的备选句 |

---

## 五、执行协同与口径

- **对外口径：** GitHub、主站、社媒与物料中的 **产品名、卖点、链接** 以主站与品牌规范为准；**默认首链使用 `/en/proxies`**，除非单次 Campaign 明确以内容拉新为主。仓库 **Description** 建议一季一度复盘是否与 Proxies 落地页卖点同步。  
- **角色分工建议：** 市场 / 增长负责 **Topic、Description、首屏叙事与活动落地**；内容 / 技术负责 **正文与 docs 策略**；双方以 **docs/SEO_STRATEGY** 与 **本索引** 对齐关键词与优先级。  
- **本页用途：** 内部提案、复盘或新人 onboarding 时，说明「本仓库在 GitHub 上扮演什么角色」；**不替代**面向用户的 README 与官网文案。

---

*Bytesflows — 在 GitHub 上被对的人搜到；**代理产品页**承接核心转化；博客与工具加深信任与长尾意图。*
