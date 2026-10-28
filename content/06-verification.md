# 第 6 章 验证体系

如果这门课只能读一章，读这一章。她在官方指南第 1 页说：“Of everything in this guide, the verification skill pays off the most.”

## 验证的三个层次

我把 pstack 的验证拆成三层，从具体到抽象：

| 层 | 是什么 | 谁维护 |
|---|---|---|
| 项目验证技能 | `.cursor/skills/verify-<app>/`：怎么启动、怎么驱动、怎么取证、怎么清理，加一份 Feature Map | `/create-verification-skill` 生成，`/maintain-verification-skill` 维护 |
| playbook 里的验证步骤 | “Verify on the matching surface”，用项目验证技能在真实界面上跑 | 每个 playbook 自带 |
| 原则 | Prove It Works、Explain the Number、Test Behavior | 全局 |

全局只有原则和步骤，**具体怎么验永远是项目自己的事**。

## /create-verification-skill 五步

### 1. 访谈仓库，而不是访谈用户

能从代码里回答的就不问人。要回答五个问题：

- **Surface**：用户实际碰到的是什么？Web、CLI、桌面、API、移动端、库？
- **Run**：本地怎么启动？优先用仓库自己的 dev 命令。端口、环境变量、种子数据、认证。
- **Drive**：agent 怎么程序化地操作它？先找现成的（Playwright 脚本、curl 能打的接口、调试端口），再考虑通用方案（CDP、tmux/PTY、HTTP）。
- **Observe**：能抓到什么证据？截图、终端记录、响应体、日志、退出码、数据库状态。
- **Isolate**：能不能同时跑两个实例？不能就在技能里写明，拒绝同时驱动共享实例。

如果仓库本身起不来，先修好或者准确报告，再生成。“一个写在坏底座上的技能会教错步骤。”

“起来了”指的是应用能用，不是端口有响应（[#573](https://github.com/cursor/plugins/pull/573)）。有人量过：数据库 socket 3 秒就通了，初始化到 19 秒才做完，按端口判断会早 16 秒开始操作，撞上还不存在的数据。现在要求从空数据目录启动，跑完迁移和种子数据，再用一个真实的读请求确认能用。

### 2. 生成技能

必须有这几段，并且都要用访谈里找到的真实内容，不留占位符：

- **Launch**：确切的启动命令、怎么判断就绪、怎么关掉。
- **Doctor**：一个只读检查，回答“这个实例值不值得驱动”：进程在不在、版本对不对、端口是不是我们的、认证有效没有。
- **Drive**：真实的选择器和命令。优先用稳定句柄（ARIA 标签、data 属性、路由路径），不用坐标和 tab 顺序。
- **Evidence**：抓什么、放哪里，以及证据标准。走真实的用户路径，不用内部 setter 或测试专用接口；抓动作和结果状态；检查副作用。
- **Cleanup**：只关自己启动的实例，**不按进程名杀**；清理不能删掉证据。
- **Helpers**：附带的脚本必须可执行，调用方式写在技能里。

### 3. 种下 Feature Map

`features/README.md` 做索引，每个用户可见的功能一个文件。先做最重要的 3~5 个。每个文件从用户视角回答：这是什么功能、怎么到达、怎么用。示例在 [poteto/verification-skill-example](https://github.com/poteto/verification-skill-example)。

Pt.1 里她说 Feature Map 的灵感来自 sitemap，是“物化的记忆”，帮 agent 省 token。

### 4. 交付前自己跑一遍

按生成的技能端到端跑一次：启动、doctor、驱动**一个**功能、取证、清理。清理后确认证据还在。“一个吃掉证据的清理会让这一步失败。”

### 5. 提供维护循环

指向 `/maintain-verification-skill`。用户问了才建议频率。

## /maintain-verification-skill：结果只有三种

Feature Map 一旦应用变了就开始腐烂。维护技能的结果只允许三种：

- **clean**：每个功能都有源码和实际运行覆盖，没东西要改。不开分支，不开 PR。
- **changed**：一个 PR，里面是被证明过的文档、harness 或地图修正。
- **blocked**：没跑完，或者修正没法安全上线。说清楚卡在哪。

**只改验证技能自己的目录，从不改产品代码。** 地图描述了一个应用已经不做的行为，要么是文档漂移（改地图），要么是真 bug（报告出来，不顺手修）。

流程里有一步“Live pass”，**即使源码看起来没问题也必须跑**。这一条防止“读代码觉得没变”替代了实际验证。

## 形式化验证：证明一个明确范围内的性质

上面的验证技能走真实用户路径。0.15.36 的上游还提供 `/create-formal-verification-skill` 和 `/maintain-formal-verification-skill`，补上测试不容易覆盖的事件交错、重试、状态机、解析器和不安全代码。以下对照当前 `skills/` 源文件核实。

### /create-formal-verification-skill

先从代码找出一个承诺：违背它会伤害用户，而测试很难碰到破坏它的情况。选最值得验证的目标，不能只挑最容易证明的目标。然后让问题决定工具：

| 问题 | 通常适用的工具 |
|---|---|
| 事件是否会按坏的顺序发生 | 小型设计模型上的模型检查，默认考虑 TLA+，不受产品语言限制 |
| 真实代码对所有输入是否满足内存安全、溢出或数据结构不变量 | 能直接检查该语言代码的验证器，例如 SMT 支持的工具 |
| 性质必须对任意规模成立，有界检查不够 | 证明助手等证明工具 |
| 该语言没有合适的代码验证器 | 明说限制，对真实代码生成输入做测试，不能用手写函数模型冒充代码证明 |

生成的项目技能必须记录性质、覆盖的文件和函数、边界与假设、可复现工具版本、一条重跑命令，以及最后确认验证与代码一致的 **sync commit**。模型里的每个原子步骤都要对应代码里的原子步骤。交付前在真实代码上临时制造一个破坏性质的改动，按生成技能跑一遍，确认能抓住，再撤掉临时改动并恢复原始检查结果。

当前代码违背性质时，保留发现，用代码里的词讲清反例与伤害。不能削弱性质求绿，也不能擅自改产品代码。通过只覆盖声明的模型、边界和假设，不等于整个系统被证明正确。

### /maintain-formal-verification-skill

维护从 sync commit 到当前提交之间的全部覆盖代码变化，也要追踪函数移动，以及新增的、会写同一受保护状态的代码。先原样运行旧检查，再根据代码更新模型、harness 或性质，最后重跑并判断失败来自哪里。

每个检查有四种结果：**in sync**（一致且通过）、**updated**（更新后通过）、**bug**（验证描述准确，当前代码违背性质）、**blocked**（无法同步或运行）。更新后发现 bug 可以同时标为 updated 和 bug。性质只有在证据表明产品承诺有意改变时才改；blocked 的检查不能推进 sync commit。

通过后还要临时破坏新代码，证明检查仍有失败能力。失败则逐步对照真实代码重放反例：代码里不可能发生的步骤说明模型有误；每一步都能发生则是产品 bug。只改验证文件和技能，验证更新与产品修复分开。

### /statechart：把 TLA+ 结果交给行为的负责人

`/statechart` 检查 TLA+ 模型，输出 Mermaid 状态图和每条失败规则的最短路径。状态与箭头用读者能理解的词，读者据此决定行为是否正确。模型描述真实代码时，必须再用测试或现场复现逐步重放 bug 路径。

- 在仓库外的临时目录工作，首次运行会通过 mise 安装 TLC 和 Java，需要网络。
- 规则写成不变量，不能为了通过而放宽；合法终态也需要明确的原地动作，否则会被当作死锁。
- 图可表达平面、嵌套或并行状态；`breaks` 表示该状态违反规则，`mayBreak` 表示合并后的部分底层状态违反规则。
- 当前完整图预算是 500 个 TLC 状态。超过时只画失败路径；没有失败则不生成 `chart.mmd`，报告仍保留检查结果。后续逐条排除已失败规则的运行各有 100,000 个不同状态的上限，未检查的规则不能算通过。
- 图只是一种视图。报告必须说明模型省略了什么、图隐藏了哪些步骤，以及哪些规则没有检查。

生成的 TLA+ 验证技能只按名字引用 `/statechart`，不要复制它的命令、选项或安装路径，这些会随版本和机器变化。源码见 [生成技能](https://github.com/cursor/plugins/blob/main/pstack/skills/create-formal-verification-skill/SKILL.md)、[维护技能](https://github.com/cursor/plugins/blob/main/pstack/skills/maintain-formal-verification-skill/SKILL.md) 和 [statechart](https://github.com/cursor/plugins/blob/main/pstack/skills/statechart/SKILL.md)。

## Prove It Works 和“对应界面”

每个 playbook 的验证步骤都有一句“'Inconclusive' or wrong-surface is not a pass. Flag it.” 两个要点：

1. **结果不确定就是没通过**，要标出来，不能写成“应该没问题”。
2. **界面要对**。UI 的 bug 用单元测试证明修好了，不算。

指南第 10 页的坑：“Reporting success off a green build. A build proves it compiles.”

## /benchmark-checklist：数字要先审

性能数字特别容易骗人。`benchmark-checklist` 基于 Brendan Gregg 的基准测试清单，要求报告任何测量值之前回答 7 个问题：

| # | 问题 | 防的是什么 |
|---|---|---|
| 1 | 为什么不是两倍？说出限制因素 | 不知道瓶颈在哪的数字 |
| 2 | 调优了吗？两边都按生产方式跑 | 拿 debug 构建比 release |
| 3 | 突破物理极限了吗？算一算带宽和核数 | 不可能的提速 |
| 4 | 出错了吗？数失败和非成功响应 | 错误返回得快，看起来像变快 |
| 5 | 能复现吗？每边至少 5 次交替跑，报中位数和范围 | 噪声当信号 |
| 6 | 重要吗？测用户真正等待的端到端路径 | 优化了只占 1% 的函数 |
| 7 | 真的执行了吗？确认工作发生在计时区间内 | 惰性代码、没人 await 的 promise |

开始之前还要先写下你打算报告的那句话，比如“在 6 万行数据集上 p50 快了 30%”，7 个问题就是在检验这句话。

报告时先给结论（更快、更慢、无可测差异、不确定），再给带单位的数字、跑了几次、范围、限制因素。说不出限制因素、有一边没调优、问题 4 和 7 没查，结论就是“不确定”。

```callout ok 社区实战
@DanielLockyer 说 pstack 自主找到并修复了一个 O(n^3) 导致的事件循环卡顿，提速 160 倍；另一天一天里提交了 19 个性能 PR（[帖 1](https://x.com/DanielLockyer/status/2107427811640188985)、[帖 2](https://x.com/DanielLockyer/status/2107090228712456662)）【未核实】，数字是他自述。
```

## Pt.1 里的“小 CLI”

Pt.1 推荐给应用做一个小 CLI 让 agent 驱动，示例命令有 doctor、snapshot、screenshot、trace、feature-flag。好 CLI 的标准：

- 易组合（deep modules）。
- 破坏性命令有 `--dry-run`。
- 用子命令逐步展开功能。
- **错误信息告诉 agent 下一步怎么做**。
- `--help` 写详细。
- 输出机器可读（JSON）。

另外把种子数据、测试账号、开发环境一键启动做好。

这些标准本身就是 Build the Lever：与其每次在 prompt 里解释怎么操作应用，不如造一个工具。

## 失败模式和质疑

- **验证者自己成了瓶颈**。@ohmyclaw1121 的说法是“落地时 90% 的团队会发现 verifier 自己才是瓶颈”（[原帖](https://x.com/ohmyclaw1121/status/2109055137071415320)）。maintain 技能和每日例程就是冲着这件事来的。验证技能需要像产品一样维护。
- **难驱动的技术栈**。原生应用、硬件、强依赖第三方的系统，驱动成本可能比功能本身还高。她的答案是自己造工具，但这对小团队不一定划算。
- **证据被伪造**。agent 可能用测试专用接口“证明”行为。Evidence 一段明确要求走真实用户路径，就是为了堵这个口子。

```exercise 练习
- 按五个访谈问题（Surface/Run/Drive/Observe/Isolate）给你的一个项目写出答案
- 为这个项目写一个 Doctor 检查：只读，回答“这个实例值不值得驱动”
- 列出最重要的 3 个用户功能，每个写一页 Feature Map
- 下次报告任何性能数字之前，先写下你要报告的那句话，再过一遍 7 个问题
```
