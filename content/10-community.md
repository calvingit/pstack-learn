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

pstack 写的是 Cursor 插件，社区已经移植到不少地方：

- opencode：[@bukanajay](https://x.com/bukanajay/status/2100922740593287209)
- Claude Code（pstack-claude）：[@uehaj](https://x.com/uehaj/status/2106154972496973908)，日语帖 280 多赞
- Hermes Agent 插件：[@Cloeille](https://x.com/Cloeille/status/2101403977988382994)
- Codex（pstack-codex）：[@CodeWithKolin 列表](https://x.com/CodeWithKolin/status/2101249128428896354)
- `/ketchup` 单文件复制到 Claude Code、Codex：[@yupi996](https://x.com/yupi996/status/2109122567286251791)

我没有验证任何一个移植版的质量 【未核实】。用之前要注意：pstack 很多地方依赖 Cursor 的 Task 工具参数（`subagent_type`、`environment: "cloud"`、`run_in_background`），移植版怎么替代这些，决定了它还剩多少原版的严谨。

## 五、质疑和坑

- **验证者成了瓶颈**：[@ohmyclaw1121](https://x.com/ohmyclaw1121/status/2109055137071415320)。
- **“行为不变”只是声明**：[@LilithBailfhny](https://x.com/LilithBailfhny/status/2109150665679519841)（见第 9 章）。
- **AI 时代的容灾**：[@Hacken2077](https://x.com/Hacken2077/status/2109087342938251584) 提出，一个全是 AI 写的大项目，真正能维护的只有 AI；模型宕机、限流、封号、降级时，流程还能不能跑？这是 pstack 没有回答的问题。
- **和 Matt 的技能混用会冲突**：[@matheusdmlopes](https://x.com/matheusdmlopes/status/2098468988586254616) 说两套一起用会打架，最后只有 pstack 的验证技能能和 Matt 的并存 【已核实】。
- **子 agent 不继承模式**：[@the_lezend](https://x.com/the_lezend/status/2099229180928167987)（见第 2 章）。
- **成本**：她自己在指南里承认，并回复说可以用 `/setup-pstack` 设预算（[回复](https://x.com/poteto/status/2107949669695582437)）。

```callout tip 第四条和我们直接相关
“混用会冲突”正是我们按领域分工的理由：需求对齐跟 Matt，执行验证跟 pstack，每个技能原子化，不让两套入口同时争夺同一个任务。
```

## 六、Matt 和 poteto 的交集

两人 10 月初做了一次直播采访（[Matt 的预告](https://x.com/mattpocockuk/status/2105239236178018636)）。采访视频我没看，不引用内容 【未核实】。采访之后 Matt 发了两条可以核实的帖子：

- 在 AI 时代用**更多**抽象，配合严格 lint，缩小 agent 的设计空间（[原帖](https://x.com/mattpocockuk/status/2106425743479546343)）【已核实】。
- 考虑在 `/retro` 里推荐把重复任务做成 CLI + skill，“fewer tokens, fewer hallucinations”（[原帖](https://x.com/mattpocockuk/status/2108882450617074039)）【已核实】。

第二条就是 Build the Lever。这对我们是一个信号：Matt 那边很可能会在 retro 类技能里加入“造工具”的建议，值得在跟踪里留意。

```exercise 练习
- 按顺序读完她的三篇长文（Cursor、Pt.1、Pt.2），每篇写三条你会用的做法
- 做一次 TTR 思想实验：估计你的项目全自动重写要多久，写出“不信结果”的三个原因
- 从实战报告里挑一条，想清楚它成立需要哪些前提（日志权限、验证技能、性能基线）
```
