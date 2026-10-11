# pstack 中文课程

线上地址：https://calvingit.github.io/pstack-learn/

一门讲 [pstack](https://github.com/cursor/plugins/tree/main/pstack)（@poteto）的中文课程，带原创分析、源码解读、社区资料和练习。纯静态站点，没有构建步骤，没有外部 CDN。

## 本地预览

浏览器不允许 `file://` 页面用 fetch 读本地文件，所以要起一个本地服务：

```bash
python3 -m http.server 8000   # 然后打开 http://localhost:8000
```

## 目录结构

```
index.html              外壳：顶栏、侧栏、内容区，只引用 CSS 和 main.js
.nojekyll               让 GitHub Pages 原样发布，不跑 Jekyll
content/                每章一个 Markdown 文件，home.md 是首页正文
data/
  chapters.json         章节目录：id、编号、分组、文件名、标题、摘要、来源 id
  sources.json          全部来源：作者、北京时间、URL、类型、要点、是否核实
  principles.json       24 条原则速查
  playbooks.json        23 个 playbook 速查
  skills.json           技能清单
  glossary.json         术语表
assets/css/
  base.css              颜色变量、排版、暗色主题
  layout.css            顶栏、侧栏、内容区布局与移动端
  components.css        卡片、callout、练习清单、搜索结果等组件样式
assets/js/
  main.js               入口：加载目录，挂路由、侧栏、搜索、主题
  router.js             哈希路由：#/  #/ch/<id>  #/ref/<kind>
  markdown.js           自写的小型 Markdown 渲染器
  pages.js              首页、章节页、速查页
  nav.js                侧栏与阅读进度
  search.js             全文搜索（章节 + 速查数据）
  store.js              localStorage：已读、练习勾选、主题
  theme.js              明暗主题切换
  data.js               读取 JSON / Markdown，带缓存
  components/           Markdown 自定义块：callout、quote、exercise、sources、compare
```

## 新增或修改一章

1. 在 `content/` 下新建 `12-xxx.md`，用 `# 第 12 章 标题` 开头。
2. 在 `data/chapters.json` 里加一项：`id`、`num`、`group`（侧栏分组）、`file`、`title`、`summary`、`sources`（来源 id 数组）。
3. 用到的新来源加进 `data/sources.json`，`verified` 只有读过原文才写 `true`。

阅读时间、练习数、来源数都是自动算的。

## Markdown 里能用的自定义块

````
```callout tip 标题          # 类型：tip / warn / ok / bad
正文，支持 Markdown
```

```quote
en: 英文原文
zh: 中文
by: 作者与出处
url: https://...
```

```exercise 练习标题
- 每行一个可勾选项（勾选状态存在浏览器里）
```

```sources t-dotta, art-pt1
```

```compare 表格标题
| A | B |
|---|---|
```
````

行内写 `【已核实】` 或 `【未核实】` 会渲染成标签。

## 内容约定

- 版本基准 pstack 0.15.17（2026-10-11），时间一律北京时间。
- 不编造来源。没读到原文的，来源标 `verified: false`，正文标 【未核实】。
- 中文写作避免 AI 腔，参考 calvingit/skills 的 `humanizer-zh`。
