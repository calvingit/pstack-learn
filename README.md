# pstack 中文课程

线上地址：https://calvingit.github.io/pstack-learn/

一门讲 [pstack](https://github.com/cursor/plugins/tree/main/pstack)（@poteto）的中文课程，带原创分析、源码解读、社区资料和练习。用 [VitePress](https://vitepress.dev) 构建：侧栏目录、本页大纲、上一章/下一章、本地中文搜索、深色模式、移动端适配。

## 本地开发

```bash
npm install
npm run dev      # http://localhost:5173/pstack-learn/
npm run build    # 输出到 site/.vitepress/dist
npm run preview
```

## 目录结构

```
content/                 课程正文（唯一内容源）：home.md + 每章一个 Markdown
data/                    chapters / sources / principles / playbooks / skills / glossary 的 JSON
scripts/gen.mjs          构建前把 content/ 和 data/ 生成为 site/ch/*.md、site/ref/*.md（不进 git）
site/index.md            首页：引入 content/home.md + 章节卡片
site/.vitepress/
  config.mjs             站点配置：base、侧栏（来自 chapters.json）、搜索、中文界面
  blocks.mjs             markdown-it 插件：渲染 callout / quote / exercise / compare 代码块
  theme/
    index.js             扩展默认主题，注册组件，挂章节头尾
    style.css            排版与组件样式
    store.js             localStorage 进度（沿用 v2 的键，旧进度不丢）
    data.js              JSON 数据入口
    components/          Checklist、ChecklistItem、Compare、SourceCard、
                         ChapterGrid、ChapterMeta、ChapterFooter
.github/workflows/deploy.yml   构建并发布到 GitHub Pages
```

## 写作约定

正文是普通 Markdown，另有四种自定义代码块：

- ```` ```callout tip|warn|ok|bad 标题 ````：提示框
- ```` ```quote ````：引文卡片，每行 `en:` / `zh:` / `by:` / `url:`
- ```` ```exercise 标题 ````：练习清单，每行 `- 项目`，勾选状态存在浏览器
- ```` ```compare 标题 ````：对照表，内容是 Markdown 表格

`【已核实】`、`【未核实】` 会渲染成徽标。新增一章：在 `content/` 加文件，在 `data/chapters.json` 加一项。

## 部署

`base` 由环境变量决定：`VITEPRESS_BASE` 优先；Cloudflare Pages（自动带 `CF_PAGES=1`）用 `/`；其他情况用 `/pstack-learn/`。

- **GitHub Pages**：push 到 main 后 `.github/workflows/deploy.yml` 构建并用 `actions/deploy-pages` 发布。Settings → Pages → Source 需选 “GitHub Actions”。
- **Cloudflare Pages**：Framework preset 选 VitePress（或 None），Build command `npm run build`，Build output directory `site/.vitepress/dist`，环境变量 `NODE_VERSION=20`。
