# 第 3 章 理解代码：how / why / blast-radius / interrogate

改代码之前先理解它，这句话人人都会说。pstack 的做法是把“理解”拆成几个问题，每个问题一个技能，各自有明确的产出和证据标准。

## 先看一层：多 agent 的几种形状

pstack 里凡是派多个子 agent 的技能，都可以归到五种形状之一。先记住这层，再看单个技能会容易很多——因为同一个形状在不同技能里反复出现，只是装配方式不同。

| 形状 | 谁在用 | 怎么跑 | 为什么有效 |
|---|---|---|---|
| Explore → explain | `/how` | 派 2~4 个只读 explorer 分头看不同角度，再让一个 explainer 综合 | 读文件的活给便宜模型，写说明给强模型 |
| Investigate → synthesize | `/why`、`/recall`、`/reflect` | 每个证据来源派一个 investigator，一个 synthesizer 汇总 | 一个来源一个 agent，没有来源会被略过；查不到也变成一条发现 |
| Bakeoff + graft | `/arena`、`/architect` | 多个 runner 拿同一份 brief，交叉家族盲审，取一个底座嫁接其他候选的优点 | 评分表对候选保密，评审只看到脱敏标签，比较才公平 |
| Coverage / race | `/swarm`、shipping | 多个云端 worker 分头跑切片或赛跑，汇成一张表 | 缺证据等于没通过，所以每个结果都自带 SHA |
| Adversarial panel | `/interrogate` | 每个模型家族一个 reviewer，lead 把发现分桶 | 差异来自不同模型，不是扮演不同人格 |

五种之外还有一条贯穿始终的规矩：**Author ≠ critic**。写代码的 agent 不验收自己的活（`/no-comments` 是派 Comment Sicko 去删自己的注释，shipping 是换 verifier 判每个 PR）。这一条在[第 7 章](/ch/07-parallel)展开。

后面讲具体技能时，我会指出它属于哪一种形状。

## 四个问题，四个技能

| 你想知道 | 技能 | 形状 | 产出 | 证据来源 |
|---|---|---|---|---|
| 它现在怎么工作 | `/how` | Explore → explain | 架构说明：Overview、Key Concepts、How It Works、Where Things Live、Gotchas | 代码本身 |
| 它为什么长这样 | `/why` | Investigate → synthesize | 动机和取舍，区分已知、推断、未知 | git、PR、工单、文档、聊天、监控 |
| 改了会坏哪里 | `/blast-radius` | —（单 agent） | 一两个关键事实，并用运行证明 | 实际执行的脚本或复现 |
| 这个改动站得住吗 | `/interrogate` | Adversarial panel | 多模型对抗评审的综合结论 | 不同模型家族的独立审查 |

`/teach` 是 how + why 的组合，配图讲给你听；`/recall` 从你过去的对话记录里找回上下文（Investigate → synthesize）。

## /how：先判断复杂度

`how` 的第一步不是读代码，而是判断问题的复杂度：

- **简单**（一个模块、一个小工具、“函数 X 怎么工作”）：不派 explorer，一个 explainer 边读边讲。
- **复杂**（跨文件或跨服务的子系统、架构总览）：把问题拆成 2~4 个角度，并行派只读 explorer，再由一个 explainer 综合。

原文还有一句：“When in doubt, take the simple path.” 拿不准就走简单路径。

**为什么这样设计**：explorer 用快模型、explainer 用强模型，按角色分配成本。并行探索把大量读文件的输出关在子 agent 里，主线程只拿到综合后的说明，这是 Guard the Context Window 原则的落地。

**产出的粒度**：目标是“资深工程师入职一个子系统”的水平，足够建立心智模型，但“不能读起来像带注释的源码”。这个标准很实用。很多 agent 的代码讲解失败，就是因为它逐行复述代码。

## /why：把“为什么”当成取证

`why` 是我认为 pstack 里最被低估的技能。它的流程：

1. 明确**目标**（哪段代码、哪个决定）和**问题**（设计理由、回归、阈值从哪来）。
2. 建立**代码锚点**：文件路径和行号、关键符号、最近的提交、合并提交里的 PR 号、工单号，跑 `git blame`。
3. 列出可用的 MCP，把每个映射到一个证据类别：版本控制、工单、长文档、即时聊天、基础设施监控、错误追踪、数据仓库。
4. **默认全量并行调查**。原话是 “Document the null, don't skip the search.” 没找到也要记下来，而不是不查。
5. 综合时遵循 `references/epistemics.md` 的置信度框架。

还有一个细节：`why` 的子 agent 必须用 agent 模式而不是只读模式，因为只读模式会去掉 MCP 访问。这种“工具层面的坑”被写进了技能，正是“把教训编码进结构”的例子。

```callout tip 为什么值得学
大多数团队的“为什么”藏在 Slack 和 PR 评论里，没人去翻。`why` 把翻找变成了默认动作，并且强制区分“我看到了证据”和“我推断的”。这对我们仓库的 Kernel 里“事实和推断要分开”是一个很好的执行样板。
```

## /blast-radius：别信自己写的分析

这个技能的核心是一句话：

```quote
en: A blast-radius writeup that sounds right is worthless. It reads as convincing whether or not it's true.
zh: 一份听起来对的爆炸半径分析毫无价值。不管它真不真，读起来都一样有说服力。
by: pstack/skills/blast-radius/SKILL.md
url: https://github.com/cursor/plugins/blob/main/pstack/skills/blast-radius/SKILL.md
```

所以它要求找出“整件事安全与否依赖的一两个事实”，然后把每个事实沿着这个梯子尽量往下推：

1. 你说的。单独看毫无价值。
2. 你指出了那一行（真实的 `file:line`）。
3. 你一步步走了失败路径，证明到不了。
4. 你跑了脚本，调用真实代码，错了会大声失败。
5. 你在运行的应用里复现了。

并且要说清楚停在了哪一级。

Theo 在他那期对比视频里特别提到这一条“救过他几次” 【未核实】（我没看视频，转引自 [@chenchengpro 的摘要](https://x.com/chenchengpro/status/2090042073583927318)）。

**我的看法**：这个五级梯子可以直接借用到任何 review 场景，包括我们的 `code-review` 和 `verify`。它比“请仔细检查”具体得多。

## /interrogate：对抗信号来自模型多样性

`interrogate` 的设计选择写在第一段：“The adversarial signal comes from model diversity, not assigned personas.” 不是让同一个模型扮演“安全专家”“性能专家”，而是让不同模型家族（默认 Opus 和 Grok）独立审查同一份 diff。

流程：确定范围 → 用一段话写清意图（拿不准就问人）→ 并行派评审 → 综合。**不自动应用修改**。

指南第 10 页的坑里有一条：“Accepting every review comment.” 机器人和人提的意见里都混着真问题和噪声，`interrogate` 把发现分成“要处理”和“驳回（附理由）”两桶。

```callout warn 什么时候不要用
Pt.2 里她说过：不要对抽象计划做对抗评审，agent 会凭空想出理论风险。`interrogate` 应该对着已经写出来的代码或原型用。
```

## 间接提问：理解的第一步是复述

这一章的技能都在解决“agent 缺上下文”。Pt.2 说 agent 的两种失败（没理解意图、缺少干对活的上下文）本质都是上下文质量问题。她给的第一个技巧不需要任何技能：

```text
/poteto-mode read this slack thread. restate in your own words what the problem is before proposing anything.
```

让 agent 先复述，有三个好处：把嘈杂的讨论压成清楚的问题；误解在动手前暴露；你的猜测不会污染它的调查。

## 和 Matt 的 grilling 怎么分工

Matt 的 grilling 是反过来的：agent 问你，把你脑子里的需求问出来。pstack 的理解类技能是 agent 问代码和历史。两者面向的对象不同，可以串起来用：先 grilling 对齐意图，再 how/why 理解现状。

```exercise 练习
- 对你项目里一个陌生模块跑一次 `/how`（或手动按它的五段格式写一份说明），检查有没有写成“带注释的源码”
- 挑一个你不理解的历史设计，按 `/why` 的七个证据类别列出你能查的地方，标出哪些你从来没查过
- 拿最近一个小改动，按 blast-radius 的五级梯子，写出它安全依赖的关键事实停在哪一级
```
