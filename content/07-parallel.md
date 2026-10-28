# 第 7 章 并行与自治：swarm / babysit / shipping / 过夜循环

这一章是第 1 章“信任先于并行”的兑现。前提只有一个：你已经有能用的验证技能。没有它，下面所有东西都只是“更快地产出没人检查的东西”。

本章现行指导核对到 **0.15.36**（2026-10-28，上游提交 `c742dd6`）。历史帖子保留为实践背景；执行规则以当前 playbook 和技能源为准。

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

当前 Autonomous run 优先让 watcher 等 CI、合并或 ref 变化等事件，再用长间隔心跳兜底；没有事件才选固定间隔。中途发现的问题，只有**支持当前目标**的才自己处理，例如坏掉的验证工具或相关 bug，范围外修复另开 PR，处理完回到原来的完成谓词。自治不是无限扩大任务。

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
| Autopilot-full | 一队**互相独立**的 PR | 每个 owner 从构建做到合并；root 的独立 verifier 判定通过才授权合并 |
| Autopilot-stack | 同样自治，**由人最后合并** | 当前 head 验证通过且 CI 绿后交接；只有有依赖的 PR 才叠栈，独立项仍从 trunk 分叉 |
| Orchestrate | 超出单 agent 会话预算的多天项目 | 常驻协调者直接派工和监督；每个 PR 的唯一 owner 在异家族 verifier 通过后合并 |

### Autopilot 的验证、交接和保活

[Autopilot-full](https://github.com/cursor/plugins/blob/c742dd6/pstack/skills/poteto-mode/playbooks/autopilot-full.md) 的 root **拥有判定，不拥有 PR 分支**。先确认操作员已经下达 go；要求说明计划不算 go。授权只覆盖队列中的项，人保留的 gate 和队列外 PR 停在 merge-ready。

- **每个 PR 一个云端 owner**，尽早开 PR，让 CI 和 bot 与开发并行。`deslop` 和 `no-comments` 完成后，rebase 到当前 trunk，报告 code-ready head，再做自证。每个后续 head 都要报告；每次需要 verifier 的 push 前，在已提交 head 上跑受影响路径的检查。
- **完整 swarm 先跑一次**，检查 code-ready head，独立重跑 gate、真实界面上的关键行为和 diff。之后只有新行为、重设计或大 diff 再跑完整 swarm；rebase、解冲突、小修复用一个新 verifier，纯措辞修改不派 verifier。每个新 head 仍要有自己的绿 CI，不能拿旧 CI 充数。
- **阻塞必须有证明**，例如当前 head 的失败运行，或 PR 改错的文档行。base 原有的问题不阻塞，除非 PR 复制了问题或新引入可达路径。会影响用户的 bug、失败 gate、错误的交付文档才阻塞，其他发现放后续项。
- **合并前检验真正落地的代码**。merge prep 后 trunk 再变化，不必每次追着 rebase。冲突、双方改同一文件、检查配置改变等会让落地代码未经测试的情况，要 rebase 并等 CI；调用方或依赖变化则在 merge result 上跑检查。同改 lockfile 时，冻结安装通过且相关包解析与 head 一致可以免 rebase。merge prep 之后 trunk 若迫使第三次 rebase，就 hold，交给 root 调整冲突工作的顺序。
- **假设 VM 会死**。尽早 push 并把决策日志写入 root store，每个完成单元都先 push 再开始下一个。记录所有子 agent 的 id、状态及依据同类历史耗时设置的卡住阈值。只强推自己的分支，`--force-with-lease` 钉住最后自己推送或接管的 SHA；发现别人推送就停下报告。
- **gate 不能悄悄放松**。提高预算、加 allowlist 等需要 verifier 证明和 root 新的 countersign。禁用或软失败的检查必须移除；forge 强制的审批不能代签或绕过。

得到 go 后用 `/loop 1h` 审计到委派工作清空。每跳从 trunk 重读 playbook，检查到叶子 agent，依据 push、日志等实际产物判断卡住，而不是相信状态文本。漏记 head 或 agent 是记录漂移，要求 owner 补录；等待 root 或用户的 agent 要先回答它。卡住的立即换新 agent，不等停止命令完成。有用户可感知变化才按 `/ketchup` 汇报，没变化就安静。用户 stop 时所有 owner 收到零写入命令。

[Autopilot-stack](https://github.com/cursor/plugins/blob/c742dd6/pstack/skills/poteto-mode/playbooks/autopilot-stack.md) 继承上述规则，但**不合并**。它替换 full 的合并步骤，等每个 PR 当前 head 验证通过且 CI 绿就交接，交接后未经操作员 go 无人可再 push。真正依赖下层 PR 的改动才以其分支为 base，rebase 也到父分支；栈根到 trunk。下层更新就 restack，上层 `git patch-id` 不变可保留判定。每个 loop 提示都必须点名 stack 文件，防止跑着跑着忘了禁止合并。

旧版“所有 PR 串成一条线、root 统一改拓扑、owner 报 STACK-READY”的说明属于 0.15.25 时期，已不适用于 0.15.36。

### Orchestrate 已经不靠 orch 脚本

[0.15.36 的 Orchestrate](https://github.com/cursor/plugins/blob/c742dd6/pstack/skills/poteto-mode/playbooks/orchestrate.md) 要求协调者用自己的工具管理项目：用 Task 派工，状态放在 Project tracker（`notes.md`）和 Project store；宿主支持时订阅 PR / CI 事件。**不调用编排脚本、不跑轮询循环、不充当 agent 之间的消息或状态中转站**。上游已删除 `scripts/orch/orch.ts`、`store.ts` 和对应测试，旧 `orch init`、inbox/drain、ledger/frontier 命令不再是现行操作步骤。

它保留的核心约束很具体：

- **协调者不写代码，每个 PR 只有一个 owner**。只有 owner 能 push、rebase、改 base 和合并；关闭或重定向下层 PR 会使上层失去基座，必须由协调者决定后再让 owner 操作。旧版统一 stacker 的拓扑写入职责已移除。
- **先贯通一个单元再扩张**，从 kickoff 到 owner、独立 verifier、合并跑完整条路径。每个 kickoff 写清目标、可写和禁写路径、禁止动作，以及能证明完成的命令和预期输出或真实产物。
- **独立任务用新 worker**，默认新云 VM。只有本机运行时检查、本地记录、模拟器或本机授权才用 local。下游需要的上游报告完整写进 kickoff，worker 看不到兄弟会话。需要沿用 checkout、未提交改动或进程状态时 fork；发消息只用于同一工作的后续指令，不能靠发消息查状态。
- **最多三层**：协调者、必要时的子协调者、worker。每个协调者大约维持十个 worker 在途，一个结束就补一个，不等整批。子协调者交汇总，主协调者在运行中抽查其 kickoff。
- **每个 PR 都有异家族、非作者 verifier**。判定绑定当前 head，新 push 要新判定；CI 绿只是输入，行为改动不能只靠类型检查。协调者读 diff 或产物，不能只转述 worker 报告。
- **按实际活动处理失败**。内存或上下文超限就缩小范围，断连用原 kickoff 重试，工具错误换模型。两次重试后放弃该单元并重新规划；迟到的旧 worker 结果先对照当前 PR，独特发现交新 worker 处理。每个派出的 worker 都要交代完成、被替换或范围已被吸收。

报告前用 `gh pr view`、`gh pr checks` 或 forge 等价命令核实 PR 实时状态。偏离范围的工作退回，只修阻塞整个项目的问题，其他留 follow-up。只有不可逆动作、实验无法决定的产品偏好或重规划后仍无解的死路才找人；最终报告交代目标下实际合了什么、每个 PR 的状态和判定、放弃项及原因、等待人的决定。

## Babysit 和 Shipping：把 PR 拆成两半

这两个 playbook 的分工是 pstack 里我最想照抄的设计之一。

**Babysit** 把 PR 或一叠 PR 推到“可以合并”：

- 先声明模式再查状态：`drive` 跑到 merge-ready，`background` 不阻塞仍在执行的计划，`threads-only` 只处理评论，`check` 只查一次并报告。“check on X”以及小 PR、纯文档 PR 用 `check`，不是默认开长循环。
- **只处理合并前沿**，也就是最底下那个还没合的 PR。上面的评论先读、先攒着。
- **一个栈只有一个 babysitter**。
- **Babysit 自己不改栈的拓扑**：不 rebase、不改 base、不强推，冲突向 owner 报告。Autopilot-full / Autopilot-stack 的 owner 同时 babysit 自己的 PR 是例外，它按 owner 职责 rebase 自己的分支，并用钉住已知 SHA 的 lease 发布。
- 顺序是冲突 → 评审线程 → CI。冲突是唯一一个“报告而不解决”的阻塞。
- CI 失败先分类。flake 只给一次新构建；同样的失败出现第二次，说明不是 flake。
- **永远不合并**。只有用户明确说 merge / land / ship，才转去 Shipping。

GitHub 用 `scripts/watch-pr/watch-pr`，`check` 必须加 `--status-only`，裸命令会一直等终态。`drive` / `background` 用动态 `/loop` 接 watcher 唤醒，不另加 sleep 循环。Origin 走自己的 view / thread / checks 命令，不能拿 GitHub watcher 假装覆盖它。GitHub 单 PR 或 stack 到 `READY` 就停；queued 模式不发 `READY`，无阻塞的 `WAITING` / `merge-queue` 要报告 merge-ready 并停止 watcher，不能等到合并才返回。Origin 则以可合并、检查绿、没有未解决阻塞为准。

**Shipping** 是后一半：

- 每个 PR **独立**验证。
- 只合**从底部开始、连续通过验证**的那一段。上面有一个验证过的 PR，但它下面有一个没验证的，上面那个也不能合。
- 判定覆盖受检 patch。信任旧判定前，比较受检 SHA 与当前 head 的 `git patch-id`；restack 不能只看 SHA 变没变。只有测试、文档或 lint 配置的差异时，旧 lane 要证明两次构建除可解释噪声外相同，才能延用；改动本身仍要新检查和评审。没有构建产物的 lane 必须重跑。
- 一次合一个，每合一个就重新计算。
- “Green is not safe.” CI 绿不等于安全。

**为什么拆成两半**：推到绿和决定上线是两种不同的权限。把它们放进同一个循环里，agent 很容易因为“已经绿了”顺手合掉。拆开后，合并永远需要一个独立的判定和一个明确的指令。

## /swarm 的几个细节

- 先写完成谓词和要返回的产物，再选形状：切片、赛跑、或混合。赛跑要事先声明是 `first pass`、`rank all` 还是 `best-of`。
- N 是 worker 总数，不是云端并发上限。
- 每个写东西的 worker 有自己的输出位置。测量类任务要写明确切的 SHA 和测量方法（样本数、一个样本是什么、顺序）。
- 每份 brief 自成一体：目标、范围、切片、怎么验证、报告什么。结果用 `PASS`、`ISSUES`、`BLOCKED` 带证据报告，能证明的问题全部列出，不只报第一个。
- 默认 `generalPurpose`、cloud、后台运行；需要用户电脑上的资源才用 local，非默认已推送分支用 `cloud_base_branch` 指定。模型来自 `swarm workers`，`auto` / `inherit-parent` 继承主对话模型，验证的模型和速度不随普通派工降档。
- 报告缺 brief 要求的 SHA 或测量方法就丢弃，重派一次；第二次仍缺，记为覆盖缺口。worker 退出可以用 N-1 继续，但每个必需切片都得有结果，缺口不能算 PASS。

Pt.1 的性能示例就是 swarm 的典型用法：先用验证技能抓 trace，做针对性修复，再用 `/swarm` 扩大样本确认收益。

## 并行默认用云端，worktree 负责隔离

Pt.1 里她说本机 git worktree 太占磁盘和机器资源，大约到 10 个就是上限；这是当时的个人实践，推荐 Cursor 云端 agent，每个 agent 有自己的电脑，能装依赖、跑应用、录视频。**不是现行规则禁止 worktree**：arena 仍优先用 worktree 隔离候选，Opening a PR 也要求隔离工作区；swarm 和 Orchestrate 默认把 worker 放到云端，确需本机资源才用 local。

指南的坑里也有一条：“Parallel agents in one worktree. They overwrite each other and the diff becomes archaeology.”

## 她自己的循环长什么样

- **发版和 QA**：Slack 反馈频道 → Linear 建工单 → 云端 agent 用 pstack 分诊和复现 → 能复现就修，并用一小群 agent fuzz 这个 PR → 没问题就在 Slack 通知她，1 小时内没有异议就 rebase 并自动合并（[原帖](https://x.com/poteto/status/2107527180263829827)）。
- **X 上的用户反馈**：让 bot 盯 X 上对产品的反馈，功能请求进工单，bug 报告交给云端 agent 或 Project 分诊修复，“the loop is complete”（[原帖](https://x.com/poteto/status/2107963437154435182)）【已核实】。
- **16 个 Project 并行时**，她最常用的 prompt 变成了“/bro catch me up on everything since my last message, and if there are any action items for me give me enough context (exec summary) to make a call”（[原帖](https://x.com/poteto/status/2109024196760305861)）【已核实】。这条后来变成了 `/ketchup`。

## /ketchup：回来时先补课

[/ketchup 的当前源](https://github.com/cursor/plugins/blob/c742dd6/pstack/skills/ketchup/SKILL.md) 要你在执行工作的那个聊天里补课。窗口从你输入 `/ketchup` **之前亲手写的最后一条消息**开始；通知和子 agent 报告不算你的消息。它假定你只记得自己最后说了什么。

- **保持只读**。收集聊天里的工作和报告，复查涉及的 PR、CI、agent 当前状态，核对展示的数字。不能为补课改代码、启动应用或任务、对外发帖，图也只能来自已有事实。
- **用 `/bro` 的口吻**。说结果对你有什么变化。“测试过了”，不说“CI is green”。哈希、路径、命令、测试数量，除非你要用来做决定，否则不写；PR、分支和 agent 用你认识的名字。
- **长度给决定让路**。“发生了什么”的文字少于 100 个英文词，不含图片；每项待决定事项大约 30 词，事项多就增长。两个事项整条通常远少于 150 词，三十项就应该更长。**没有整条 150 词硬上限，更不能为了字数删待办。**
- **开头说在等你做什么，或说没有**。没有变化也没有待办，就说清并结束。接着先内嵌已有截图、视频和能解释变化的图，再按你要求的每件事各用一句说结果：完成、仍在跑、失败或未检查。仍等你决定的不能标完成。最多再加三行关键补充，另用一行交代 agent 自己还能做的工作。
- **每个待办足够单独做决定**。写你的决定、建议、对使用者的变化、证据和风险，附真实链接；关键未知项写 unknown。同一决定覆盖多个 PR 时，建议只写一次，每个 PR 单列，风险高的在前。选项比较要讲全每项收益和成本。只有等待会造成截止期、丢数据等额外代价时才解释等待成本。
- **待办只能是你能做的事**。产品取舍、审批、不可逆动作、缺少的权限才算；早于窗口但还等你的也要保留。agent 能自己继续的工作不算，不能编一个待办凑数。

图是为了讲清连接、依赖、前后差异或选项，不是画一排状态盒子。每图最多六个盒子，每盒最多八个词；Markdown 表格不算图。可见改动已有截图或视频就内嵌，缺截图要标 `No screenshot yet` 并说明屏幕变化，不能生成一张没捕获过的界面冒充证据。同一事实不要在图文里重复。

早期 #570、#595、#609 的短回复改版可以作为历史；旧的“整条 150 词、四格图、每个待办两行”不再是 0.15.36 的现行合约。#595 曾报告 Opus 5.5 旧版回复中位数 736 词、15 次中只有 8 次用了真图 【未核实】（PR 描述），不能拿这组旧数据说明当前效果。

### /ketchup-video：把进展放进带字幕的视频

[新增的 ketchup-video](https://github.com/cursor/plugins/blob/c742dd6/pstack/skills/ketchup-video/SKILL.md) 沿用 ketchup 的收集和待办规则，用短字幕幻灯片视频替代进展摘要和图片。窗口独立从 `/ketchup-video` 前最后一条用户消息开始，不沿用之前 `/ketchup` 的窗口。**在仓库外写入和渲染视频，是只读规则的唯一例外。**

- 用真实截图、录屏、diff、数据做素材，不能把聊天自述当证据。最多十页，越少越好，每页一个观点，在同一画面上逐步变化；不做项目符号清单、状态表或无连接的盒子。
- 输出无声横屏视频，画面铺满，下方固定高度的字幕条。每页一句短字幕，大约十词，解释画面含义，不重念标签；字幕烧进帧里，不能遮住画面。
- 每页完全静止的停留时间，按新增加的字幕和标签文字至少每三词一秒计算，转场不算；首屏所有文字算新增，截图内文字不计。
- 嵌入前检查渲染文件：每页抽一帧按聊天尺寸看字幕可读性，再用视频帧匹配实测每页停留时间。不足就修改重渲染，不能只用静帧检测器把淡入淡出算成停留。

最终回复是开头一句、内嵌视频、agent 自己剩余工作一行、文字待办。**要你拍板的事项仍写在视频下方**，不能只藏进视频。渲染失败就用一行说明，只给待决定事项，不声称已经有视频。

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
