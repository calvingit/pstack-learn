# 第 10 章 社区实践与教程合集

这一章收集 X 和网上关于 pstack 的教程、实战、移植和质疑。我按“对学习有什么用”分组，每条都附原帖。数字类结论几乎都是自述，统一标 【未核实】。

## 一、她本人的长文：按这个顺序读

| 顺序 | 文章 | 读它是为了 |
|---|---|---|
| 1 | [How I Use Cursor](https://x.com/poteto/status/2058975157503570132)（2026-05-26） | 理解为什么是“信任”而不是“编排” |
| 2 | [Complete Guide Pt.1：Verification is all you need](https://x.com/poteto/status/2094457600259842065)（09-01） | 验证技能、小 CLI、Feature Map |
| 3 | [Complete Guide Pt.2：supervising someone smarter than you](https://x.com/poteto/status/2097732320606507506)（09-10） | 间接提问、/teach、README 先行、architect |
| 4 | [Coding is dead, long live Coding](https://x.com/poteto/status/2103571281014861957)（09-26） | 态度：手艺在变 |
| — | [Loops You Can Trust](https://x.com/poteto/status/2069824386283319343)（06-25） | 讲第一个验证技能怎么来的；我只拿到标题和开头 【未核实】 |

不登录 X 时，Pt.1 可以在 [Thread Navigator 的镜像](https://threadnavigator.com/thread/2094457600259842065/) 读。

她最近几条长帖也值得读：[volume does matter](https://x.com/poteto/status/2108290818746528017)、[codebases have always contained slop](https://x.com/poteto/status/2109110547824378140)、[time to rewrite 思想实验](https://x.com/poteto/status/2107913381751730352)、[skill compression](https://x.com/poteto/status/2108697834581340358)。

### TTR：一个值得记住的思想实验

10 月 7 日她提出“time to (fully automated, hands off) rewrite”：假设你要把代码库用另一种语言或架构重写，一个工程师带着 agent 需要多久？数字本身不重要，重要的是它逼你问：你为什么不信重写的结果？多半是因为 agent 没法证明新版本和旧版本对用户的可见行为一致。而这个能力缺失，今天就在拖慢你（[原帖](https://x.com/poteto/status/2107913381751730352)）【已核实】。

我觉得这是一个很好的自测：TTR 高的原因，几乎就是你的验证短板清单。

## 二、第三方教程和拆解

### @dotta：四要素 prompt 模板

见第 2 章。他的结论是：“I'm always surprised by how short pro's prompts are. It's less about length.”（[原帖](https://x.com/dotta/status/2108665034226225425)）【已核实】中文转述见 [@Raydong001](https://x.com/Raydong001/status/2108920330270167077)。

### Theo：别照抄，先审计自己的使用历史

据 [@chenchengpro 的中文摘要](https://x.com/chenchengpro/status/2090042073583927318)【未核实】（我没看原视频），Theo 花一周装了 Matt 和 pstack 两套技能，录了 38 分钟，结论是别照抄：

1. 别自己翻 README 挑。让模型审计你几台机器上的真实使用历史，对着两个仓库的技能列表出匹配度排名。
2. 试一个技能不用装，把 SKILL.md 正文粘进对话就能跑。
3. description 应该叫 trigger（见第 9 章）。
4. unslop 的“可移植句子”检验（见第 5 章）。
5. blast-radius 要求别信自己的对话历史，找出关键事实跑代码证明。

还有一个细节：他数了 Matt 技能文件里的破折号，grilling 一页 9 个。这和 poteto-mode “回复里不用长破折号”的规则形成了有趣的对照。

### pvstack Playbook：给初学者的完整入门

[ndilanka 的 pvstack Playbook](https://ndilanka.github.io/pvstack/playbook.md) 是一份把 pstack 打包给 Droid 用的新手指南，解释了技能、playbook、角色表这些概念，也说明了在 Codex 里要输入 `$poteto-mode`。我只读了搜索摘要 【未核实】。

### 中文笔记

- [@songyitian004](https://x.com/songyitian004/status/2108872705319608337) 整理了采访要点：信任、codebase 即记忆、自动化，以及 Feature Map 来自 sitemap 的启发 【未核实】（二手笔记）。
- [@Zhuangxg](https://x.com/Zhuangxg/status/2109059792019083409) 解读 `/ketchup`：最想抄的规则是“Agent 自己能继续做的工作，不算用户待办” 【已核实】。
- [@jz299](https://x.com/jz299/status/2109092165951606910)：用 create-verification-skill 先把前后端功能 map 出来，前端点击截图，后端调 API 看存储和日志 【已核实】。
- [@gyuannn0150 的 X Article](https://x.com/gyuannn0150/status/2108996272460025919)《最近在 X 上很火的 poteto，她是怎么写代码的？》，正文我没读到 【未核实】。

## 三、实战报告

| 谁 | 说了什么 | 链接 |
|---|---|---|
| @DanielLockyer | 自主修复 O(n^3) 事件循环卡顿，160 倍提速 【未核实】 | [帖](https://x.com/DanielLockyer/status/2107427811640188985) |
| @DanielLockyer | 一天 19 个性能 PR 【未核实】 | [帖](https://x.com/DanielLockyer/status/2107090228712456662) |
| @DanielLockyer | 部署时间缩短约 30%，“给 agent 完整的部署日志和源码” 【未核实】 | [帖](https://x.com/DanielLockyer/status/2107051316992254308) |
| @viticci | 外层 bot 协调、内层 Cursor Project，大约两个月主要用手机驱动，“I use pstack and verification skills religiously” 【已核实】 | [帖](https://x.com/viticci/status/2107629523814498673) |
| @heyitsalok | 从 pstack 学到的是验证，给自己的工作做了专门的验证技能 【已核实】 | [帖](https://x.com/heyitsalok/status/2102680815838827005) |
| @vincent_dalmaso | 验证和 review 技能要贴合项目；“the skill grew its own tooling around the check”，还更省 token 【已核实】 | [帖](https://x.com/vincent_dalmaso/status/2100846661379543484) |
| @florentmsl | 把 poteto-mode 的思路用到销售部门：为所有 agent 建共同基础，细节外包给 playbook 【已核实】 | [帖](https://x.com/florentmsl/status/2101219378343588173) |

几条报告的共同点：**有效的都是验证这一块**。@heyitsalok 和 @vincent_dalmaso 都说他们拿走的是“项目专属的验证技能”。

## 四、移植

pstack 源技能以 Cursor 为基准。到 0.15.36，上游已提供 Claude Code 官方生成树和适配文档；下面的社区移植记录保留为历史参考：

- opencode：[@bukanajay](https://x.com/bukanajay/status/2100922740593287209)
- Claude Code（pstack-claude）：[@uehaj](https://x.com/uehaj/status/2106154972496973908)，日语帖 280 多赞
- Hermes Agent 插件：[@Cloeille](https://x.com/Cloeille/status/2101403977988382994)
- Codex（pstack-codex）：[@CodeWithKolin 列表](https://x.com/CodeWithKolin/status/2101249128428896354)
- `/ketchup` 单文件复制到 Claude Code、Codex：[@yupi996](https://x.com/yupi996/status/2109122567286251791)

我没有验证任何一个移植版的质量 【未核实】。用之前要注意：pstack 很多地方依赖 Cursor 的 Task 工具参数（`subagent_type`、`environment: "cloud"`、`run_in_background`），移植版怎么替代这些，决定了它还剩多少原版的严谨。

### 两个仓库级移植

除了 X 上的帖子，有两个成规模的移植仓库，都在 2026-10-14 还有提交：

| 仓库 | 星数 | 覆盖面 |
|---|---|---|
| [michael-denyer/pstack-claude](https://github.com/michael-denyer/pstack-claude) | 约 2.1k | Claude Code、Codex、Copilot、Pi、OpenCode、Gemini、Prime Agent |
| [backnotprop/pstack](https://github.com/backnotprop/pstack) | 约 1.9k | Claude、Codex、Pi，只带技能和原则 |

我用 GitHub API 看过这两个仓库的基本信息（10-15）【已核实】。**它们的内容质量我没有逐项核对**【未核实】。

### Claude Code 官方安装与生成树

当前[上游 README](https://github.com/cursor/plugins/blob/main/pstack/README.md)给出的安装命令是：

```bash
/plugin marketplace add cursor/plugins
/plugin install pstack@cursor-plugins
```

用户输入的技能命令带插件前缀，例如 `/pstack:poteto-mode`、`/pstack:setup-pstack`。第三方 marketplace 默认不开自动更新：在 `/plugin` 的 marketplaces 页选择 `cursor-plugins` 并启用 auto-update；单次手动更新用 `claude plugin update pstack@cursor-plugins`。

Claude Code 安装的是仓库根目录 `harness/pstack/claude-code/` 的生成副本，包含技能、agents、README 和指南。维护源文件后，在上游仓库根目录运行 `node scripts/generate-pstack-harness-trees.mjs`，CI 会检查生成副本是否过期。**规范清单按 `pstack/skills/*/SKILL.md` 计数，不能再把生成树重复计入。** 当前共 58 个技能，其中 24 个是原则技能，另有 23 个 playbook。

### 官方适配：哪些能映射，哪些会跳过

当前行为以[官方 Claude Code adapter](https://github.com/cursor/plugins/blob/main/pstack/docs/harness/claude-code.md)为准。每个会话先读一次 adapter；技能中未列入映射的 Cursor 字段要丢弃并说明，不能把工具 schema 不接受的字段硬传过去。

| pstack（Cursor） | Claude Code 里最接近的 | 注意什么 |
|---|---|---|
| 用户手动输入 `/name` | `/pstack:<name>` | 技能内部调用其他技能时，按 adapter 直接 Read 安装目录的 `skills/<name>/SKILL.md`；Skill 工具会拒绝大多数 pstack 技能 |
| `poteto-agent`、`comment-sicko` | `pstack:poteto-agent`、`pstack:comment-sicko` | `Task` 映射到 `Agent`；`generalPurpose` 映射到 `general-purpose` |
| Claude 模型 slug | `model` 与 `effort` 分开传 | 例如 `claude-opus-5-5-xhigh` 映射为 `opus` + `xhigh`，丢弃 `-fast`；非 Claude slug 不传 model，继承会话模型并说明 |
| `readonly: true` | `Explore` | 仍保留 Bash，brief 另写不得编辑，结束后检查 git status |
| `environment: "cloud"` | `isolation: "worktree"` | brief 指定检出的分支或提交；local 字段省略，后台字段省略，resume 改为新 agent 加旧结果 |
| `~/.cursor/rules/pstack-models.mdc` | `~/.claude/rules/pstack-models.md` | `/pstack:setup-pstack` 写无 frontmatter 的角色规则；**不能把角色行放进 CLAUDE.md 或 AGENTS.md** |
| `.cursor/skills/`、`~/.cursor/skills/` | `.claude/skills/`、`~/.claude/skills/` | 项目技能和用户技能路径按表映射 |
| `agent-transcripts/` | `~/.claude/projects/<slug>/<session>.jsonl` | slug 将工作区路径的 `/` 和 `.` 换为 `-`，只读本工作区；子 agent 在会话的 `subagents/` 下 |
| Cursor Automations、云端 agent 专属能力 | 跳过并报告 | 固定写 `Skipped in Claude Code: <step>. <reason>.`，继续后续步骤；云端隔离本身可映射为 worktree |
| Bugbot | 有现成检查或评论时按普通 PR 线程处理 | 没有 Bugbot 时跳过启动、等待或配置它的步骤 |
| 内置 PR 工具 | `gh pr create` 等选定 forge 命令 | 这是替代实现，不算跳过 |

**掉得最狠的一项是跨家族评审。** 有测评说移植版的 reviewer 之间“只是上下文不同，而不是模型家族不同”。这打在第 3 章讲的 Adversarial panel 上：两个 reviewer 若是同一个家族，agreement 就从高信号退化成同一个偏差说两遍。第 9 章“用不同模型拿第二意见”说的是同一件事。

验法、分工、把规则写成结构，可以带到别的工具里。评审团用哪个模型家族带不走：你手头有几个模型，它才有几个模型。

## 五、质疑和坑

- **验证者成了瓶颈**：[@ohmyclaw1121](https://x.com/ohmyclaw1121/status/2109055137071415320)。
- **“行为不变”只是声明**：[@LilithBailfhny](https://x.com/LilithBailfhny/status/2109150665679519841)（见第 9 章）。
- **AI 时代的容灾**：[@Hacken2077](https://x.com/Hacken2077/status/2109087342938251584) 提出，一个全是 AI 写的大项目，真正能维护的只有 AI；模型宕机、限流、封号、降级时，流程还能不能跑？这是 pstack 没有回答的问题。
- **和 Matt 的技能混用会冲突**：[@matheusdmlopes](https://x.com/matheusdmlopes/status/2098468988586254616) 说两套一起用会打架，最后只有 pstack 的验证技能能和 Matt 的并存 【已核实】。
- **子 agent 不继承模式**：[@the_lezend](https://x.com/the_lezend/status/2099229180928167987)（见第 2 章）。
- **成本**：她自己在指南里承认，并回复说可以用 `/setup-pstack` 设预算（[回复](https://x.com/poteto/status/2107949669695582437)）。

### 第三方对成本和小任务的质疑

这两条不是来自 X，来自第三方博客和测评。单独列出来，是因为它们质疑的是最容易被当成“最佳实践”的部分。

**仪式对小任务过重。** Flavio Copes 的说法是“有时候比一个任务真正需要的仪式更多”。这条我是转引来的，**没有找到原文链接**【未核实】，所以不当成可点击的来源，只当一条社区里的反对意见。pstack 的回应在机制里：playbook 支持 `skip: <原因>` 留痕，她自己也说“大多数改动不需要这些”。但客观地说，23 个 playbook 的重心确实偏向大任务。

**贵，而且不总是更快。** 有测评（[The Neuron](https://www.theneuron.ai/)，转引）报告：同一个任务，不用 pstack 大约 30 分钟，用 pstack 大约 1 小时——**但 pstack 那一遍抓出了三处错误论断**。这组数字和她的“一天几百个 PR”讲的是两件事：前者衡量单一任务的时间和正确性，后者衡量吞吐。如果你的瓶颈是正确性而不是手速，这笔账是划算的；如果相反，就不一定。

```callout warn 怎么读这组数字
都是单一样本，且是别人测的。我用它只是想说明“成本”和“收益”要分开算，不能拿“更快”概括。真要判断，得拿你自己的任务量测。
```

## 六、Matt 和 poteto 的交集

两人 10 月初做了一次直播采访（[Matt 的预告](https://x.com/mattpocockuk/status/2105239236178018636)）。采访视频我没看，不引用内容 【未核实】。采访之后 Matt 发了两条可以核实的帖子：

- 在 AI 时代用**更多**抽象，配合严格 lint，缩小 agent 的设计空间（[原帖](https://x.com/mattpocockuk/status/2106425743479546343)）【已核实】。
- 考虑在 `/retro` 里推荐把重复任务做成 CLI + skill，“fewer tokens, fewer hallucinations”（[原帖](https://x.com/mattpocockuk/status/2108882450617074039)）【已核实】。这就是 Build the Lever。

```exercise 练习
- 按顺序读完她的三篇长文（Cursor、Pt.1、Pt.2），每篇写三条你会用的做法
- 做一次 TTR 思想实验：估计你的项目全自动重写要多久，写出“不信结果”的三个原因
- 从实战报告里挑一条，想清楚它成立需要哪些前提（日志权限、验证技能、性能基线）
```
