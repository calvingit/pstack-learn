# 第 11 章 对照 calvingit/cstack

calvingit/skills 已废弃，这一章的对照对象换成 calvingit/cstack——同一个作者的新一代工程方法 Skills 包：39 个技能、7 个 agent 定义，围绕六阶段 DEFINE → PLAN → BUILD → VERIFY → REVIEW → SHIP 和产物链 DECISIONS → SPEC → TECH → SLICES → EVIDENCE 组织（对照基线：本机 2026-11-11 同步的 v0.6.8）。先明确三条不变的约定：

1. **六阶段是地图，不是流水线**。按当前问题进入，按需跳过或返回上游阶段；唯一不能跳的是收尾——verify 和 review 必须实际运行，simplify 可以跳过。
2. **深度由风险决定，不由流程决定**。不确定性、影响半径、验证难度、可逆性四个事实决定投入多少；权限从 Inspect 到 Prepare 再到 Merge/Deploy，逐级需要授权。
3. **角色边界不重叠**。Implementer 永远不写 EVIDENCE，Verifier 和 Reviewer 是两种判断，Orchestrator 不裁定分歧。

## 结构对照

| 方面 | pstack | calvingit/cstack |
|---|---|---|
| 入口 | 一个 `/poteto-mode` 吞下全部路由 | 没有大入口，技能按名字触发，手动触发的写明条件 |
| 流程单元 | 23 个 playbook，作为入口的参考文件 | 13 个六阶段工作流技能 + 25 个辅助技能，靠产物链串接 |
| 共享约束 | 24 条原则，偏工程手艺 | cstack-core 四份文档：19 条强制约束、产物字段、共享判据、角色契约，技能读文件对齐 |
| 需求对齐 | 不是重点（间接提问、/in-your-own-words） | DEFINE 阶段：cstack-clarify 定未决选择，cstack-specify 固化验收标准 |
| 验证 | create/maintain-verification-skill，项目内 `verify-<app>` | cstack-create-verification-skill 建立，cstack-verify 逐条判定并写 EVIDENCE |
| 自我改进 | `/correct`、`/reflect`、脚本层 | cstack-retro、cstack-improve-agents-md、cstack-second-pass |
| 收尾 | Babysit / Shipping 分两半，独立判定 | verify + review 必须实际运行，cstack-ship 三分交付 |

7 个 agent 定义把角色边界写进 frontmatter 的工具清单：implementer 是唯一有写权限的，verifier、reviewer、simplifier 都只读，researcher 是唯一能上网的。运行时没有任何脚本和 hooks。

## 已经对齐的地方

- **项目级验证技能**。她的 `create-verification-skill` 和 cstack-create-verification-skill 几乎同构：都从仓库证据出发、复用现有 harness、不改产品代码、记录覆盖范围；产出的 harness 契约都要求 Launch、Doctor、Drive、Observe、Cleanup 这些段，Doctor 都是“这个实例值不值得驱动”的只读检查。她写 `.cursor/skills/verify-<app>/`，cstack 写 `.agents/skills/verify-<surface>/`（见[第 6 章](/ch/06-verification)）。
- **做的人不验收自己**。Shipping 的“no owner merges on its own verdict”和 cstack-core 的“Implementer 永远不写 EVIDENCE；自检只是候选记录”是同一句话的两种写法。
- **五级证明梯子**。blast-radius 要求每个事实沿“你说的 → 指出那一行 → 走通失败路径 → 跑了脚本 → 在应用里复现”的梯子尽量往下推，并说明停在哪一级（见[第 3 章](/ch/03-understand)）；cstack-core 的 CRITERIA.md 有一张几乎同构的五级证明层级表，同样要求“停在哪一层要写明”。两边各自长出了同一把梯子。
- **事实和推断分开**。0.15.1 起 pstack 要求每个结论带证据或标签；cstack-core 第 3 条要求区分观察、推断、未知，EVIDENCE 只允许 PASS / FAIL / NOT VERIFIED 三种结论，证据要绑定合并候选和环境，条件变了要重判。
- **复述目标**。她的 `/in-your-own-words` 和 cstack 的 restate-goal、bro 都是复述类技能，都只在手动输入时运行。差别在默认行为：0.15.35 起 pstack 的首条回复自动复述目标，cstack 仍全部手动触发。

## 值得借鉴的地方（按收益排序）

### 1. 验证技能加一个周期性的维护入口

cstack-create-verification-skill 要求失效时更新同一份验证方法，但没有周期性入口，结果格式也没有约定。pstack 的 `maintain-verification-skill` 只允许三种结果：clean（没东西要改，不开分支不开 PR）、changed（一个 PR，里面是被证明过的修正）、blocked（说清楚卡在哪），并且 Live pass 必须跑，防止“读代码觉得没变”替代实际验证（见[第 6 章](/ch/06-verification)）。可以作为 cstack-create-verification-skill 的一个 refresh 契约，不新建技能。

### 2. 外部输入标 untrusted

cstack 对资料来源有可信度分级（官方承诺 / 自己实测 / 他人报告 / 自己推断），但没有注入防护。pstack 的规则是对话记录、评审评论、webhook 内容一律标 untrusted：**回复文本永远不拼进 shell 命令**，读对话记录只限当前工作区（见[第 2 章](/ch/02-poteto-mode)）。漏标以后，评论里藏的指令就能改仓库。可以直接加进 explorer、researcher 和 pr-feedback 的输入约束。

### 3. 每条规则标注执行机制

`/correct` 第 4 步要求在 agent 指令文件里维护一张“规则 ↔ 执行机制”表：每条规则标出谁来执行（lint、类型、测试、CI、无）（见[第 9 章](/ch/09-self-improve)）。cstack-improve-agents-md 已经会删除“已由仓库工具可靠保证”的冗余规则，方向一致但缺逐条标注；把这张表加进去，“无”的那些行就是下一批升级对象。

### 4. 报告性能数字前的 7 问

cstack-performance 要求可比基线、记录波动、波动范围内不声称提升——这些约束管的是自己的实验。benchmark-checklist 的 7 个问题（为什么不是两倍？突破物理极限了吗？出错了吗？见[第 6 章](/ch/06-verification)）审计的是要报告的那个结论。两者互补，7 问可以作为 cstack-verify 判定性能类验收标准时的证据标准。

### 5. 可移植句子检验

cstack-chinese-writing-style 已经查翻译腔和英文名词移植，但没有 unslop 规则 27 那一条：“如果这句话原封不动放进另一个项目的文档也成立，它就没说出这个项目的任何事。删掉。”（见[第 5 章](/ch/05-build)）。加进自查清单，正好补上“项目特异性”这一维。

### 6. 压缩时核对上下游契约

#538 压缩时把 reference prompt 也压短了，压完发现 `architect` 要的产出和 `how` 实际给的对不上（见[第 9 章](/ch/09-self-improve)）。cstack-second-pass 用同一组测试和 diff 比较守住行为，cstack-simplify 要求查残留引用；还差一条：重写后核对“上游要的产出”和“下游实际给的”是否仍然对得上。

### 7. 给判定结论配一个机器可读的出口

`watch-pr` 用退出码表达 READY / BLOCKER / TIMEOUT，CI 和 agent 按退出码分支，不用解析一段话；`log.sh` 防表格公式注入的做法也值得照抄（见[第 9 章](/ch/09-self-improve)）。cstack 的 EVIDENCE 是 Markdown，三值结论要供机器消费，只能靠解析文本。cstack 明确不做脚本状态机，退出码出口不是状态机：给 `PASS / FAIL / NOT VERIFIED` 配一个确定性的报告命令，加的是纯函数式的出口，不是运行时。

## 不照搬的地方

```callout bad 不做一个吞掉所有流程的入口
poteto-mode 是一个大入口加 23 个 playbook。它的好处是用户只记一个命令。代价是入口文件越长越大，而且和别的技能体系混用时会冲突（[第 10 章](/ch/10-community) @matheusdmlopes 的反馈）。cstack 的选择写在 README 里：六个阶段是一张地图，不是必须按顺序执行的流水线。这个约定不改。
```

```callout bad 不把她的原则搬进 cstack-core
pstack 的 24 条原则偏工程手艺：怎么删代码、怎么做原型、怎么穷尽设计空间。cstack-core 的 19 条自述“只固定两件事：不可违反的判断强制约束和产物叫什么、字段有哪些”。层次不同：手艺搬进判据会变成教条，判据里混进手艺会挡住方法演进。可以学她“一行触发条件 + 一句核心要求 + 叶子放细节”的写法，以及“用名字纠偏”的用法。
```

```callout warn 不照搬“不问人”的默认
poteto-mode 的 Autonomy 允许可逆的外部动作（发团队消息、更新工单）不问就做。cstack 明确规定“不因用户一句话自动提升权限；不默认提交、推送、合并、部署”，cstack-ship 把就绪、授权和实际执行结果分开表达，授权用 GO / HOLD / NO-GO。保持现状。
```

## 一个完整的对照示例

同一个“重试导致重复通知”的 bug，两套体系怎么走：

| 阶段 | pstack | calvingit/cstack |
|---|---|---|
| 意图 | prompt 四要素；首条回复先复述目标 | cstack-clarify 定未决选择，cstack-specify 把验收标准写成 SPEC |
| 理解 | Bug fix 第 2 步：how + why，二分排查 | cstack-diagnose 先建反馈回路再定位；how / why 手动追问 |
| 实现 | 委派子 agent，失败复现先提交 | cstack-implement 按 SLICES 切片实现，切片只增不改；test-first 先写失败测试 |
| 验证 | 项目验证技能在同一界面复现，贴前后输出 | cstack-verify 逐条判定 PASS / FAIL / NOT VERIFIED，证据绑定合并候选写进 EVIDENCE |
| 收尾 | Opening a PR，Babysit，Shipping | cstack-review 审查，cstack-ship 按就绪、授权、执行三分交付 |

两边的骨架很像。差别在于 pstack 把它写在一个 playbook 里，cstack 把它分给六个阶段的技能，靠产物链 DECISIONS → SPEC → TECH → SLICES → EVIDENCE 串起来——每一步的输出是下一步的输入，收尾的 EVIDENCE 绑定着合并候选本身。

```exercise 练习
- 打开 cstack-create-verification-skill 的 SKILL.md，对照第 6 章 create-verification-skill 的五步，列出两边 harness 契约的字段差别
- 给 CRITERIA.md 的五级证明层级各补一个你自己的真实例子，标出你平时常停在哪一层
- 挑三个 cstack 技能，检查 description 里“……时使用”是不是用户会说的原话
- 在你的 AGENTS.md 里给每条规则标一个执行机制，数一数写着“无”的有几条
```
