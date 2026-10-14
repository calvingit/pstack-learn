# 第 9 章 自我改进：/correct、/reflect、写技能、#538 瘦身

前八章讲的是怎么用 pstack。这一章讲 pstack 自己怎么变好，以及你怎么让自己的技能和仓库变好。核心思想只有一句：

```quote
en: every time you intervene and correct your agent, you should think about how to eliminate it entirely.
zh: 每次你纠正 agent，都应该想办法让这类问题彻底消失。
by: @poteto，2026-08-17
url: https://x.com/poteto/status/2089067865098113024
```

她在那条帖子里按价值排了四种手段：用更好的架构或数据结构从根上消除 > 写成 lint 或测试让 CI 拦住 > 写成 skill 或 rule > 靠人工 review。最后一种她的评价是 “ngmi”。

## /correct：让错误不能再发生

`/correct` 是这个排序的执行版。它的开头先设定了一个前提：

```quote
en: Assume every contributor is an agent that sees only the files it opened, copies the nearest example, and takes the shortest path that compiles.
zh: 假设每个贡献者都是一个只看到自己打开的文件、复制最近的例子、走能编译的最短路径的 agent。
by: pstack/skills/correct/SKILL.md
url: https://github.com/cursor/plugins/blob/main/pstack/skills/correct/SKILL.md
```

然后分四步：

**1. 找错误类别**。读最近的提交、revert、评审评论、agent 指令文件、解释 workaround 的注释。把错误分类。**一个类别出现两次才算数。**

**2. 在能用的最高层修**：

| 层 | 做法 | 为什么排在这里 |
|---|---|---|
| 架构 | 每块状态一个 owner、每个任务一种支持的方式；隐藏内部让错误的 import 失败；手工同步的列表换成单一来源；删掉 agent 会复制的旧方式和死代码 | 错误根本写不出来 |
| 类型 / lint / CI | 坏状态写不出来；还能编译的话，加一个 lint，**错误信息说出该用哪个文件、类型或函数**；已经很常见的模式只在新增时失败 | 写出来就被拦 |
| 测试 | 修或删掉“所有函数返回空也能过”的测试 | 运行时被拦 |
| 文档 / agent 规则 | 只用于判断题 | “Nothing fails when an agent skips them.” 跳过了也不会失败 |

**3. 修并证明**。最常见的类别现在就修，一个类别一个提交。**证明每个新检查能拦住一个真实发生过的旧错误。** 本地和 CI 跑同一个命令。例外要写在那一行上，附理由、过期日期和人的批准。

**4. 维护规则表**。在 agent 指令文件里维护一张“规则 ↔ 执行机制”的表。被纠正时，修错误并加规则。如果规则早就在表里但没有东西执行它，那就是重犯，要在同一个改动里升到最高层。错误不可能再发生时，删掉那条规则。

```callout tip 为什么“证明新检查能拦住旧错误”很关键
很多 lint 规则写出来从没拦住过任何东西，因为它匹配的模式和真实错误不一样。拿一个真实的历史错误去跑新检查，看它失败，这一步把“我觉得有用”变成了“证明有用”。
```

**我的看法**：这张“规则 ↔ 执行机制”表是最容易落地的部分。哪怕你不跑 `/correct`，也可以给自己的 AGENTS.md 加一列“谁来执行这条规则”，写着“无”的那几行就是下一批该升级的。

## /reflect：会话结束后的复盘

`/reflect` 在会话结束后挖掘可以长期保留的经验，再把每条路由到某个**已有技能**的具体修改上。

- 只在你说 “reflect” 时运行。琐碎的、跑题的、已有技能覆盖且被正确遵守的对话直接跳过。“One-offs are not learnings.” 一次性的事不算经验。
- 只读当前会话的记录，**不跨工作区去 glob 别的项目**，因为那会读到别的私人聊天。
- 三个评审从不同角度并行审视，汇总后**等你批准再改技能**。

和 `/correct` 的区别：`/correct` 改仓库让错误不能发生；`/reflect` 改技能让 agent 下次做得更好。按她的价值排序，能用 `/correct` 解决的优先用 `/correct`。

## 写技能：Authoring 和 Eval 两个 playbook

**Authoring or modifying a skill** 只有四步：用 Cursor 自带的 create-skill → 校验（frontmatter 有 name 和 description、引用的文件存在、跨技能链接能解析）→ 结构性的改动写测试用例 → 开 PR。

后面那段写作建议很短，值得逐句读：

- When in doubt, delete. 拿不准就删。
- Keep only prose that changes a decision. 只留会改变决定的文字。
- Tell it to do the thing and skip the reason. 直接让它做，跳过理由；只有规则不解释就会让人困惑时才解释。
- 能指向结构性来源（类型、README、配置）就指向，不要复述。

**Eval** 用来在推广之前测一个技能改动对 agent 行为的影响。它最有意思的是“盲测”要求：

- 候选看到的任何目录、文件、prompt 里都不能出现 eval、test、judge、benchmark、arena 这类词。
- prompt 要像一个真实用户的请求。
- 不要让候选列出它用了哪些技能和原则，从代码形状判断它有没有遵循，不靠自述。
- 不告诉候选还有别的候选。
- 评委知道自己在评，但只看到脱敏的标签，看不到模型名。

这些规则防的是“观察者效应”：模型一旦知道自己在被测，行为就会变。

```callout tip Theo 的一条补充
Theo 在对比视频里说，`description` 这个字段名起错了，应该叫 trigger。模型平时只看得到名字和描述，靠它决定要不要拉进上下文，所以描述的职责是“在该触发的时候触发”，而不是概括功能（转引自 [@chenchengpro 的摘要](https://x.com/chenchengpro/status/2090042073583927318)）【未核实】。pstack 的 description 基本都按这个思路写：列出用户会说的原话。
```

## #538：规则全留，文字变短

2026-10-11 上午她发帖说 pstack 小了 10%，行为不变（[原帖](https://x.com/poteto/status/2109116030761230571)）。对应的是 [PR #538](https://github.com/cursor/plugins/pull/538)，版本 0.15.15 → 0.15.16。

| 指标 | 之前 | 之后 | 变化 | 来源 |
|---|---|---|---|---|
| 字节 | 169,348 | 153,004 | −9.7% | PR 描述 【未核实】（我没重新量） |
| 词数 | 26,177 | 23,829 | −9.0% | PR 描述 【未核实】 |
| diff | | | 36 个文件，+406 / −736 | `git show --stat` 【已核实】 |

PR 的口号是 “Every rule stays. Only the text that carries it gets shorter.” 具体做法：

- 一批 `principle-*` 缩短 description 和正文。
- 原则索引的命名规则只写一次。
- `how`、`why`、`interrogate`、`arena`、`reflect`、`figure-it-out`、`benchmark-checklist`、`technical-writing`、`unslop` 的步骤和 reference prompt 压短。
- `architect` Phase A 顺手修了一处错：原来要求 `how` 产出 “traced model”，实际 `how` 产出的是 “architectural explanation”。

最后一条说明压缩不只是删字。把文字压短的过程中，会发现原来写错或者对不上的地方。

**行为不变是怎么保证的？** 我没看到这次压缩的完整评估结果。@LilithBailfhny 也指出了这一点：“行为不变”是作者的声明，她贴出了盲测指南，但没公布这次的对比结果；工具占用少 10% 也不能直接换算成任务便宜 10%（[原帖](https://x.com/LilithBailfhny/status/2109150665679519841)）。这个质疑是成立的。

```callout ok 我们做过同样的事
calvingit/skills 的 Phase A/B 瘦身（PR #3、#4）也是“去复述、保规则”：路由改成指向 `workflow-policy`、Profile 一行化、抽出 `closeout-roles`。和 #538 同一个思路。可以借鉴的新点是：reference prompt 也要压，以及压的同时检查有没有对不上的引用。
```

## 0.15.17 到 0.15.23

#538 之后几天，她接着往下删、往清楚改：[#571](https://github.com/cursor/plugins/pull/571) 再删七个技能里用不上的段落，`/ketchup` 三天改了三版，又加了一个只有一句话的技能。每个版本的改动见[第 12 章 更新记录](/ch/12-changelog)。

### /in-your-own-words：先复述，再动手

这是 pstack 最短的技能，正文只有一句：用你自己的话说出你认为用户的目标是什么、想解决什么问题。它只在你手动输入时运行（[#602](https://github.com/cursor/plugins/pull/602)）。

第一版写的是“复述目标和意图，等用户确认再开始”。第二版（#606）改成问目标和问题，删掉了“等确认”。复述本身就能暴露误解，要不要停下来由你决定。

用法很简单：交代完一件复杂的事，先打 `/in-your-own-words`，看它理解得对不对，再让它开工。

## /automate-me：从你的记录里生成你的 mode

`/automate-me` 读你的对话记录，生成一个 `<你的名字>-mode`。这其实是 pstack 的元目标：poteto-mode 是她的工作方式，你应该有你自己的。指南第 9 页的标题就叫 “Make it yours”。

```exercise 练习
- 翻你最近 20 条对 agent 的纠正，找出出现两次以上的错误类别
- 给其中一个类别挑最高可行层（架构 / 类型 / lint / 测试 / 文档），并说明为什么更高一层不行
- 给你的 AGENTS.md 加一列“执行机制”，统计写着“无”的有几条
- 挑一个你写的技能，按“只留会改变决定的文字”删一遍，对比前后字数
```
