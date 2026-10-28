# 第 12 章 更新记录

这一章按 [cursor/plugins](https://github.com/cursor/plugins/commits/main/pstack) 的提交历史整理 pstack 每个版本改了什么，新版本在前。版本号取自 `pstack/.cursor-plugin/plugin.json` 的改动，日期是该版本号提交的北京时间。每版按上次升版之后、截至本次升版（含）的 `pstack` 提交归档，条目结合提交说明、PR 描述与源码 diff 转述，细节以链接中的原文和代码为准。

课程正文以 0.15.36 为准。

## 0.15.36（2026-10-28）

- Orchestrate 改由协调 agent 直接用 `Task` 派工、用 Project tracker 和 store 保存状态，并在宿主支持时订阅 PR 和 CI 事件；不再调用 `orch` CLI 或轮询，删除 `orch` 脚本及其测试入口（[#1043](https://github.com/cursor/plugins/pull/1043)）

## 0.15.35（2026-10-28）

- poteto-mode 首条回复先复述用户目标、问题及预计的最小改动，不等确认；子 agent 简报、PR 的 Why 和最终报告也要带上目标。给运行中的 agent 追加指令或恢复执行同样走后台调用（[#986](https://github.com/cursor/plugins/pull/986)）
- 模型名被拒后按调用技能的规则继续回退，跳过已经被拒的名字；arena 的候选席位可替换或撤掉再补足。交叉评委必须来自父模型以外的家族，配置池和默认池都找不到可用模型时跳过评委，由协调者选基础方案并说明（[#986](https://github.com/cursor/plugins/pull/986)）
- `/interrogate` 改成在独立 worktree 中尝试破坏真实代码；每条发现须附实际运行的命令和输出，主 agent 重跑确认后才保留。设计和计划也要用原型或探针举证，移除旧的评审模板与分档裁决（[#986](https://github.com/cursor/plugins/pull/986)）
- autopilot 只用当前 head 上可展示的失败或本 PR 弄错的文档阻塞 PR；基础分支已有的问题通常不阻塞，其他建议留作后续。每完成一个单元就推送，纯措辞修改不再派 verifier。autopilot-stack 简化为 autopilot-full 不合并：只有依赖关系才堆叠，子 PR rebase 到父 PR 分支，交付后未经用户同意不再推送（[#986](https://github.com/cursor/plugins/pull/986)）
- Explain the Number 提前到测量之前：先写清什么结果会改变决策、噪声底限是多少；轮次波动大于效果时停止。`/ketchup-video` 每页加字幕，并从成片逐帧测量完整停留时间，按新增文字量检查能否读完（[#986](https://github.com/cursor/plugins/pull/986)）

## 0.15.34（2026-10-27）

- `/statechart` 保留 `C!Up` 这类带 INSTANCE 限定的动作全名，修复 PROPERTY 反例路径匹配失败、循环丢失和标签被截成 `C` 的问题（[#982](https://github.com/cursor/plugins/pull/982)）

## 0.15.33（2026-10-27）

- `/statechart` 换成 TypeScript 编译器，一个 `statechart SPEC.tla` 命令完成 TLC 检查、Mermaid 状态图和最短违规路径报告；启动器选择 Node 22.18+、Bun 1.1.5+ 或 Deno 2.0+，无需构建。被信号终止或运行出错时退出 2，仅成功检查或发现违规的退出 0/1 写出结果。旧版的图转 TLA+ 骨架、代码对照规格审计和修复状态标记随之移除（[#977](https://github.com/cursor/plugins/pull/977)）
- `/reflect` 不再改插件缓存：先展示 `.cursor/skills/` 或 `~/.cursor/skills/` 的目标位置，获批后复制技能目录并改副本，避免更新插件时丢失修改；不会自动开 PR 或推送（[#800](https://github.com/cursor/plugins/pull/800)）
- `watch-pr` 识别 fork 的同名分支，避免错误串起 PR 栈；轮询及重试等待不再睡过超时期限。`orch` 查找分支对应 PR 时优先选择唯一仍开启的 PR，避免被已关闭或已合并的历史 PR 干扰（[#801](https://github.com/cursor/plugins/pull/801)、[#802](https://github.com/cursor/plugins/pull/802)、[#804](https://github.com/cursor/plugins/pull/804)）
- 计划检查支持长度匹配的多反引号行内代码；`worktree-audit` 兼容 GNU `stat` 和 `date`，正确读取会话记录时间；修正 swarm 的阶段编号和失效的表格引用（[#803](https://github.com/cursor/plugins/pull/803)、[#805](https://github.com/cursor/plugins/pull/805)、[#807](https://github.com/cursor/plugins/pull/807)）
- Claude Code 安装说明补充：第三方 marketplace 的插件默认不开自动更新，并给出开启步骤（[#806](https://github.com/cursor/plugins/pull/806)）

## 0.15.32（2026-10-24）

- 新增 `/ketchup-video`：用一段无声幻灯片视频回顾变化，待用户决定的事项仍在视频下方逐条写出；回顾窗口从 `/ketchup-video` 之前用户的最后一条消息开始（[#797](https://github.com/cursor/plugins/pull/797)）
- 生成的形式化验证技能每次模型检查后调用 `/statechart` 解读结果，用状态和步骤讲清不变量反例；PROPERTY 失败只链接 TLC 反例文件，不画成状态路径（[#794](https://github.com/cursor/plugins/pull/794)）

## 0.15.31（2026-10-24）

- `/statechart` 为当前、修复后和对照规格分别选择 TLC config；标签读取对照模型不存在的字段时明确报错，对照规格未检查的规则标成“未检查”。TLC 报告违规后再异常时保留已有路径并警告状态可能不全，输出目录无法 rename 时支持复制发布结果（[#776](https://github.com/cursor/plugins/pull/776)）
- 开始检查 config 中的 PROPERTY，每条规则先用全部 CPU 检查，违规的不变量再用单 worker 找稳定的最短路径；重复列为 INVARIANT 和 PROPERTY 的规则只检查一次。规格对照会说明是否已记录该 bug，并列出缺少代码位置引用的动作条件（[#776](https://github.com/cursor/plugins/pull/776)）
- 状态图从产品界面扩展到协议、服务等系统；PNG 改用 Pele 和 resvg 渲染，未设置 `TLA2TOOLS` 时通过 mise 安装 TLC 和 Java。修正省略自循环时并行区域等价检查误报差异的问题（[#791](https://github.com/cursor/plugins/pull/791)）

## 0.15.30（2026-10-22）

- 新增 `/statechart`：从 TLA+ 模型生成 Mermaid 状态图，用 TLC 检查不变量，把每类反例画成编号路径，标出正常、仍有问题和已被修复模型解决的状态；也能把约定的图转成 TLA+ 骨架、比较图，并用 `--against` 对照既有规格审计代码模型（[#741](https://github.com/cursor/plugins/pull/741)）
- 支持嵌套状态、并行区域、守卫条件和范围筛选。比较图要求完整标签，PNG 渲染失败以退出 2 报告；本版只通过 `TLA2TOOLS` 和 `JAVA` 指定 TLC 与 Java，自动安装在后续版本加入（[#741](https://github.com/cursor/plugins/pull/741)）

## 0.15.29（2026-10-20）

- `/sharpen` 恢复为先明确专家会做什么、从哪些原始材料出发、用什么方法和工具、由什么外部证据判定正确，再重写提示词；只做任务深化和提示词改写，不执行任务，用户应决定的选项继续留白（[#729](https://github.com/cursor/plugins/pull/729)）

## 0.15.28（2026-10-19）

- `/setup-pstack` 在项目尚无形式化验证技能时，询问是否运行 `/create-formal-verification-skill`，帮助和指南同步补齐入口（[#715](https://github.com/cursor/plugins/pull/715)）
- 形式化验证对事件顺序问题默认选 TLA+，不受实现语言限制；没有适用验证器时明确说明，并用生成输入测试真实代码，避免用手写函数模型替代代码（[#721](https://github.com/cursor/plugins/pull/721)、[#724](https://github.com/cursor/plugins/pull/724)）
- 新增 `/maintain-formal-verification-skill`：根据各检查记录的覆盖文件、函数和同步提交追踪代码变化，更新模型、harness 或性质，重跑并证明检查仍能抓住错误；逐项报告同步、已更新、bug 或阻塞，阻塞项保留旧同步提交（[#716](https://github.com/cursor/plugins/pull/716)）

## 0.15.27（2026-10-19）

- `/sharpen` 删除“不返回重写后的提示词”的禁令；完整改为提示词改写工具是在 0.15.29（[#712](https://github.com/cursor/plugins/pull/712)）

## 0.15.26（2026-10-18）

- 测行为不测实现、修根因、质疑前提、操作幂等四条原则从具体机制的禁令或处方改写为推理依据，`/correct` 的测试步骤同步调整（[#633](https://github.com/cursor/plugins/pull/633)，见[第 8 章](/ch/08-principles)）
- 精简 interrogate 的主评审参考、swarm、类型系统和迁移调用方原则中收益有限的段落；品牌类型示例改用验证型 type guard 收窄，不再用 `as` 构造品牌（[#634](https://github.com/cursor/plugins/pull/634)、[#700](https://github.com/cursor/plugins/pull/700)）
- 支持从生成的独立目录安装 Claude Code 插件，保留 Cursor 的核心技能树；修复 `poteto-mode`、`make-bot-ui` 的技能名与目录名不一致导致命令不能运行的问题（[#637](https://github.com/cursor/plugins/pull/637)、[#702](https://github.com/cursor/plugins/pull/702)）
- Claude Code 的 `/setup-pstack` 将模型选择写入 `~/.claude/rules/pstack-models.md`；Cursor 专属步骤明确说明跳过，README 和指南随插件本地分发。新增文档与技能树的一致性检查，修正文档中的旧行为描述（[#705](https://github.com/cursor/plugins/pull/705)、[#704](https://github.com/cursor/plugins/pull/704)）
- `/ketchup` 为每个待决事项列出链接、用户可见变化、推荐依据和风险，让用户能直接在回复中决定；不再为 150 词上限删项、压缩成数量或把事项藏到链接中，大批事项允许更长回复（[#692](https://github.com/cursor/plugins/pull/692)、[#708](https://github.com/cursor/plugins/pull/708)）
- 新增 `/create-formal-verification-skill`：挑选错误代价高、普通测试难覆盖的一条性质，用适合问题的工具验证，并生成可重跑的项目技能；用真实代码的故意破坏证明检查有效，保留当前代码的真实发现，说明界限和假设（[#709](https://github.com/cursor/plugins/pull/709)）

## 0.15.25（2026-10-15）

- `/ketchup` 开头先贴工作产出的截图、视频，再用一张图讲清每处改动，而不是只报状态（[#628](https://github.com/cursor/plugins/pull/628)，见[第 7 章](/ch/07-parallel)）

## 0.15.24（2026-10-14）

- 新增 `/sharpen`：开工前先问“顶尖专家会怎么做”“你到底要什么”“这个任务是过度 specified 还是欠 specified”，收紧不服务于目标的约束（[#615](https://github.com/cursor/plugins/pull/615)，见[第 9 章](/ch/09-self-improve)）
- 子 agent 按任务选推理档位和速度：最难的活升一档，判断题降一档，重复活降两档以上；fast 只在 CI 或主干红了、或者有人正被卡住时用。验证仍跑在 swarm 模型上。**模型家族不变**，理由是“a diverse panel stays diverse”（[#613](https://github.com/cursor/plugins/pull/613)，见[第 2 章](/ch/02-poteto-mode)）
- `arena` 和 `interrogate` 把 `cursor-grok-` 和 `composer-` 开头的模型归进 grok 家族，`composer-*` 被拒时落到 grok 默认而不是 Claude 默认（[#613](https://github.com/cursor/plugins/pull/613)）
- 一个多阶段 PR 只跑一次完整 swarm，位置在 code-ready 的 head 上；rebase、解冲突、小修只需要一个 verifier（[#613](https://github.com/cursor/plugins/pull/613)）
- shipping 从九步砍到六步，每条规则都附“为什么成立”；父 PR 合掉后子 PR 重定向到 trunk，搬的是 patch 而不是提交，并用 `--force-with-lease` 推，再由 patch-id 判断原判定是否仍有效（[#613](https://github.com/cursor/plugins/pull/613)，见[第 7 章](/ch/07-parallel)）
- 两个 autopilot playbook 删掉流程、只留规则；autopilot-stack 现在只写它和 autopilot-full 不同的地方。新增三条：`--force-with-lease` 钉住你最后一次推送或接手的 SHA、trunk 改了调用方或依赖时在合并结果上跑这个 patch 的检查、第三次 rebase 越过 merge prep 就停下来报告（[#613](https://github.com/cursor/plugins/pull/613)）
- orchestrate 不再需要 Graphite：`orch frontier set` 顺着 PR 的 base 链一路走到 trunk，再往上走开着的子 PR，默认用 `gh`，`--forge origin` 时用 origin；worker 和 babysitter 不再跑 `gt`，改由一个 stacker 统一负责链式 rebase 和重定向（[#613](https://github.com/cursor/plugins/pull/613)）
- autopilot-full 每小时一跳，只要有变化就以 `/ketchup` 的口吻汇报，没变化就闭嘴；autopilot-stack 的最终回复也是 `/ketchup`（[#616](https://github.com/cursor/plugins/pull/616)）
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
