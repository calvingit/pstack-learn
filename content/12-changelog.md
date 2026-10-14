# 第 12 章 更新记录

这一章按 [cursor/plugins](https://github.com/cursor/plugins/commits/main/pstack) 的提交历史整理 pstack 每个版本改了什么，新版本在前。版本号取自 `pstack/.cursor-plugin/plugin.json` 的改动，日期是该版本号提交的北京时间。条目是我对 PR 标题和描述的转述，细节以 PR 原文为准。

课程正文以 0.15.23 为准。

## 未发布（2026-10-14 合入 main）

- `/ketchup` 改成 `/bro` 的口吻，整条回复压到 150 词内，图里的字也算（[#609](https://github.com/cursor/plugins/pull/609)，见[第 7 章](/ch/07-parallel)）

## 0.15.23（2026-10-14）

- `/in-your-own-words` 改成复述“用户的目标和要解决的问题”，去掉“等确认再开始”（[#606](https://github.com/cursor/plugins/pull/606)）

## 0.15.22（2026-10-14）

- 新增 `/in-your-own-words`：动手前先用自己的话复述目标，只在手动输入时运行（[#602](https://github.com/cursor/plugins/pull/602)，见[第 9 章](/ch/09-self-improve)）
- `/ketchup` 回复控制在 250 词内，用真正的图代替表格（[#595](https://github.com/cursor/plugins/pull/595)）
- `principle-fix-root-causes` 加一条：挖得很深才找到的事实，要提议一个便宜、常开的信号（[#604](https://github.com/cursor/plugins/pull/604)，见[第 8 章](/ch/08-principles)）
- `poteto-agent` 没拿到路径时自己去插件目录找 poteto-mode，删掉不生效的 frontmatter，README 说明 `/` 菜单（[#597](https://github.com/cursor/plugins/pull/597)）

## 0.15.21（2026-10-13）

- poteto-mode 说明打包的叶子技能放在哪里，并把自身绝对路径交给每个 `poteto-agent`（[#577](https://github.com/cursor/plugins/pull/577)，见[第 2 章](/ch/02-poteto-mode)）

## 0.15.20（2026-10-12）

- 收到 `/poteto-mode` 的对话自己跑 playbook，`poteto-agent` 只做派活外壳（[#575](https://github.com/cursor/plugins/pull/575)）
- 根目录新增 Agent Plugins 1.0.0 格式的 `plugin.json`（[#576](https://github.com/cursor/plugins/pull/576)）
- `create-verification-skill` 的“就绪”改为应用能用，不再看端口通没通（[#573](https://github.com/cursor/plugins/pull/573)，见[第 6 章](/ch/06-verification)）
- Comment Sicko 的 agent id 改成 `comment-sicko`，Grok 能派了（[#486](https://github.com/cursor/plugins/pull/486)）
- `unslop` description 删掉 “Must always apply.”（[#572](https://github.com/cursor/plugins/pull/572)）
- `worktree-audit.sh` 按默认分支判断是否已合并（[#574](https://github.com/cursor/plugins/pull/574)）；`watch-pr` 翻页读完所有 review thread（[#484](https://github.com/cursor/plugins/pull/484)）；计划检查正确处理代码围栏（[#536](https://github.com/cursor/plugins/pull/536)）

## 0.15.19（2026-10-12）

- 七个技能删掉复述的规则、通用步骤和返回格式，相关文件少了约 42%（[#571](https://github.com/cursor/plugins/pull/571)）

## 0.15.18（2026-10-12）

- `/ketchup` 每个待办用前后对比的图呈现（[#570](https://github.com/cursor/plugins/pull/570)）

## 0.15.17（2026-10-11）

- 新增 `/ketchup`：只读，告诉你上条消息以来发生了什么、哪些事要你拍板（[#539](https://github.com/cursor/plugins/pull/539)）

## 0.15.16（2026-10-11）

- 压缩技能提示词，规则不变，总量少约 10%（[#538](https://github.com/cursor/plugins/pull/538)，见[第 9 章](/ch/09-self-improve)）

## 0.15.15（2026-10-06）

- 去掉 Sol，默认模型改为 Opus xhigh 和 Grok（[#511](https://github.com/cursor/plugins/pull/511)）

## 0.15.14（2026-10-06）

- 没有模型规则时，`/poteto-help` 会问要不要跑 `/setup-pstack`（[#509](https://github.com/cursor/plugins/pull/509)）

## 0.15.13（2026-10-06）

- 官方指南补上 `/correct`、多 PR 清单和 prompt 写法（[#508](https://github.com/cursor/plugins/pull/508)）

## 0.15.12（2026-10-06）

- `/poteto-help` 加 prompt 写法参考（[#507](https://github.com/cursor/plugins/pull/507)）

## 0.15.11（2026-10-06）

- `/poteto-help` 只在手动输入时运行（[#506](https://github.com/cursor/plugins/pull/506)）

## 0.15.10（2026-10-05）

- 新增 `/poteto-help`（[#502](https://github.com/cursor/plugins/pull/502)）

## 0.15.9（2026-10-04）

- perf-issue 第 2 步直接列性能口诀（[#496](https://github.com/cursor/plugins/pull/496)）

## 0.15.8（2026-10-04）

- `/architect` 的设计要能扛住 agent 常犯的错（[#495](https://github.com/cursor/plugins/pull/495)）

## 0.15.7（2026-10-04）

- 新增 `/correct`：同类错误出现两次就改结构（[#494](https://github.com/cursor/plugins/pull/494)，见[第 9 章](/ch/09-self-improve)）

## 0.15.6（2026-10-03）

- 从私有技能库移植：explain-the-number 原则、默认开新子 agent、autopilot 每小时一轮、PR 标题格式、先定 schema 再转换（无 PR 号，直接提交）

## 0.15.5（2026-09-24）

- 解决规则冲突，各处读模型规则的方式统一（[#422](https://github.com/cursor/plugins/pull/422)）

## 0.15.4（2026-09-24）

- 再删 19 条 Opus 5.5 不需要的指令（[#419](https://github.com/cursor/plugins/pull/419)）；公开升级说明去掉旧模型名（[#416](https://github.com/cursor/plugins/pull/416)）

## 0.15.3（2026-09-23）

- 移植技能更新，默认模型改为 Opus 5.5 和 Grok 4.7（[#414](https://github.com/cursor/plugins/pull/414)）
- `/setup-pstack` 先问预算档位：max / xhigh / high / medium（[#366](https://github.com/cursor/plugins/pull/366)）
- bug-fix、perf、hillclimb 默认用 Grok 4.6（[#365](https://github.com/cursor/plugins/pull/365)）

## 0.15.2（2026-09-11）

- 人称改中性，对话里加状态更新（[#362](https://github.com/cursor/plugins/pull/362)）

## 0.15.1（2026-09-10）

- 每个结论都要带证据，或者标明没核实（[#341](https://github.com/cursor/plugins/pull/341)）

## 0.15.0（2026-09-08）

- 全量压缩文字，新增两条原则（[#329](https://github.com/cursor/plugins/pull/329)）；技能正文里的分号、破折号换成句号或逗号（[#331](https://github.com/cursor/plugins/pull/331)）；同步 README 计数（[#333](https://github.com/cursor/plugins/pull/333)）

## 0.14.8（2026-09-03）

- logo 压到 512KiB 以下（[#309](https://github.com/cursor/plugins/pull/309)）

## 0.14.7（2026-09-02）

- 加插件 logo（[#303](https://github.com/cursor/plugins/pull/303)）

## 0.14.6（2026-09-02）

- 五个技能关闭模型自动调用（[#300](https://github.com/cursor/plugins/pull/300)）
- 移植不绑定代码托管平台的 playbook，默认模型换成 Fable 5.1（无 PR 号）

## 0.14.5（2026-08-28）

- `make-bot-ui` 挪到 skills 根目录注册（[#275](https://github.com/cursor/plugins/pull/275)）

## 0.14.4（2026-08-27）

- 新增 `make-bot-ui`（[#271](https://github.com/cursor/plugins/pull/271)）

## 0.14.3（2026-08-25）

- 多 PR 计划改成要逐项验证的清单（[#258](https://github.com/cursor/plugins/pull/258)）

## 0.14.2（2026-08-21）

- 移植工作流和边界相关的指导（[#238](https://github.com/cursor/plugins/pull/238)）

## 0.14.1（2026-08-14）

- Grok 默认版本从 4.5 升到 4.6（[#210](https://github.com/cursor/plugins/pull/210)）；指南补上新技能和 playbook（[#188](https://github.com/cursor/plugins/pull/188)）

## 0.14.0（2026-08-03）

- 新增 `/bro`，以及 babysit、shipping、orchestrate、worktree-cleanup 几个 playbook（[#187](https://github.com/cursor/plugins/pull/187)，见[第 7 章](/ch/07-parallel)）

## 0.13.0（2026-08-02）

- 新增 autopilot playbook、`/no-comments` 和 Comment Sicko、`/technical-writing`（[#185](https://github.com/cursor/plugins/pull/185)）

## 0.12.0（2026-07-31）

- 新增 `/swarm`，按评审意见修改；指南同步到 0.12.0（无 PR 号，同一时间提交，中间版本号先后写过 0.11.15 和 0.11.14）

## 0.11.14（2026-07-31）

- `create-verification-skill` 加 Feature Map 参考（[#178](https://github.com/cursor/plugins/pull/178)）

## 0.11.13（2026-07-29）

- `/architect` 补充接口设计指导（[#175](https://github.com/cursor/plugins/pull/175)）

## 0.11.12（2026-07-28）

- 教 agent 用类型构造数据模型（[#174](https://github.com/cursor/plugins/pull/174)）。仓库里没有 0.11.11 的版本号提交

## 0.11.10（2026-07-26）

- 写清自治运行中发现的问题归谁处理（[#170](https://github.com/cursor/plugins/pull/170)）

## 0.11.9（2026-07-26）

- 评审团加入 Opus 5（[#169](https://github.com/cursor/plugins/pull/169)）

## 0.11.8（2026-07-24）

- 加公开使用教程（[#164](https://github.com/cursor/plugins/pull/164)）；模型配置的说明只留在定义处（[#167](https://github.com/cursor/plugins/pull/167)）

## 0.11.7（2026-07-23）

- 探索类角色默认用 Grok（[#166](https://github.com/cursor/plugins/pull/166)）

## 0.11.6（2026-07-23）

- 评审团默认用 Fable、Sol、Grok（[#165](https://github.com/cursor/plugins/pull/165)）

## 0.11.5（2026-07-23）

- 支持 inherit-parent / auto，不给 Task 指定模型（[#163](https://github.com/cursor/plugins/pull/163)）

## 0.11.4（2026-07-23）

- fix-root-causes 会标出解释 workaround 的长注释（[#162](https://github.com/cursor/plugins/pull/162)）

## 0.11.3（2026-07-14）

- perf playbook 加八类优化策略（[#155](https://github.com/cursor/plugins/pull/155)）；和私有技能库对齐一遍（[#156](https://github.com/cursor/plugins/pull/156)）

## 0.11.2（2026-07-12）

- 新增 `/teach`：把 how 和 why 合成一份讲解（[#153](https://github.com/cursor/plugins/pull/153)）

## 0.11.1（2026-07-12）

- `maintain-verification-skill` 细化清理粒度、重跑 doctor、检查证据（[#151](https://github.com/cursor/plugins/pull/151)）

## 0.11.0（2026-07-12）

- 新增 `create-verification-skill` 和 `maintain-verification-skill`（[#150](https://github.com/cursor/plugins/pull/150)，见[第 6 章](/ch/06-verification)）
- README 开头改成两步上手（[#148](https://github.com/cursor/plugins/pull/148)）；poteto-mode 有了显示名（[#149](https://github.com/cursor/plugins/pull/149)）

## 0.10.4（2026-07-11）

- 新增 model-the-domain 原则（[#147](https://github.com/cursor/plugins/pull/147)）

## 0.10.3（2026-07-09）

- poteto-mode 变成常驻模式，按条件提醒（[#144](https://github.com/cursor/plugins/pull/144)）

## 0.10.2（2026-07-09）

- 最难的任务交给 claude-fable-5-thinking-max（[#143](https://github.com/cursor/plugins/pull/143)）

## 0.10.1（2026-07-09）

- composer 槽位改用 grok-4.5-fast-xhigh（[#142](https://github.com/cursor/plugins/pull/142)）

## 0.10.0（2026-06-24）

- 加入 Benny 工单自动化包（[#137](https://github.com/cursor/plugins/pull/137)）

## 0.9.2（2026-06-18）

- 新增 `/recall` 和 `/blast-radius`（[#135](https://github.com/cursor/plugins/pull/135)）

## 0.9.1（2026-06-14）

- 新增 Hillclimb playbook，收紧自治运行的停止条件（[#132](https://github.com/cursor/plugins/pull/132)）；README 和已发布内容对齐（[#126](https://github.com/cursor/plugins/pull/126)、[#133](https://github.com/cursor/plugins/pull/133)）

## 0.9.0（2026-06-07）

- 新增“把工作拆成可验证单元”原则（[#123](https://github.com/cursor/plugins/pull/123)）
- 遇到能实验的分歧，先做个草图自己解决，不问人（[#122](https://github.com/cursor/plugins/pull/122)）；开 PR 前整理重构提交（[#124](https://github.com/cursor/plugins/pull/124)）

## 0.8.0（2026-06-06）

- `/setup-pstack` 按角色配置模型（[#121](https://github.com/cursor/plugins/pull/121)）

## 0.7.0（2026-06-06）

- 新增 pause-safely playbook（[#115](https://github.com/cursor/plugins/pull/115)）；加怀疑型评审触发条件，多形态工作走 arena（[#116](https://github.com/cursor/plugins/pull/116)）
- 精简 why、how、interrogate、architect、reflect 和 poteto-mode（[#105](https://github.com/cursor/plugins/pull/105)、[#106](https://github.com/cursor/plugins/pull/106)）；强制力层级并入 encode-lessons-in-structure（[#114](https://github.com/cursor/plugins/pull/114)）

## 0.6.0（2026-05-30）

- build-the-lever 默认给非小事先造工具（[#102](https://github.com/cursor/plugins/pull/102)）；回复同时写清对使用者和维护者的影响（[#103](https://github.com/cursor/plugins/pull/103)）

## 0.5.0（2026-05-29）

- `/architect` 以调用方的用法为规格（[#99](https://github.com/cursor/plugins/pull/99)）；interrogate 加多模型代码质量视角（[#100](https://github.com/cursor/plugins/pull/100)）；Opus 4.7 改为 4.8（[#98](https://github.com/cursor/plugins/pull/98)）

## 0.4.0（2026-05-28）

- build-the-lever 造的工具可以是子 agent 遵循的技能（[#91](https://github.com/cursor/plugins/pull/91)）

## 0.3.0（2026-05-27）

- bug-fix 加二分假设循环、合成复现和 /loop（[#88](https://github.com/cursor/plugins/pull/88)）；show-me-your-work 加跨模型复查（[#89](https://github.com/cursor/plugins/pull/89)）

## 0.2.0（2026-05-26）

- 新增 `/figure-it-out`、`/show-me-your-work`（[#78](https://github.com/cursor/plugins/pull/78)、[#79](https://github.com/cursor/plugins/pull/79)）
- 新增 refactoring、session-pickup、trace-forensics playbook（[#81](https://github.com/cursor/plugins/pull/81)、[#83](https://github.com/cursor/plugins/pull/83)）；新增 build-the-lever 原则（[#84](https://github.com/cursor/plugins/pull/84)）
- README 加用法示例和 playbook 表（[#76](https://github.com/cursor/plugins/pull/76)、[#77](https://github.com/cursor/plugins/pull/77)、[#80](https://github.com/cursor/plugins/pull/80)、[#85](https://github.com/cursor/plugins/pull/85)）

## 0.1.0（2026-05-24）

- pstack 插件首次加入 cursor/plugins（无 PR 号）
