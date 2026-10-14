# 第 0 章 导读

## pstack 到底是什么

用一句话说：pstack 是一位工程师把自己“怎么带 agent 干活”的习惯写成了文件。它不是框架，也不是新工具，是一组 Markdown。

拆开看有四层：

| 层 | 数量（0.15.23） | 作用 | 你会怎么接触它 |
|---|---|---|---|
| 入口 `/poteto-mode` | 1 | 读你的请求，挑一个 playbook，按步骤调别的技能 | 每个严肃任务都以它开头 |
| playbook | 23 | 某类任务的步骤清单（修 bug、做功能、上线……） | 通常不直接点名，由入口挑 |
| 功能技能 | 28 | `/how`、`/architect`、`/swarm`、`/create-verification-skill` 等 | 入口会按步骤调用；偶尔你自己点名 |
| 原则 | 24 | `principle-*`，硬约束和判断标准 | 不用调用，用名字纠偏 |

这些数字是我按 2026-10-14 的源码目录数出来的 【已核实】。0.15.17 以来新增了 `/in-your-own-words`，功能技能的数量是重新数过的。

## 为什么值得系统地学

很多人第一次看 pstack，觉得只是“又一套 prompt”。我的看法不一样。它值得学，是因为它把三件常被分开讨论的事绑在了一起：

1. **需求怎么说清楚**。一个好 prompt 只要目标、完成条件、证据、约束。
2. **怎么证明做完了**。每个 playbook 都以“在真实界面上验证”结尾，验证方法由项目自己的验证技能提供。
3. **怎么从错误里学**。同一个错误出现两次，就改仓库让它不能再发生（`/correct`），而不是多写一句提醒。

单独看每一条都不新。把它们写成一个 agent 每次都会照做的流程，才是 pstack 的价值。

## 这门课怎么组织

- 第 1 章讲她的设计哲学。后面所有机制都是从这里推出来的，建议别跳。
- 第 2 章拆 `/poteto-mode` 的源码：Non-negotiables、原则索引、Autonomy、Subagents、回复写法。
- 第 3~5 章是核心回路：理解、设计、构建。
- 第 6 章讲验证。这是整套东西的地基。
- 第 7 章讲并行与过夜运行。
- 第 8、9 章是原则体系和自我改进。
- 第 10 章收集 X 上的教程、实战数据和质疑。
- 第 11 章对照 calvingit/skills。

## 读的时候注意三件事

```callout warn 数字大多是自述
“每月 2000 PR”“2500 PR”“160 倍提速”都来自作者或用户自己的帖子，没有第三方审计。课程引用时会标 【未核实】。把它们当成方向信号，别当基准。
```

```callout warn 依赖 Cursor 的部分
Custom Mode、云端 agent、Projects 是 Cursor 的功能。`/deslop`、`control-ui`、`control-cli` 在另一个插件 cursor-team-kit 里。社区已经把 pstack 移植到 Claude Code、Codex、opencode、Hermes（见第 10 章），但移植版的效果我没有核实。
```

```callout tip 先读源码
pstack 的技能文件都很短。遇到课程里讲不清的地方，直接打开 [poteto-mode/SKILL.md](https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/SKILL.md) 读原文，通常五分钟能找到答案。
```

```exercise 开始之前
- 装好 pstack（Cursor 里输入 `/add-plugin pstack`），或者至少把仓库 clone 到本地
- 打开 `skills/poteto-mode/SKILL.md`，数一下 Non-negotiables 有几条
- 想一个你最近让 agent 做、结果返工的任务，记下来，后面章节会反复用到它
```
