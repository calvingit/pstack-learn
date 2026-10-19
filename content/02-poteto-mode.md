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
- **About to AskQuestion → 先分类**。这一条最长。如果问题的答案是一个能通过运行观察到的事实（行为、耗时、布局、输出），就不该问人，应该用 Prototype playbook 做个草图让结果决定。只有产品或偏好上的选择，才留给人。
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
- **工作流技能自己指定 `subagent_type`，不要覆盖**。`how`、`why`、`interrogate`、`reflect`、`swarm` 会自己设，为的是让评审来自不同模型。入口还特意说明：playbook 内部派活才用 `poteto-agent`，**绝不要派一个 `poteto-agent` 去跑 playbook 本身**。

最后一条是踩坑踩出来的。长对话里多次打断再继续，模型常常会忘掉中间加的要求。

0.15.20 之后，谁来跑 playbook 也写清楚了（[#575](https://github.com/cursor/plugins/pull/575)、[#577](https://github.com/cursor/plugins/pull/577)、[#597](https://github.com/cursor/plugins/pull/597)）：

- **收到 `/poteto-mode` 的那个对话自己跑 playbook**。`poteto-agent` 以前自称是 `/poteto-mode` 的“路由目标”，主对话就派一个 `poteto-agent` 去跑整套流程。可是嵌套的子 agent 没有 Task 工具，派不出 `how`、`why`、Comment Sicko 这些下一级 agent，todo 也传不回对话。现在 `poteto-agent` 只是主对话派活时用的外壳。
- **主对话要把 poteto-mode 的绝对路径交给每个 `poteto-agent`**。叶子技能都设了 `disable-model-invocation: true`，agent 在技能目录里看不到它们的路径。poteto-mode 现在会说明打包的技能相对它自己放在哪里。
- 没拿到路径时，`poteto-agent` 第一步就去 `~/.cursor/plugins/` 下找 `skills/poteto-mode/SKILL.md`。技能目录里看不到 poteto-mode，不代表没装 pstack。

### 模型按角色分配

模型选择写在一层间接上。技能里只说**角色**（“how explorer”“arena runners”），由 `/setup-pstack` 生成的角色表把角色映射到具体模型 slug。换模型不用改技能，也能按角色调预算。

`poteto-mode/SKILL.md` 里写明的默认分工有这些 【已核实】：

| 类别 | 默认模型 |
|---|---|
| 代码 | `grok-4.7-xhigh-fast` |
| 判断和写作 | `claude-opus-5-5-xhigh` |
| 最难的改动（跨切面设计、难缠的并发、微妙的算法） | `claude-opus-5-5-xhigh` |
| `swarm workers`（验证固定在这一档） | `grok-4.7-xhigh-fast` |

“最难的改动”这一类值得注意：**不论任务是需要对模糊意图做判断，还是精确到每一步都要照做的执行，都归最强判断模型**。这条把“难度”和“类型”分开了——不是所有写代码的活都给代码模型。角色的具体名字还有 feature/refactoring、bug-fix、perf-issue、hillclimb（这几个是 playbook 各自的代码模型行）、hardest tasks、judgment and prose。

角色行有三种特殊写法：没有对应行就用默认；写成 `inherit-parent` 或 `auto` 就用当前对话的模型；某一行可以覆盖被路由技能（`how`、`why`、`arena`、`swarm`、`architect`、`interrogate`、`reflect`）里的模型选择。

```callout warn 完整角色表在你自己机器上
`pstack-models.mdc` 是 `/setup-pstack` 按你有哪些模型、选多大预算**写到你本地**的，不在开源仓库里（主仓库没有这个文件，我找过）。所以“哪个角色配哪个模型”没有一份权威答案，只有上面这几条编码在 `poteto-mode/SKILL.md` 里的默认。别人文章里列的详细映射表，是那位作者自己的配置，照抄前先看它合不合你的模型和预算。
```

### 只调档位，不换家族

0.15.24 新增的规则（[#613](https://github.com/cursor/plugins/pull/613)），每次派活前决定：从角色那一行出发，**只改推理档位和快慢，不改模型家族**。

- 最难或最细微的活升一档（最高到 max）；判断题降一档；重复性活降两档以上。
- fast 模式只在“急”的时候用，而急的定义很窄：**CI 或主干红了，或者有人正卡在等这个结果**。其余情况用标准速度（同一个 slug 去掉 `-fast`）。
- 验证是例外，固定留在 `swarm workers` 的模型和速度上。
- Task 工具拒绝了调整后的 slug 时，**不要再试另一个调整过的 slug**，退回角色那一行，并说出来。

“不改家族”的理由原文写得很直白：so a diverse panel stays diverse。arena 和 interrogate 靠不同家族独立审查同一份 diff 来产生对抗信号，一旦为了省事把两边换到同一个家族，这条信号就没了。同一批 PR 还给 `arena` 和 `interrogate` 补了一条：`cursor-grok-` 和 `composer-` 开头的 slug 现在归到 grok 家族，`composer-*` 被拒时落到 grok 默认，而不是落到“没有家族匹配时用的 Claude 默认”。

### 外部输入一律标 untrusted

所有从外面进来的东西——对话记录、Bugbot 评论、评审输出、webhook 内容——都标成 untrusted data。两条约束：**回复文本永远不要拼进 shell 命令**；读对话记录只限当前工作区。加一个标注就够了。漏掉它，评论里藏的指令就能改你的仓库。

### 5. Writing the reply：回复怎么写

短句；不用长破折号；句中不用冒号连接；不能因为简短而丢内容；先说对使用者和维护者有什么影响；**不编造链接**；**每个结论在同一句里带上证据或标签（测得、推断、猜测）**。

最后一条对应我们课程里的 【已核实】/【未核实】。

## playbook 是怎么被选中和执行的

入口最后一段是 23 个 playbook 的一行简介。执行规则只有三条：

1. 打开一个 todo 列表，**前几项是 playbook 的步骤原文照抄**，然后才是任务自己的 todo。
2. 不做的步骤**留在列表里**，写一行 `skip: <原因>`。
3. 大型或跨切面的任务、你打算离开后再审阅的任务，走 `figure-it-out`，为这次任务现场设计一套 playbook。

“照抄”和“skip 留痕”是这套机制的关键。照抄防止模型自己概括时丢步骤；skip 留痕让你一眼看出它跳过了什么、理由站不站得住。

## 23 个 playbook

playbook 不是技能。它们没有斜杠命令，只是 `poteto-mode/playbooks/` 下的 Markdown 文件，由入口匹配。你也可以直接说“babysit this pr”“land the stack”“full autopilot on this queue”来点名。

每个 playbook 都是同一个三段式：**开头一句加粗的立场**（你拥有什么）、**编号步骤**、**结尾 `Reply:` 合约**（最终回复必须包含什么）。这个结构本身值得抄：立场句划清主 agent 的责任边界，Reply 合约让输出可以被检查。

下面按用途分四组。每个给一句立场、和相邻 playbook 的分界、以及最值得注意的一条。

### 理解与诊断

| playbook | 立场 | 什么时候用它，和邻居的分界 |
|---|---|---|
| Investigation | 你拥有答案 | 只读问题：X 怎么工作、Y 为什么这样、Z 确定吗、做 X 还是 Y。产出带出处的回答或带权衡表的建议，**不改代码**，不开 PR |
| Runtime forensics | 你拥有诊断，**去插桩活进程，不要从源码空想** | 还没有现成产物时：抓一个 CPU profile、堆快照或 CDP trace。第 3 步用 CDP eval 或热修**便宜地证明机制**，再映射回 `file:line` |
| Trace forensics | 你拥有来自产物的诊断 | 产物已经存在。和 Runtime forensics 的分界：这里**不重新跑**，只读 |
| Bug fix | 你拥有这个任务 | 第 2 步是二分：提假设、取切掉最多空间的那一刀、拿运行时证据、排除。流程见[第 5 章](/ch/05-build) |
| Perf issue | 你拥有整个测量故事 | 每个修复都挂在一次测量上，**不准只读源码代替测量** |
| Hillclimb | 你拥有指标和实验的完整性 | 持续爬一个指标，不是一次性修复。核心纪律：一次改动、一次测量、留下或全量回滚。**不许叠未验证的改动，不许靠看代码宣称赢** |

Runtime forensics 和 Trace forensics 是同一套方法的两个时机：一个主动抓，一个读现成的。两者共有的规矩是**大产物在子 agent 里解析，主线程只留结论**，这是 Guard the Context Window 的直接落地；另一个共性是都要求“先把产物倒进 sqlite 再读”，和 Hillclimb 先建 harness 同一个思路：把不可查询的变成可查询的，再动手。

Hillclimb 有两处设计特别值得抄。一是**停止谓词要同时有目标和尝试次数下限**（例：“至少比基线快 50% 且至少跑 10 轮”），这样一次运气好的早胜就不能结束整个 run。二是决策日志 `decision.tsv` 一行一次尝试，**每一行都记，包括回滚掉的**。

### 构建

| playbook | 立场 | 值得注意的一条 |
|---|---|---|
| Feature | 你拥有设计，**实现要委派出去** | 第 4 步：当实现存在多个合理形态（错误处理、抽象层、测试结构），必须走 `arena` 让候选把替代方案摆出来。**这条不能用 Laziness Protocol 跳过**，理由写得很清楚：收益是评审分离，不是省行数 |
| Refactoring | 你拥有契约，**结构变，行为不变** | 第 1 步先钉住行为契约：characterization 测试、快照、等价 harness。**类型检查和 lint 不算钉子**。第 7 步的成功标准是 reader load 下降，diff 没降低 reader load 就回滚 |
| Prototype | 你拥有设计决策，**不是那段代码** | 唯一一个“质量不重要”的 playbook。第 1 步：先说要做的那个决定是什么，**没有决定就不做原型**，直接走 Feature |
| Visual parity | 你拥有像素级等价，**基线就是规格，不许碰** | 反捷径条款：不改 harness、不篡改基线、不为让 diff 通过去重构组件、基线看着不对就停下来问。**等价靠 image diff 判定，不靠眼睛** |
| Figure it out | — | 大型或跨切面的任务由它现场设计一套 playbook，不套现成的 |

Refactoring 那句“类型检查和 lint 不算钉子”值得多说一句：很多人重构前跑一遍 tsc 就算保护了，而 tsc 只保证编译，不保证行为。配合 Feature 里“多形态实现必须走 arena”这条不可跳过的规则，两处都明确堵死了“图省事”的口子。

### 交付与自治

| playbook | 立场 | 和其他章的关系 |
|---|---|---|
| Opening a PR | 每个别的 playbook 结束时都调用它 | 提交和 PR 描述的规矩最细。PR body 是给已经有 diff 的评审者的**一分钟简报**，六节固定顺序：Why / What changed / Scope / Tradeoffs / Blast Radius / Verification |
| Babysit | 把 PR 或一叠 PR 推到可以合并 | 见[第 7 章](/ch/07-parallel) |
| Shipping | 决定上线 | 见[第 7 章](/ch/07-parallel) |
| Autonomous run | 一个任务跑到完成条件 | 见[第 7 章](/ch/07-parallel) |
| Autopilot-full | 一队互相独立的 PR | 0.15.24 起只留规则；每小时一跳，有变化就以 `/ketchup` 口吻汇报，**没变化就闭嘴** |
| Autopilot-stack | 一队有耦合的改动 | 现在只写它和 full 不同的地方。新增：`--force-with-lease` 钉住你最后推送的 SHA、trunk 改了调用方就在合并结果上重跑、**第三次 rebase 越过 merge prep 就停下来报告** |
| Orchestrate | 多天的项目、成百个子 agent | 0.15.24 起**不再需要 Graphite**：前端从 PR 的 base 链推出，worker 和 babysitter 不再跑 `gt`，改由一个 stacker 统一负责链式 rebase 和重定向 |
| Multi-phase plan | 跨阶段、多个 PR | 计划**最后才写**。检查计划文件的 `check-plan.mjs` 见[第 9 章](/ch/09-self-improve) |
| Session pickup | 你拥有续跑点，**读已有轨迹，不要重做** | 第 3 步区分已完成和待办，明确说“let me verify from scratch”意味着你把权威输入当成不可信。最后一步：**上一轮的自述不算证明**，要对真实产物复核 |
| Pause safely | 留下一个冷启动 agent 能接的检查点 | 只在明确要求暂停时用；“keep going”“going to bed, keep going”都不算。第 4 步把恢复说明写到上下文外（如 `/tmp/<slug>-resume.md`） |
| Worktree cleanup | — | 那个会删用户状态的 playbook，门槛见[第 7 章](/ch/07-parallel) |

Session pickup 最后一条是它最有价值的地方：它承认“上一轮 agent 说自己搞定了”不可信，接手后仍要独立验证。这跟整个体系里“author 不是 critic”是同一条线。

Opening a PR 还有一条和写作直接相关：PR 标题、描述、commit body 都要过 `/technical-writing`（除 Diátaxis 那一层外全用，并套 STE 词汇规则：一个动作一个词、保留冠词、能用裸动词就不用 `-ing`），然后过 `/unslop`。完整代码走 `/deslop`（在 `cursor-team-kit` 插件里），评审前过 `/no-comments`。

### 元：改这套系统自己用的

| playbook | 立场 | 内容 |
|---|---|---|
| Authoring or modifying a skill | 你拥有这个技能的语气 | 四步：create-skill → 校验（frontmatter、引用文件存在、跨技能链接可解析）→ 结构性的改动写测试用例 → 开 PR |
| Eval | 你拥有实验设计 | 改动技能前先盲测它对 agent 行为的实际影响。盲测规则见[第 9 章](/ch/09-self-improve) |

```callout tip 怎么用这张表
不用背。把它当索引：任务来了，先看它属于哪一组、和邻居的分界在哪。真要动手时让入口去匹配，你只需在它选错时用一句话纠偏。
```

```callout tip 和 Cursor 的 Custom Mode 配合
在 Cursor 里补全 `/poteto-mode` 时按 Option/Alt+Enter，它会变成 Custom Mode，每一轮都带一条提醒：“New task? Playbook match or rigor needed -> apply /poteto-mode. Casual turn or user opts out -> don't.”
```

```callout bad 已知的坑：子 agent 不继承模式
@the_lezend 反馈过：在 Cursor Project 的协调者上挂了 poteto-mode，再让它给 5 个 Linear 工单各开一个云端 agent，这些 worker 启动时没有这个模式（[原帖](https://x.com/the_lezend/status/2099229180928167987)）。入口里“Use subagent_type: poteto-agent”这一条就是为了这种情况：poteto-agent 启动时会先完整读一遍 poteto-mode。
```

## 为什么只有一个入口

两个原因。记一个命令就够，不必先知道 23 个 playbook 的名字。所有任务也共享同一套 Non-negotiables 和回复规则。

代价也明显：入口文件本身很长（原则索引加触发器加 playbook 列表），常驻上下文有成本，而且越长越大。#538 那次瘦身就是在处理这个问题（第 9 章）。

```exercise 练习
- 把你记下的返工任务改写成四要素 prompt，检查完成条件能不能判定通过或失败
- 在 poteto-mode/SKILL.md 里找到 “About to AskQuestion” 那一条，用自己的话说明什么问题该问人、什么问题该做实验
- 打开 `playbooks/bug-fix.md`，数出它有几步，哪一步要求“先提交失败的复现”
- 对照上面四组表，给你手上正在做的任务挑一个最合适的 playbook，写下它和邻居的分界是什么
- 想一想：你现在的 agent 指令里，有没有“默认复用旧会话”导致指令丢失的情况
```
