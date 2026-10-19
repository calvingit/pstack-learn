# 第 7 章 并行与自治：swarm / babysit / shipping / 过夜循环

这一章是第 1 章“信任先于并行”的兑现。前提只有一个：你已经有能用的验证技能。没有它，下面所有东西都只是“更快地产出没人检查的东西”。

这里的 `/swarm` 是 [Coverage / race](/ch/03-understand)：多个 worker 拿不同的切片，或者拿同一个任务赛跑，最后汇成一张表。而 shipping 每轮都换 verifier，是 [Author ≠ critic](/ch/03-understand) 那条规矩在并行情形下的落地。

## 上循环之前的四个前提

官方指南第 7 页列了四条，全部满足才让循环自主运行，否则就在旁边看着它跑：

1. 你自己做过一次这个任务，或者看 agent 做过，知道“好”长什么样。
2. agent 有你会用的工具和信号：验证技能、profiler、日志。
3. 每个阶段都会证明自己的工作，达不到标准能“停线”。
4. 你读过几份运行记录，把反复出现的失败变成了工具、技能或检查。

第 4 条把第 9 章的 `/correct` 和这里连起来了：自治不是一次配置好的，是一轮轮纠正出来的。

## 过夜合约

指南给的示例只有四行：

```text
/poteto-mode im going to bed. migrate every caller to the new parser in a fresh worktree off <base>.
done means zero old callers, all parser fixtures pass, old api deleted.
keep a decision log. don't ask me before committing.
/loop until done. if you're truly stuck after a few hours, stop and write up why.
```

每一行买到了什么：

| 行 | 作用 |
|---|---|
| im going to bed | 会话覆盖，agent 不再停下来问 |
| fresh worktree off `<base>` | 和你开着的其他东西隔离 |
| done means… | 把目标变成每轮都能跑的检查 |
| keep a decision log | 早上可以审计 |
| don't ask me before committing | 提前回答它会卡住的权限问题 |
| /loop until done | Cursor 自带的唤醒机制，不是 pstack 技能 |
| if you're truly stuck… write up why | 逃生口 |

逃生口这一条，指南的评价是：它“胜过八个小时创造性地重新解释目标”。没有逃生口的循环，卡住时最常见的行为是悄悄放宽完成条件，然后宣布成功。

### 每一轮做什么

```text
检查完成条件 → 做最小的有依据的改动 → 在真实产物上验证 → 有进展？
  是 → 提交        否 → 丢弃
→ 记一行决策 → 回到开头
```

“一个改动、一个检查、一行日志”。没帮上忙的改动丢掉，不留着；平台期意味着换方向，而不是停；完成条件**永远不会悄悄放宽**。

### 早上的审计

`/show-me-your-work` 的 TSV 每行记录时间、阶段、决定、理由、证据指针、结果。你回来后输入：

```text
/show-me-your-work catch me up on what you did last night
```

它会先派一个**不同模型家族**的评审读日志和记录，回复最后有一个 Attention 段，列出值得你细看的地方。先读这一段。指南的说法是：你在审计决定，不是在重读整个会话。

## 从一个任务到一队任务

| playbook | 适合 | 谁合并 |
|---|---|---|
| Autonomous run | 一个任务跑到完成条件 | 看合约 |
| Autopilot-full | 一队**互相独立**的 PR | 每个 PR 一个 owner，但 owner 不能凭自己的判定合并，要等一组新的 verifier 判定。0.15.24 起只留规则；每小时一跳，只要有变化就按 `/ketchup` 的口吻汇报，**没变化就闭嘴** |
| Autopilot-stack | 一队**有耦合**的改动 | 不上线。早上你拿到一条线性的栈，每一环都有判定，你自己合。0.15.24 起只写它和 full 不同的地方 |
| Orchestrate | 多天的项目、成百个子 agent | 一个常驻协调者聊天 |

## Babysit 和 Shipping：把 PR 拆成两半

这两个 playbook 的分工是 pstack 里我最想照抄的设计之一。

**Babysit** 把 PR 或一叠 PR 推到“可以合并”：

- 先声明模式（drive / background / threads-only）再开始轮询。
- **只处理合并前沿**，也就是最底下那个还没合的 PR。上面的评论先读、先攒着。
- **一个栈只有一个 babysitter**。
- **不改栈的拓扑**：不 rebase、不改 base、不强推。
- 顺序是冲突 → 评审线程 → CI。冲突是唯一一个“报告而不解决”的阻塞。
- CI 失败先分类。flake 只给一次新构建；同样的失败出现第二次，说明不是 flake。
- **永远不合并**。只有用户明确说 merge / land / ship，才转去 Shipping。

**Shipping** 是后一半：

- 每个 PR **独立**验证。
- 只合**从底部开始、连续通过验证**的那一段。上面有一个验证过的 PR，但它下面有一个没验证的，上面那个也不能合。
- 判定要绑定 head SHA、base SHA 和 `git patch-id`。rebase 会改 SHA，可能悄悄让判定失效。
- 一次合一个，每合一个就重新计算。
- “Green is not safe.” CI 绿不等于安全。

**为什么拆成两半**：推到绿和决定上线是两种不同的权限。把它们放进同一个循环里，agent 很容易因为“已经绿了”顺手合掉。拆开后，合并永远需要一个独立的判定和一个明确的指令。

## /swarm 的几个细节

- 先写完成谓词和要返回的产物，再选形状：切片、赛跑、或混合。赛跑要事先声明是 `first pass`、`rank all` 还是 `best-of`。
- N 是 worker 总数，不是云端并发上限。
- 每个写东西的 worker 有自己的输出位置。测量类任务要写明确切的 SHA 和测量方法（样本数、一个样本是什么、顺序）。
- 每份 brief 自成一体：目标、范围、切片、怎么验证、报告什么。

Pt.1 的性能示例就是 swarm 的典型用法：先用验证技能抓 trace，做针对性修复，再用 `/swarm` 扩大样本确认收益。

## 不推荐 worktree，推荐云端 agent

Pt.1 里她说 git worktree 太占磁盘和机器资源，大约到 10 个就是上限；推荐 Cursor 云端 agent，每个 agent 有自己的电脑，能装依赖、跑应用、录视频。

指南的坑里也有一条：“Parallel agents in one worktree. They overwrite each other and the diff becomes archaeology.”

## 她自己的循环长什么样

- **发版和 QA**：Slack 反馈频道 → Linear 建工单 → 云端 agent 用 pstack 分诊和复现 → 能复现就修，并用一小群 agent fuzz 这个 PR → 没问题就在 Slack 通知她，1 小时内没有异议就 rebase 并自动合并（[原帖](https://x.com/poteto/status/2107527180263829827)）。
- **X 上的用户反馈**：让 bot 盯 X 上对产品的反馈，功能请求进工单，bug 报告交给云端 agent 或 Project 分诊修复，“the loop is complete”（[原帖](https://x.com/poteto/status/2107963437154435182)）【已核实】。
- **16 个 Project 并行时**，她最常用的 prompt 变成了“/bro catch me up on everything since my last message, and if there are any action items for me give me enough context (exec summary) to make a call”（[原帖](https://x.com/poteto/status/2109024196760305861)）【已核实】。这条后来变成了 `/ketchup`。

## /ketchup：回来时先补课

`/ketchup` 只读，告诉你自上一条消息以来发生了什么、哪些事要你拍板。0.15.17 发布后三天里改了三次（[#570](https://github.com/cursor/plugins/pull/570)、[#595](https://github.com/cursor/plugins/pull/595)、[#609](https://github.com/cursor/plugins/pull/609)），方向一直是更短、更像人话：

- **用 `/bro` 的口吻**。说结果对你有什么变化，不说过程。“测试过了”，不说“CI is green”。哈希、路径、命令、测试数量，除非你要用来做决定，否则不写。
- **整条回复 150 字以内**，表格和图里的字也算。字数不够时，先删经过，再删待办。
- **开头一句说有几件事要你处理**，或者说没有。接着一张最多四格的图，每格说你要的一件事做成没有。
- **每个待办两行**：要你做的决定和它的建议，以及你不回会怎样。决定用前后对比的图来呈现，Markdown 表格不算图。
- 它自己能接着做的活不算你的待办，也不许为了凑数编一个待办出来。

#595 的数据是：旧版在 Opus 5.5 上回复的中位数是 736 个词，15 次里只有 8 次用了真正的图 【未核实】（PR 描述）。

## 两个脚本修复

- `worktree-audit.sh` 以前拿写死的 `origin/main` 判断分支是否已合并，默认分支叫 `master` 的仓库就会误判。现在按 `origin/HEAD`、`origin/main`、`origin/master` 依次找，也可以用 `-b` 指定（[#574](https://github.com/cursor/plugins/pull/574)）。
- babysit 用的 `watch-pr` 以前只读前 100 个 review thread，更后面没解决的评论挡不住“可以合并”的判断。现在会翻页读完（[#484](https://github.com/cursor/plugins/pull/484)）。

@viticci（MacStories）描述了一个类似的外层/内层结构：外层是 bot 协调每个应用各自的线程，内层是 Cursor Project 在云端 VM 里跑多个 agent，QA bot 进来验证；他说自己“religiously”用 pstack 和验证技能（[原帖](https://x.com/viticci/status/2107629523814498673)）【已核实】。

```callout warn 成本
指南自己承认：“pstack spends extra tokens on subagents and review panels. That's the price of the rigor.” 省钱办法：`/setup-pstack` 选小预算、代码角色用便宜模型、缩短评审团、小改动不用 `/poteto-mode`。
```

```exercise 练习
- 给一个你想过夜跑的任务写四行过夜合约，确认每一行都对应上表的一项
- 对照四个前提，诚实地标出你的项目现在满足几条
- 读 `playbooks/shipping.md` 第 2 步，用自己的话解释“连续验证通过的那一段”
- 想一想：你现在的 PR 流程里，“推到绿”和“决定合并”是不是同一个人或同一个 agent
```
