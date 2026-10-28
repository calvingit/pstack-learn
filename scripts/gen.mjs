// 构建前把 content/*.md 和 data/*.json 生成为 site/ch、site/ref 下的页面。
// 内容源只有 content/ 和 data/；生成的文件不进 git（见 .gitignore）。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const j = f => JSON.parse(fs.readFileSync(path.join(root, 'data', f + '.json'), 'utf8'))
const write = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s) }
const fm = o => '---\n' + Object.entries(o).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('\n') + '\n---\n\n'
const minutes = t => Math.max(1, Math.round(t.replace(/```[\s\S]*?```/g, '').replace(/\s/g, '').length / 300))
// JSON 里的文字可能含 <app> 这类尖括号，转义后再进 Markdown（否则 Vue 当成标签）
const esc = s => String(s ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const badge = v => v ? '<Badge type="tip" text="已核实" />' : '<Badge type="warning" text="未核实" />'

// 章节
const chapters = j('chapters')
for (const c of chapters) {
  const md = fs.readFileSync(path.join(root, 'content', c.file), 'utf8')
  const exercises = [...md.matchAll(/```exercise[^\n]*\n([\s\S]*?)```/g)]
    .reduce((n, m) => n + m[1].split('\n').filter(l => /^\s*-\s+/.test(l)).length, 0)
  write(path.join(root, 'site/ch', c.id + '.md'), fm({
    title: `第 ${c.num} 章 ${c.title}`, chapter: { id: c.id, num: c.num, minutes: minutes(md), exercises, sources: c.sources || [] }
  }) + md)
}

// 速查页
const REF = {
  principles: ['24 条原则速查', x => `**${esc(x.name)}**（${esc(x.zh)}）：${esc(x.desc)}${x.ch ? `（[相关章节](/ch/${x.ch})）` : ''}`],
  playbooks: ['23 个 playbook 速查', x => `**${esc(x.name)}**（${esc(x.zh)}）${x.stance ? `，${esc(x.stance)}` : ''}——${esc(x.desc)}`],
  skills: ['技能清单', x => `\`/${esc(x.name)}\`${x.zh ? `（${esc(x.zh)}）` : ''}：${esc(x.desc)}`],
  glossary: ['术语表', x => `**${esc(x.name)}**${x.zh ? `（${esc(x.zh)}）` : ''}：${esc(x.desc)}`]
}
const intro = n => `共 ${n} 项。原文以 [cursor/plugins/pstack](https://github.com/cursor/plugins/tree/main/pstack) 0.15.36 为准，中文说明是我的转述。\n\n`
for (const [k, [title, row]] of Object.entries(REF)) {
  const data = j(k)
  const groups = [...new Set(data.map(x => x.group).filter(Boolean))]
  let out = fm({ title, prev: false, next: false }) + `# ${title}\n\n` + intro(data.length)
  out += groups.length ? groups.map(g => `## ${g}\n\n` + data.filter(x => x.group === g).map(x => '- ' + row(x)).join('\n')).join('\n\n')
    : data.map(x => '- ' + row(x)).join('\n')
  write(path.join(root, 'site/ref', k + '.md'), out + '\n')
}
const sources = j('sources')
const types = [...new Set(sources.map(x => x.type))]
write(path.join(root, 'site/ref/sources.md'), fm({ title: '来源列表', prev: false, next: false, outline: [2, 2] }) +
  `# 来源列表\n\n本课程引用的全部来源，共 ${sources.length} 条。时间为北京时间。“已核实”表示我读过原文或原帖全文；“未核实”表示只读到摘要、转述或标题。\n\n` +
  types.map(t => `## ${t}\n\n<div class="source-list">\n\n` + sources.filter(s => s.type === t).map(s =>
    `<div class="source-card">\n\n[${esc(s.title)}](${s.url}) ${badge(s.verified)}\n\n<span class="meta">${esc(s.author)} · ${s.date}</span>\n\n${esc(s.note || '')}\n\n</div>`).join('\n\n') + '\n\n</div>').join('\n\n') + '\n')
console.log(`generated ${chapters.length} chapters, ${Object.keys(REF).length + 1} reference pages`)
