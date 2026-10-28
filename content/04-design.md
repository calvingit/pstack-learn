# 第 4 章 设计：architect / arena / 原型

她说“不相信规划”，设计发生在代码草图和原型里。

本章现行行为核对到 **0.15.36**（2026-10-28，上游提交 `c742dd6`），以当前 `architect`、`arena`、`interrogate` 的技能源为准。

这一章的 `/architect` 和 `/arena` 都属于 [Bakeoff + graft](/ch/03-understand) 那种形状：多个候选拿同一份 brief 并行出方案，主协调者通读、评分；可用的异家族评委独立评分，最后取一个底座、把别的候选的优点嫁接过来。它和 swarm 的区别见下表。

## 设计投入的阶梯

官方指南第 4 页给了一个“设计要投入多少”的阶梯，我把它归纳成这样：

| 情况 | 做法 |
|---|---|
| 改动不跨函数边界 | 直接走 Feature 或 Bug fix |
| 跨函数边界 | `/architect` |
| 有经验性分歧（哪种布局、哪种做法更快） | Prototype playbook，做实验别提问 |
| 设计有争议 | 实现后 `/interrogate` |
| 跨阶段、多个 PR | Multi-phase plan，最后才写计划 |
| 共享代码、新框架 | README 先行，先写教程 |

## /architect 的五个阶段

`architect` 的 todo 一开始就固定为五项：Ground、Sketch、Agree、Implement、Scrap。

**A. Ground（打地基）**。对新代码会碰到的每个系统跑 `how`。原文：“Naming a file isn't grounding.” 写出一个文件名不算理解。如果设计要重新定义归属或分层，还要跑 `why`。只有真正的全新项目才能跳过。

**B. Sketch（草图）**。用 `arena` 派多个模型并行出草图：类型、函数签名、模块边界，函数体写 `not implemented` 加伪代码。硬性要求：

- **Design it twice**。至少两个结构上不同的候选，即使第一个看起来够好。这是 Exhaust the Design Space 原则的落地。
- 用 `design-red-flags.md` 筛查每个候选。筛查时假设下一个贡献者是一个“只看到自己打开的文件、复制最近的例子、走能编译的最短路径”的 agent。
- 比较**接口深度**：选把更多复杂度藏在更小、更简单的公开接口后面的那个。这是 Ousterhout 的 deep modules 思想。

**C. Agree（可选）**。默认不停下来等人，直接实现。只有你明确说“先给我看再实现”才暂停。

**D. Implement**。照选定的草图填代码。

**E. Scrap**。设计被证明错了就推倒重来。Pt.2 给了两个信号：同一种 workaround 出现在互不相关的地方；类型必须靠 `any` 或强制转换才能编译。

```callout tip 下一个贡献者是 agent
“假设下一个贡献者是 agent”这个筛查视角，在 `/correct` 和 `architect` 里都出现了。它把“好设计”的标准从“人读着舒服”换成了“一个只看局部的 agent 也不会改坏”。在 agent 写大部分代码的时代，这个标准更贴近现实。
```

## /arena 和 /swarm 别混用

两者都是并行，但目的不同：

| | `/arena` | `/swarm` |
|---|---|---|
| 每个 worker 拿到 | 同一个任务 | 不同的切片，或同一任务赛跑 |
| 目标 | 选一个底座，嫁接其他候选的优点 | 覆盖面，汇成一份报告 |
| 典型用途 | 设计草图、关键代码的多版本 | fuzz、跨子系统审计、多次测量 |

`arena` 的几个细节：

- 所有候选拿同一个 prompt，“the prompt is the contract”。
- 六阶段固定为 Frame、Fan out、Cross-judge、Pick、Graft、Verify。评分标准有 3~6 条，只给主协调者和 cross-judge 看，候选者只拿任务，避免迎合评分表。
- runner 读本地 `pstack-models.mdc` 的 `arena runners` 行；`architect` 改读 `architect runners`。缺行时默认 Claude 和 Grok 各一个。每个候选独占 worktree 或输出目录，后台并行生成；没有产物的候选记为退出。
- 配置模型被拒，先用该家族默认；没有默认或默认也被拒，从错误消息选同家族有效 slug，仍没有就撤席并说明。撤席后补到至少两名，配置行本来只有一项则补到一名；补席用剩余 runner 模型，没有剩余则继承主模型。`auto`、`inherit-parent` 是继承主模型的配置，不是无效 slug。
- **等所有候选写完才派只读 cross-judge**，它与主协调者逐个通读候选同时进行。评委读 `arena cross-judge pool`，必须来自主对话以外的模型家族；`auto`、`inherit-parent` 不能当异家族评委。按池顺序尝试，失败后可试同模型的有效档位，再试默认异家族池；都跑不了就跳过评委并说明。主模型未知时按池中真实 slug 尝试，并说明没做家族检查。
- 主协调者仍要逐项打分、通读所有候选，不能把选择外包给评委；双方不一致时先读清理由再决定。综合说明要列出底座、嫁接来源、拒绝项、退出候选、验证结果，以及评委结论或跳过原因。
- 挑底座时选“未来维护者最容易扩展又不破坏不变量”的那个；平手时选边界更干净、API 更小的。
- 如果候选彼此差别巨大，说明 Frame 阶段没讲清楚，**重新定义问题再跑**，而不是把它们平均。

最后一条很重要。把几个方向完全不同的方案“融合”起来，通常会得到一个谁都不像的东西。

## /interrogate：把问题跑出来

[当前 interrogate](https://github.com/cursor/plugins/blob/c742dd6/pstack/skills/interrogate/SKILL.md) 不再让只读评审按四个桶整理意见。**对抗者要尝试弄坏改动，主协调者重新运行命令，只有证明确实违背意图的问题才留下。**它只报告，不自动修复。

流程可以拆成四步：

1. **Frame**。范围优先用你点名的范围，否则从分支与 base 的 merge base 一直到当前工作区，包含未提交改动。先用 `in-your-own-words` 复述意图；意图不清楚才问人。
2. **Fan out**。复用 arena 的选 runner、隔离输出和后台派工，模型行改为 `interrogate reviewers`，对抗者类型为 `generalPurpose`。把范围内的未提交改动复制进各自 worktree，让它们能在真实代码上写失败测试或复现脚本；复现留在自己的 worktree。
3. **Verify**。每个问题必须有标题、确切命令、实际输出和意图要求的输出。主协调者重新跑命令，确认失败且违背意图；同根因合并。只谈风格、命名、结构或未来风险，却没跑出问题的，丢弃。
4. **Output**。输出 Intent、Findings、Dropped。Findings 附命令、输出、违背意图的说明和发现它的对抗者；Dropped 按对抗者列丢弃数量和原因。没有留下的问题就写 `no verified findings`。

这里**跳过 arena 的 Cross-judge、Pick、Graft**。不同对抗者可能找到完全不同的失败，要保留全部验证过的问题，不是选一个人的清单，也不是数多少模型投了赞成票。

设计草图和计划也可以审，但对抗者必须跑原型或探查当前代码。空泛计划没有可运行的支撑，能证明的东西就很少。先用原型回答经验问题，再对实现做压力检查。

## 原型：唯一一个“质量不重要”的 playbook

Prototype playbook 开头就说，这是 Laziness Protocol 和验证标准**反转**的地方：要速度不要打磨，代码质量无所谓，不做规划。严谨体现在“便宜地选对设计”。

几个做法：

- 先说清楚原型要回答的那个决定。没有要做的决定就不做原型，直接走 Feature。
- 在独立的 scratch 目录里做，和生产代码分开。
- 多个变体放在一个切换器后面（按钮或快捷键），每个都标好名字。
- 在对应界面上验证：视觉问题截图，行为问题记录耗时或输出。
- 产出是“决定 + 一次性产物”，**不是可上线的代码**。真正的实现交给 Feature。

Pt.2 的标题是 “Measure a hundred times, cut once”。原型就是那一百次测量。

## README 先行

她做内部桌面框架 Dune 时，先写教程再写代码，结果发现 agent 写的文档很糟，于是有了 `/technical-writing`（基于 Diátaxis 四种文体）。Pt.2 里的组合示例是：先 `/recall`、`/how`、`/why`，再 `/poteto-mode` 加 `/technical-writing` 写新虚拟化引擎的教程，最后 `/teach` 证明新方案更好。

先写教程的好处是：如果你没法用简单的话教别人怎么用，API 大概率设计错了。

## 和 Matt 的思路对照

Matt 在 10 月 3 日和她聊完后发帖主张“在 AI 时代用更多抽象”，理由是抽象加严格 lint 能缩小 agent 的设计空间，让它只能做出好决定 【已核实】（[原帖](https://x.com/mattpocockuk/status/2106425743479546343)）。这和 `architect` 偏好深接口、`/correct` 优先用架构消除错误是同一个方向。

Matt 的 grilling 和 wayfinder 问的是要做什么、范围到哪。pstack 的设计技能默认需求已经清楚，问的是代码长什么形状。

```exercise 练习
- 选一个即将要写的跨模块功能，只写类型和函数签名（函数体 `throw new Error('not implemented')`），做出两个结构不同的版本
- 用“下一个贡献者只看局部、复制最近例子”的视角，挑出两个版本各自最容易被改坏的地方
- 找一个团队里争论过的 UI 或性能问题，设计一个能在一小时内给出答案的原型，写下它要回答的那个决定
```
