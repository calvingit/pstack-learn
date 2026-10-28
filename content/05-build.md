# 第 5 章 构建与清理：Feature / tdd / unslop / no-comments

前几章都在动手之前。这一章讲写代码本身：写得少，删得多，测试要测行为。

本章已对照 **0.15.36**（2026-10-28，上游提交 `c742dd6`）的 Feature、Opening a PR、清理技能及测试原则核实现行指导。

## Feature playbook 逐步拆

`playbooks/feature.md` 有 8 步，每一步背后都有一条原则：

| 步骤 | 内容 | 背后的原则 |
|---|---|---|
| 1 | 对受影响的子系统跑 `how` | 先理解 |
| 2 | `architect` 并行探索设计 | Exhaust the Design Space |
| 3 | 写吞吐检查点（四项 todo） | Separate Before Serializing Shared State |
| 4 | 把写代码委派给子 agent，范围要具体：文件路径、命名的数据形状和组织结构、成功标准 | Model the Domain |
| 5 | 在对应界面上验证，“inconclusive”或界面不对都不算通过 | Prove It Works |
| 6 | rebase 成小而有序的提交，后续工作叠在上面 | Sequence Verifiable Units |
| 7 | 设计有争议就 `interrogate` | 对抗评审 |
| 8 | 开 PR | |

开头一句是 “You own the design. Plan, review, verify. Delegate implementation.” 默认由主 agent 负责设计、评审和验证，委派实现。**受工具限制、禁止再派子 agent 的执行者是明确例外**：它直接负责 diff，同时保持实现与评审分离，不能回复“等嵌套 agent”然后停工。

第 4 步不是随便找个代码模型：从本地 `feature, refactoring` 角色行出发，最难的改动走 `hardest tasks`，再按难度调推理档位和速度。默认代码模型虽带 `-fast`，但只有 CI 或 trunk 红了、或有人正在等结果才用 fast；验证仍固定在 `swarm workers` 的模型和速度。完整降级规则见[第 2 章](/ch/02-poteto-mode)。

实现有多个合理形态时，**必须通过 arena 派工**，让候选摆出替代方案、cross-judge 检查选择。不能写个 skip 原因，也不能拿 Laziness Protocol 绕过。来自上游的文件要重新对照源；改进共享原语时要迁移所有消费者并逐一验证。

### 吞吐检查点是什么

第 3 步要求写四项 todo，不适用的写 `n/a: <原因>`，不能删：

- **Blocking first steps**：并行之前必须先完成的门槛。
- **Independent workstreams**：文件、服务、层互不相交的部分可以并行；共享写入要串行。
- **Shared mutable state**：默认先把目标拆开，只有真正的不变量才串行。
- **Smallest safe decomposition**：如果一个 worker 最好，说明为什么。

**我的理解**：这四项强迫 agent 在派活之前想清楚“能不能并行、该不该并行”。没有这一步，常见的失败是几个子 agent 同时改同一个文件，最后谁也合不进去。

Feature 还明确划了派工边界：同一个功能或迁移中互相耦合的代码交给**一个 owner**，由它在阻塞阶段之后内部拆分。父级并行适合产出独立成果的切片，例如审计、跨子系统调查和竞争实验。阶段切换时重写检查点；后续轮次默认换新 owner，带齐累计指令，避免中断链丢要求。

## 清理、审查和开 PR 的顺序

Opening a PR 当前要求提交前跑 `cursor-team-kit` 的 `/deslop`，评审前跑 `/no-comments`；PR 标题、描述和 commit body 先按 `/technical-writing` 写，再过 `/unslop`。`interrogate` 用于有争议的设计，**不再是每个开 PR 的子 agent 都必须执行的检查**。一旦调用，按第 4 章的运行证据规则报告问题，不自动修。

PR 描述按 Why、What changed、Scope、Tradeoffs、Blast Radius、Verification 的顺序写。空节可以省略，Scope 必留。当前规则要求 PR 直接 ready，不开 draft；如果运行环境有内置 PR 工具，创建、编辑、改 base 和标 ready 走内置工具，其他操作用选定 forge。没有内置工具时默认 `gh`，可用且能解析仓库的 Origin 优先，不依赖 Graphite。

**开 PR 不等于开始 babysit**。普通子 agent 清理 diff、贴 URL 就返回，主对话继续构建，等阶段或整栈完成后另行按请求运行 Babysit。Autopilot-full / Autopilot-stack 的 owner 是例外：brief 已经给了 babysit 任务，code-ready 报告之后就可以开始，之后报告 merge-ready；stack 仍然不能合并。

## 先命名数据形状

Non-negotiables 里有一条 “Any code → name the data shape first”。Feature 第 4 步又具体化了：状态机优于一堆布尔值，表或注册表优于分支，类型模型优于到处重复的形状假设。

这是 Model the Domain 原则。理由很直接：分散的 if/else 是 agent 最容易“局部看对、全局改错”的地方；一张表或一个状态机，agent 只需要加一行。

## /tdd：先失败，再修

`tdd` 的 description 写得很克制：只在用户明确要求、或者 bug 有明显便宜的本地测试路径时用。原文里有一句我很认同：

```quote
en: Prefer no new test over a bad test.
zh: 宁可不加测试，也不要加一个坏测试。
by: pstack/skills/tdd/SKILL.md
url: https://github.com/cursor/plugins/blob/main/pstack/skills/tdd/SKILL.md
```

坏测试的定义：主要在测 mock、把当前实现细节写死、依赖时序或无关的全局状态、为小修复引入昂贵基础设施，或者修完马上就会被删掉。

流程六步：理解 bug → 选最窄的可执行检查 → 先写失败测试 → **修之前先跑，确认它因为正确的原因失败** → 修 → 再跑。

第 4 步经常被省略。一个“修之前就通过”或者“因为别的原因失败”的测试，证明不了任何事。

再配合 Bug fix playbook 第 5 步：“Stage the commits so the failing repro lands before the fix in git history.” 失败的复现先进 git 历史，修复叠在上面。这样任何人都能 checkout 到上一个提交，亲眼看到它失败。

### Test Behavior, Not Implementation

原则索引里这条有一个可判定的检验。0.15.24 之后它从“规则”改写成了“推理”，换成了两个假想编辑：

```quote
en: Break the behavior: the test must fail. Restructure the internals: it must still pass.
zh: 破坏行为，测试必须失败；只重构内部实现，测试必须仍然通过。
by: principle-test-behavior-not-implementation/SKILL.md（#633 改写后）
url: https://github.com/cursor/plugins/blob/main/pstack/skills/principle-test-behavior-not-implementation/SKILL.md
```

用两个假想编辑来判定：把代码改坏（返回错值、漏掉一个副作用、把副作用触发两次），测试必须失败；把内部实现换一种写法但每个可观察结果都不变，测试必须仍然通过。只满足一半的，重写或删掉。

这里要注意一个容易搞反的点：**对 mock 的断言不一定是“实现细节”**。如果约定是“空购物车绝不扣款”，那么断言支付客户端没被调用就是行为；mock 收到的请求体也是行为，因为那个外部服务确实观察到了它。真正算实现细节的是对内部私有助手、内部调用顺序的断言。#633 把这条从“列出禁止的断言形状”改成“由契约判定，不由断言形状判定”，就是为了让 agent 能处理原文没枚举到的情况。

## /unslop：清理文字

`unslop` 的 description 原来是“Cut AI tells from any writing. Must always apply.”。它设了 `disable-model-invocation: true`，不会自己触发，后半句反而被 agent 当成命令，[#572](https://github.com/cursor/plugins/pull/572) 把它删了。poteto-mode 仍然要求所有文字表面都过它，包括给你的回复。

规则有编号，而且编号是“稳定 id”，删掉的规则留空号，因为别的技能会按编号引用（比如回复规则里引用了 “unslop rule 14”）。这个细节说明她把技能当代码维护。

几条典型规则：表面的 -ing 短语、模糊归因（“专家认为”）、AI 词汇表、用“serves as”代替“is”、“不只是 X 而是 Y”、强行凑三。

Theo 认为最值钱的一条在第 27 条末尾 【已核实】（规则原文）：

```quote
en: If the sentence could appear unchanged in another project's docs, it says nothing about this one. Cut it.
zh: 如果这句话原封不动放进另一个项目的文档也成立，它就没说出这个项目的任何事。删掉。
by: pstack/skills/unslop/SKILL.md · 规则 27
url: https://github.com/cursor/plugins/blob/main/pstack/skills/unslop/SKILL.md
```

## /no-comments：派一个专门删注释的 agent

`no-comments` 不自己判断，而是派一个叫 Comment Sicko 的子 agent，然后审它的结果。几个设计点：

- 主 agent 要**驳回** Comment Sicko 越界的修改：改了应用逻辑、超出范围、删了受保护的注释。
- 发现注释背后其实是一个 workaround 时，修范围内根因，删掉 workaround；需要改结构就先用 `architect` 出草图，再实现。根因超出范围时只落最小范围内修复，剩余明确报告，不能借原则扩大范围。
- 这个 agent 的 id 现在是 `comment-sicko`（[#486](https://github.com/cursor/plugins/pull/486)）。原来的 “Comment Sicko” 带空格，在 Grok 上派不出去。界面上显示的名字没变。
- “不要删”“改前找某某”这类约束注释，先证明是否涉及自己改不了的外部约束，该保留的保留。其余提议用范围内最便宜的类型、运行时检查、测试或 CI lint 替代，并**等交互批准**，无人值守和 eval 需要事先批准。获批就编码后删注释；否则按当前规则删注释，并把未执行的约束明确报告为 open，不能声称已有保护。

最后一条是 Encode Lessons in Structure 的又一次体现：注释里的约束没人执行，换成检查才有人执行。

## Refactoring 和 Laziness Protocol

pstack 对“加东西”很警惕。Laziness Protocol 要求偏向删除和最小改动；Subtract Before You Add 要求先删死重量再建。她在 README 里说目标是“少写代码，但写得更好”。

这和很多 agent 的默认倾向相反。模型通常喜欢加抽象层、加兼容分支、加“以防万一”的检查。Bug fix playbook 开头那句“Belt-and-suspenders that 'might help' is a hypothesis, not a fix. It does not ship.”（“可能有帮助”的双保险只是一个假设，不是修复，不上线）就是针对这个倾向写的。

```exercise 练习
- 找你项目里一个测试，用两个假想编辑各跑一次：把行为改坏它失败了吗？只换内部写法它还通过吗？记录结论
- 下次修 bug 时，先单独提交一个失败的测试或复现脚本，再提交修复
- 拿你最近写的一段文档，用 unslop 规则 27 的检验删掉所有“可移植句子”，对比前后长度
- 在 Feature 任务里写一次吞吐检查点的四项，哪怕全是 `n/a`
```
