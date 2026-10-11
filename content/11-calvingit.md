# 第 11 章 对照 calvingit/skills

这一章把前面学到的东西落到我们自己的仓库上。先明确三条不变的约定：

1. **技能保持独立、原子**。不轻易合并，不打包成一个大技能。只在流程安排上互相指向。
2. **需求对齐跟 Matt，执行验证跟 pstack**。
3. **全局只有 `verify` 角色，具体怎么验由项目自己的验证技能决定**。项目验证技能在 `project-setup` 时由 `verification-setup` 创建。

## 结构对照

| 方面 | pstack | calvingit/skills |
|---|---|---|
| 入口 | 一个 `/poteto-mode` 吞下全部路由 | 多个原子技能，路由在 `workflow-policy` 和 `docs/engineering-skills.md` |
| 流程单元 | 23 个 playbook，作为入口的参考文件 | 独立技能（to-spec、quick-implement、implement、loop……） |
| 共享约束 | 24 条原则，偏工程手艺 | Kernel K01–K17、`task-contract`、`closeout-roles`，偏工作流契约 |
| 需求对齐 | 不是重点（间接提问、/teach） | grilling、wayfinding、to-spec、high-level-design（跟 Matt） |
| 验证 | create/maintain-verification-skill，项目内 `verify-<app>` | verification-setup 生成项目验证技能，`verify` 判定 |
| 自我改进 | `/correct`、`/reflect`、Eval | improve-agents-md、context-audit |
| 收尾 | Babysit / Shipping 分两半，独立判定 | simplify / verify / code-review 三角，独立验收 |

## 已经对齐的地方

- **项目级验证技能**。我们的 `verification-setup` 和她的 `create-verification-skill` 是同一个思路：从仓库证据出发，复用现有 harness，记录 feature map，不改产品代码。我们写的是 `.agents/skills/verify-<surface>/`，她写的是 `.cursor/skills/verify-<app>/`。
- **做的人不验收自己**。Shipping 的“no owner merges on its own verdict”和我们的独立 verify 一致。
- **去复述、保规则**。Phase A/B 瘦身和 #538 同一个方向。
- **事实和推断分开**。她的回复规则“每个结论带证据或标签”和 Kernel 的要求一致。

## 值得借鉴的地方（按收益排序）

### 1. verification-setup 加“交付前自证”和“Doctor”

`create-verification-skill` 第 4 步要求生成的技能交付前端到端跑一次，并且清理后证据还在。Doctor 是一个只读的“这个实例值不值得驱动”检查。这两条可以直接加进我们 `verification-setup` 的 project harness 契约，不影响原子性。

### 2. 维护循环的三种结果

`maintain-verification-skill` 的 clean / changed / blocked，加上“Live pass 必须跑”。我们目前偏重创建和刷新，缺一个周期性的、结果格式固定的维护入口。可以作为 verification-setup 的一个 refresh 模式，而不是新建一个合并型技能。

### 3. blast-radius 的五级证据梯子

“你说的 → 指出那一行 → 走通失败路径 → 跑了脚本 → 在应用里复现”，并说明停在哪一级。可以放进 `code-review` 或 `verify` 的证据标准里，替代“请仔细检查”这类模糊要求。

### 4. benchmark-checklist 的 7 个问题

我们没有专门的性能数字审查。可以作为 `verify` 的一个 reference，在报告性能结论时按需加载。

### 5. 规则 ↔ 执行机制表

`/correct` 的第 4 步。可以加进 `improve-agents-md`：每条规则标出谁来执行（lint、类型、测试、CI、无），“无”的那些是下一批升级对象。

### 6. description 写成触发器

Theo 的观点和 pstack 的实践都指向同一件事：description 要列出用户会说的原话。我们 PR #1 已经给 description 加了 “when to use”，下一步可以检查是否包含真实的触发短语。

### 7. 回复和文档的“可移植句子”检验

加进 `humanizer-zh` 的自查清单。

## 不照搬的地方

```callout bad 不做一个吞掉所有流程的入口
poteto-mode 是一个大入口加 23 个 playbook。它的好处是用户只记一个命令。代价是入口文件很长、天然倾向于越来越大，而且和别的技能体系混用时会冲突（第 10 章 @matheusdmlopes 的反馈）。我们的约定是原子技能，这一点不改。
```

```callout bad 不把她的原则搬进 Kernel
她的原则偏工程手艺，我们的 Kernel 偏工作流契约。两者层次不同。可以学她“一行触发条件 + 一句核心要求 + 叶子放细节”的写法，以及“用名字纠偏”的用法。
```

```callout warn 不照搬“不问人”的默认
poteto-mode 的 Autonomy 允许可逆的外部动作（发团队消息、更新工单）不问就做。我们的流程里，外部可见的动作需要明确授权。保持现状。
```

## 一个完整的对照示例

同一个“重试导致重复通知”的 bug，两套体系怎么走：

| 阶段 | pstack | calvingit/skills |
|---|---|---|
| 意图 | prompt 里写目标、完成条件、证据、约束 | 需求不清时先 grilling；清楚就直接写 Task Contract 的 AC |
| 理解 | Bug fix 第 2 步：how + why，二分排查 | `debug` |
| 实现 | 委派子 agent，失败复现先提交 | `tdd` / `implement` |
| 验证 | 用项目验证技能在同一界面复现，贴前后输出 | `verify` 调项目验证技能，给 PASS / FAIL / NOT VERIFIED |
| 收尾 | Opening a PR，Babysit，Shipping | closeout-roles：simplify → verify → code-review |

两边的骨架很像。差别在于 pstack 把它写在一个 playbook 里，我们把它分给几个原子技能，靠 `workflow-policy` 串起来。

```exercise 练习
- 打开 `engineering/verification-setup/SKILL.md`，对照第 6 章 create-verification-skill 的五步，列出我们缺的步骤
- 给 `code-review` 起草一段证据标准，用 blast-radius 的五级梯子
- 挑三个技能，检查 description 里有没有用户会说的原话
- 在 AGENTS.md 里给每条规则标一个执行机制
```
