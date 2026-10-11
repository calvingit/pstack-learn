# 第 1 章 设计哲学：想快，先深

pstack 的口号是 “if you want to go fast, go deep first”。这句话很容易被读成鸡汤。这一章把它拆成四个可以检验的主张，再看每个主张推出了哪些机制。

## 主张一：并行的前提是信任

```quote
en: Trying to parallelize agents you don't trust yet is a huge waste of tokens and introduces more slop into your codebase.
zh: 还不信任的 agent 就拿去并行，既浪费 token，又往代码库里塞更多垃圾。
by: @poteto《How I Use Cursor》，2026-05-26
url: https://x.com/poteto/status/2058975157503570132
```

2026 年中，社区的主流做法是在 CLI 外面包一层 orchestrator，一次开十个 agent。她的判断是：这把人变成了调度员，但没回答“输出能不能信”。不可信的输出乘以十，只是十倍的 review 负担。

**这个主张推出了什么**：pstack 的学习顺序是先单 agent，再并行。官方指南第 7 章开头列了上循环之前的四个前提（见第 7 章）。`/swarm` 和 Autopilot 都放在后面，不是入门内容。

**我的看法**：这条对小团队尤其成立。小团队最稀缺的是 review 时间，不是 token。一个能自证的 agent 比三个不能自证的更省人。

## 主张二：瓶颈在验证

```quote
en: The bottleneck with agents is verification.
zh: agent 的瓶颈在验证。
by: @poteto《How I Use Cursor》
url: https://x.com/poteto/status/2058975157503570132
```

Pt.1 的标题干脆叫 “Verification is all you need”。她说验证技能应当被当作“关键基础设施”，甚至“可以给它排值班”。

这里的“验证”不是跑单元测试。她要的是 agent 像用户那样启动应用、点按钮、截图、看数据库里写了什么。原因在 Bug fix playbook 第 4 步写得很直白：

```quote
en: Unit tests show branch behavior, not bug absence.
zh: 单元测试只能说明分支行为，不能说明 bug 不存在。
by: pstack/skills/poteto-mode/playbooks/bug-fix.md
url: https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/playbooks/bug-fix.md
```

**推出的机制**：`/create-verification-skill`、Feature Map、每个 playbook 的“Verify on the matching surface”、Prove It Works 原则。第 6 章细讲。

**她还推得更远**：技术栈越难调试，越难用 agent。为了让 agent 能验证，值得自己造调试工具，甚至换技术栈（Pt.1）。这条很激进，但逻辑一致：如果验证是瓶颈，那影响验证的一切都该优先投入。

## 主张三：代码库就是记忆

```quote
en: I think your codebase is the ultimate form of memory.
zh: 代码库是最好的记忆。
by: @poteto《The Complete Guide to pstack Pt. 1》
url: https://x.com/poteto/status/2094457600259842065
```

她把 agent 比作“永远处于失忆状态的新员工”：能干，但每次都从零开始。解决办法不是给它更长的聊天记录，而是让仓库本身携带知识：

- 规则写成 lint 和类型，而不是写在文档里（`/correct`）。
- 功能怎么用写成 Feature Map，放在验证技能里。
- 重复的操作写成小 CLI 和脚本（Build the Lever）。

**这条和 Matt Pocock 的观点在 10 月汇合了。** Matt 和她聊完后发帖说，应该在 AI 时代用**更多**抽象，配合严格的 lint 规则，缩小 agent 能做的设计空间【已核实】（[原帖](https://x.com/mattpocockuk/status/2106425743479546343)）。几天后又说要在 `/retro` 里推荐“把重复任务做成 CLI + skill”【已核实】（[原帖](https://x.com/mattpocockuk/status/2108882450617074039)）。两个人从不同方向走到了同一个结论：让结构替你说话。

## 主张四：数量重要，但只在质量不降的前提下

她 10 月 8 日的长帖 “volume does matter” 解释了为什么现在开始在意 PR 数量：

- 以前只有极少数“coding machine”能一次拿出一堆 PR，所以数量只在分布两端有意义。
- 现在每个人都能借 agent 变成 coding machine。如果用了 agent 还和以前一样产出，应该停下来想想为什么。
- 前提还是信任。她在帖里直接链回了自己讲信任的文章。
- token 贵，但她按“每单位智能的成本”算，认为半年到一年会便宜很多。

([原帖](https://x.com/poteto/status/2108290818746528017)) 【已核实】

10 月 11 日她又发了一条讲“slop”：代码库里一直都有垃圾，人写的也一样；真正的 Good Code 是正确、无 bug、跑得快又省，这本来就很贵；agent 写不出 Good Code，但“规模上平均会更好”。([原帖](https://x.com/poteto/status/2109110547824378140)) 【已核实】

```callout warn 争议点
这两条帖子的结论依赖“验证做到位”。如果你的项目没法让 agent 自证，按她的逻辑，你应该先投资验证，而不是先追数量。第 10 章收集了几条质疑，比如“verifier 自己会成为瓶颈”。
```

## 四个主张怎样连成一条链

```compare 从哲学到机制
| 主张 | 推出的机制 | 对应章节 |
|---|---|---|
| 信任先于并行 | 单 agent 先跑稳，再开 swarm / autopilot | 第 7 章 |
| 瓶颈在验证 | 验证技能、Feature Map、Prove It Works | 第 6 章 |
| 代码库是记忆 | `/correct`、Build the Lever、原则编码进结构 | 第 9 章 |
| 数量要有质量托底 | 每个 playbook 以真实验证和小提交结尾 | 第 2、5 章 |
```

## 一个常被误读的点：“我不相信规划”

README 写着 “personally, i don't believe in planning. the best spec is code.” 很多人据此认为 pstack 反对写计划。Pt.2 里她澄清过：她也规划，只是用代码规划。抽象计划“只会制造进展的假象”，对抽象计划做对抗评审会让 agent 凭空想出风险。

所以准确的说法是：**不信任没有代码支撑的计划**。她的替代品是原型（Prototype playbook）和带 `not implemented` 函数体的类型草图（`/architect`）。第 4 章展开。

这一点和 Matt 的 grilling 不冲突。grilling 是在动手之前把需求问清楚，属于“意图”；她反对的是在“实现方式”上空谈。我们的仓库正好按这个分工：需求对齐跟 Matt，执行和验证跟 pstack。

```exercise 练习
- 用自己的话写下四个主张，每个一句话
- 回到导读里你记下的那个返工任务：它返工是因为意图没说清，还是因为没人能验证结果？
- 读 [volume does matter](https://x.com/poteto/status/2108290818746528017) 原帖，找出她论证里依赖“信任”的那一句
```
