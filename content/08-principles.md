# 第 8 章 原则体系深读

24 条原则是 pstack 里最容易被跳过的部分，因为它们“不用调用”。这一章讲它们怎么起作用，以及哪几条最值得先记住。

## 原则不是用来调用的

指南第 8 页：原则不需要你主动调用，而是“用名字来纠偏”。比如 agent 在没验证的情况下说“完成了”，你只需要回一句：

```text
apply prove it works
```

它会去读 `principle-prove-it-works` 的叶子，按里面的标准重做。

**名字可以直接当命令用**。你不用解释“请在真实环境里验证、不要只看编译通过”，四个词就够了。

## 原则在入口里是怎么写的

poteto-mode 的原则索引每条一行，格式固定：**名字 + 什么时候用 + 核心要求**。例如：

```quote
en: Build the Lever. Any non-trivial work. Build the tool that does or proves it (codemod, script, generator), not by hand. The tool is the artifact a reviewer reruns.
zh: 造杠杆。任何非小事。造一个去做或去证明的工具（codemod、脚本、生成器），而不是手工做。这个工具就是 reviewer 可以重跑的产物。
by: poteto-mode/SKILL.md · Principles
url: https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/SKILL.md
```

“什么时候用”是给模型的触发条件，“核心要求”是一句话的摘要，细节在叶子里。入口还要求：引用一条原则之前必须读过它的叶子，回复里要说清“哪条原则改变了哪个选择”。

#538 瘦身时，原则索引的命名规则改成只在开头写一次（叶子名是 `principle-` 加标题的 kebab-case），不再每条重复。这是“索引只声明一次”的例子。

## 五组原则

| 组 | 条数 | 关心什么 |
|---|---|---|
| Core | 10 | 怎么想问题：删、减、重设计、攻击前提、造工具 |
| Architecture | 6 | 代码形状：领域模型、边界、类型、幂等、迁移、共享状态 |
| Verification | 5 | 怎么证明：真实验证、根因、可验证单元、测行为、解释数字 |
| Delegation | 2 | 怎么派活：守上下文、不卡在人身上 |
| Meta | 1 | 怎么改进：把教训编码进结构 |

完整列表见 [原则速查](#/ref/principles)。

## 先记住这六条

如果只能记六条，我建议这些，因为它们最常被违反，而且违反的代价最大：

### Prove It Works

宣布完成前，对真实产物验证。不接受代理指标，不接受“能编译”。这是整个验证体系的原则层。

### Attack the Premise

两个或多个修复共享同一个前提、且都败在同一道关上，说明前提有问题。下一步是把前提写成一句能被检验的话，再找一个“如果前提为假就会得出不同结果”的观测，先做这个观测。先别写第三个修复。

这条是 0.15.0 加的，针对 agent 一个很典型的失败模式：在错误的方向上越修越深。#633 改写时给它补了一个判断：如果证据显示总有一方吃亏，要去改“是什么让它一直吃亏”的那个机制，而不是每次替它收拾残局。

### Sequence Work into Verifiable Units

多步工作切成小单元，每个单元以一个检查结束，验证完一个再做下一个；提交和 PR 的顺序本身要能证明自己。Bug fix 的“失败测试先提交”是它的标准例子。

### Separate Before Serializing Shared State

并发方可能写同一个文件、分支、key 时，**先消除共享**，而不是加锁排队。arena 给每个候选单独的输出目录、swarm 给每个 worker 单独的输出位置，都是这条的应用。

### Never Block on the Human

可逆的事不要问“要不要做 X”，先做，给结果，让人纠偏。配合 Autonomy 里的“Always pause”清单，边界是：可逆的直接做，不可逆的必须停。

### Encode Lessons in Structure

发现自己第二次写同一条指令时，改成 lint、元数据、运行时检查或脚本。这是 `/correct` 的原则层，也是 pstack 自我改进的根。

## 0.15.17 之后的几处改动

- **Fix Root Causes 多了一条**（[#604](https://github.com/cursor/plugins/pull/604)）：如果关键事实是挖了很久才找到的，就提出一个便宜、一直开着的信号（日志、指标之类），让下次第一眼就能看到它。修完 bug 之后，再问一句“怎样才能更早发现”。
- **四条原则删了一部分**（[#571](https://github.com/cursor/plugins/pull/571)）：Encode Lessons in Structure、Exhaust the Design Space、Guard the Context Window、Laziness Protocol 删掉了复述的规则、通用步骤和反例清单，核心规则保留。
- **四条原则从规则改写成推理**（[#633](https://github.com/cursor/plugins/pull/633)，10-15 合入，未进版本号）：Attack the Premise、Fix Root Causes、Test Behavior Not Implementation、Make Operations Idempotent 原来给的是硬规则（比如 Test Behavior 那条枚举了一批禁止的断言形状），改写后给的是背后的道理和判断方法，好让 agent 处理原文没写到的情况。

#633 反映了她对模型的一个判断：硬规则会限制 agent 处理她没预料到的情况，所以换成推理。她说这些原则本来是“从今年纠正 agent 的会话里抽出来的”，现在模型变强了，抽出来的规则可以再抽象一层。这也是她 10-14 那条帖子“期望 pstack 的技能随着模型变强继续压缩”的具体动作。

```callout warn 读旧文章时注意
教程和博客里引用的原则措辞可能是改写前的。Test Behavior 那条变化最大：旧的“所有导入函数返回 undefined 还能通过的测试要重写”已经不在原文里，换成了两个假想编辑。本文以 [cursor/plugins](https://github.com/cursor/plugins/tree/main/pstack/skills) 当前原文为准。
```

## 原则之间的张力

原则多了一定会打架。几组值得注意的：

- **Laziness Protocol vs Exhaust the Design Space**：一个要最小改动，一个要做 2~3 个原型。解决方式是看阶段：原型阶段穷尽，实现阶段最小。Prototype playbook 明确说它是两者“反转”的地方。
- **Never Block on the Human vs Always pause**：前者管可逆操作，后者管不可逆操作。
- **Outcome-Oriented Execution vs Sequence Verifiable Units**：前者说不要保留一次性的兼容中间态，后者说每一步都要能验证。两者合起来是：每一步都朝目标架构走，并且每一步都能单独验证，但不为了“中间也能跑”去写最后要删的兼容代码。

```exercise 练习
- 从 24 条里挑出你团队最常违反的三条，各写一个最近的真实例子
- 下次 agent 跳过验证说完成时，只回“apply prove it works”，观察它的反应
- 找出你项目里一个“越修越深”的问题，按 Attack the Premise 的要求，写出所有修复共享的那个前提
```
