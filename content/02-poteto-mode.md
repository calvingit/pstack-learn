# 第 2 章 poteto-mode 与 playbook 机制

`/poteto-mode` 是 pstack 唯一需要记住的命令。这一章先看你要给它什么，再拆它内部的五个部分。

## 你只需要给四样东西

官方指南第 2 页说，好 prompt 最多五样：目标、能判定通过或失败的完成条件、想看到的证据、已知信息、真实约束。@dotta 把它压成四样，那条帖子拿到了一千多个赞：

```quote
en: a goal / a checkable finish condition / the evidence you want to see / constraints
zh: 目标、可检查的完成条件、想看到的证据、约束。
by: @dotta，2026-10-10
url: https://x.com/dotta/status/2108665034226225425
```

他引的示例 prompt 只有四行：

```text
/poteto-mode fix the duplicate notification after retry.
Reproduce it first. Done means retrying produces exactly one notification and normal delivery still works.
Show the failing and passing evidence. Leave a PR for review.
```

逐行拆：

| 行 | 属于哪一项 | 它让 agent 做了什么不同的事 |
|---|---|---|
| fix the duplicate notification after retry | 目标 | 描述症状，没说原因 |
| Reproduce it first | 约束 | 修之前必须先在真实界面上复现 |
| Done means … exactly one … and normal delivery still works | 完成条件 | 有“只有一条”这个可判定的标准，还附带了回归检查 |
| Show the failing and passing evidence | 证据 | 回复里要贴修前失败、修后通过的原始输出 |
| Leave a PR for review | 约束 | 开 PR，不自己合并 |

@Raydong001 的中文转述里有一句经验值得记住：缺完成条件和证据时，agent 最容易“看起来忙完了，你却验不了” 【已核实】（[原帖](https://x.com/Raydong001/status/2108920330270167077)）。

### 两个不要

指南明确列了两个坑：

1. **不要罗列技能**。写 “use /how then /architect then /arena” 会打乱 playbook 已经排好的顺序，或者漏掉步骤。只在想覆盖某个默认选择时才点名。
2. **不要先说你猜的原因**。agent 会去你指的地方找。先让它复述问题，再说你的猜测。

第二条在 Pt.2 里叫“间接提问”。她的示例是 `/poteto-mode read this slack thread. restate in your own words…`。

### 一个完整示例

下面是我按四要素写的一个中文场景，你可以对照改写自己的任务：

```text
/poteto-mode 导出 CSV 时，如果中途重试，会写出重复行。
先复现。完成条件：重试后导出文件里每个订单 id 只出现一次；不重试时结果和现在完全一致。
证据：贴出修前和修后的同一条复现命令输出，以及 `sort | uniq -d` 的结果。
约束：不改导出文件格式；不动 retry 的超时配置；开 PR 等我看。
```

注意它没有写“怎么修”。怎么修是 Bug fix playbook 的事。

## 入口内部的五个部分

打开 [poteto-mode/SKILL.md](https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/SKILL.md)，它分成这几段。

### 1. Non-negotiables：触发器表

这是一张“遇到 X 就做 Y”的表。挑几条看它的设计意图：

- **Nontrivial change → how**。改之前先理解。
- **About to AskQuestion → 先分类**。这一条最长，也最有意思。如果问题的答案是一个能通过运行观察到的事实（行为、耗时、布局、输出），就不该问人，应该用 Prototype playbook 做个草图让结果决定。只有产品或偏好上的选择，才留给人。
- **Any code → 先命名数据形状**。
- **Any prose surface → unslop**。包括给你的回复。
- **Running a benchmark → benchmark-checklist**。
- **PR-status request → Babysit playbook**，并且特意说明不要用 Cursor 自带的 babysit，因为它的描述会匹配同样的词。

这个“特意说明”很值得学：她知道模型靠 description 选技能，所以在入口里显式消歧。

### 2. Principles：原则索引

24 条原则，每条一行：什么时候用，核心要求是什么。完整原文在各自的 `principle-*` 叶子里。入口要求“引用某条原则前，本次会话必须读过它的叶子”，并且回复里要点名“哪条原则改变了哪个选择”。

这样设计有两个好处：索引短，常驻上下文成本低；点名要求让你能审计 agent 有没有真的按原则做。第 8 章细读。

### 3. Autonomy：什么时候不用问

```quote
en: Just do it. … Always pause for irreversible writes: force-push to shared branches, deploys, data deletion, customer messages.
zh: 可逆的事直接做。不可逆的写操作必须停下来：强推共享分支、部署、删数据、发给客户的消息。
by: poteto-mode/SKILL.md · Autonomy
url: https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/SKILL.md
```

还有一条我很喜欢：“No is an acceptable answer.” 被问到要不要做某事时，给真实判断，可以拒绝，“agreement is not the default”。这是在对抗模型的讨好倾向。

### 4. Subagents：怎么派活

- 每个子 agent 默认后台运行、按角色指定模型（代码给快模型，最难的改动和判断给最强模型）。
- **你对子 agent 的工作负责**。要自己看 diff、自己写总结，不能转述它说的话。
- **默认开新的子 agent**。修一轮、补一轮、重试，都给一个新 agent，附上原始任务、后续所有指令和上一个 agent 的报告。只有新工作必须依赖旧 agent 手上的状态（本地 checkout、未提交改动、正在跑的 dev server）时才复用。原因写得很清楚：中断链式恢复会悄悄丢指令。

最后一条是踩坑踩出来的。长对话里多次打断再继续，模型常常会忘掉中间加的要求。

### 5. Writing the reply：回复怎么写

短句；不用长破折号；句中不用冒号连接；不能因为简短而丢内容；先说对使用者和维护者有什么影响；**不编造链接**；**每个结论在同一句里带上证据或标签（测得、推断、猜测）**。

最后一条对应我们课程里的 【已核实】/【未核实】。

## playbook 是怎么被选中和执行的

入口最后一段是 23 个 playbook 的一行简介。执行规则只有三条：

1. 打开一个 todo 列表，**前几项是 playbook 的步骤原文照抄**，然后才是任务自己的 todo。
2. 不做的步骤**留在列表里**，写一行 `skip: <原因>`。
3. 大型或跨切面的任务、你打算离开后再审阅的任务，走 `figure-it-out`，为这次任务现场设计一套 playbook。

“照抄”和“skip 留痕”是这套机制的关键。照抄防止模型自己概括时丢步骤；skip 留痕让你一眼看出它跳过了什么、理由站不站得住。

```callout tip 和 Cursor 的 Custom Mode 配合
在 Cursor 里补全 `/poteto-mode` 时按 Option/Alt+Enter，它会变成 Custom Mode，每一轮都带一条提醒：“New task? Playbook match or rigor needed -> apply /poteto-mode. Casual turn or user opts out -> don't.”
```

```callout bad 已知的坑：子 agent 不继承模式
@the_lezend 反馈过：在 Cursor Project 的协调者上挂了 poteto-mode，再让它给 5 个 Linear 工单各开一个云端 agent，这些 worker 启动时没有这个模式（[原帖](https://x.com/the_lezend/status/2099229180928167987)）。入口里“Use subagent_type: poteto-agent”这一条就是为了这种情况：poteto-agent 启动时会先完整读一遍 poteto-mode。
```

## 为什么只有一个入口

我的理解是两个原因。第一，用户不需要知道 23 个 playbook 的名字，记一个命令就够了，这降低了上手成本。第二，所有任务共享同一套 Non-negotiables 和回复规则，行为一致。

代价也明显：入口文件本身很长（原则索引加触发器加 playbook 列表），常驻上下文有成本；而且一个大入口天然倾向于越长越大。#538 那次瘦身就是在处理这个问题（第 9 章）。

```callout warn 我们不照搬这一点
calvingit/skills 的原则是技能保持独立、原子，不打包成一个大技能。我们借鉴 playbook “步骤照抄 + skip 留痕”的执行纪律，但路由放在 `workflow-policy` 和文档里，不做一个吞掉所有流程的入口。第 11 章详谈。
```

```exercise 练习
- 把你记下的返工任务改写成四要素 prompt，检查完成条件能不能判定通过或失败
- 在 poteto-mode/SKILL.md 里找到 “About to AskQuestion” 那一条，用自己的话说明什么问题该问人、什么问题该做实验
- 打开 `playbooks/bug-fix.md`，数出它有几步，哪一步要求“先提交失败的复现”
- 想一想：你现在的 agent 指令里，有没有“默认复用旧会话”导致指令丢失的情况
```
