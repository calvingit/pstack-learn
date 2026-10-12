// markdown-it 插件：把 content/*.md 里的自定义代码块渲染成组件。
// ```callout <tip|warn|ok|bad> 标题   ```quote（en/zh/by/url）
// ```exercise 标题（每行 "- 项目"）   ```compare 标题（内含 Markdown 表格）
const TYPE = { tip: 'tip', warn: 'warning', ok: 'tip ok', bad: 'danger' }
const attr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;')

export function blocksPlugin(md) {
  const fallback = md.renderer.rules.fence
  const tag = s => s.replace(/【已核实】/g, '<Badge type="tip" text="已核实" />').replace(/【未核实】/g, '<Badge type="warning" text="未核实" />')
  md.core.ruler.push('verify_tags', state => {
    for (const t of state.tokens) if (t.type === 'inline') for (const c of t.children || [])
      if (c.type === 'text' && /【[已未]核实】/.test(c.content)) { c.type = 'html_inline'; c.content = tag(md.utils.escapeHtml(c.content)) }
  })
  const blocks = {
    callout(args, body, env) {
      const [type, ...t] = args.split(/\s+/)
      const title = t.join(' ')
      return `<div class="custom-block ${TYPE[type] || 'tip'}">${title ? `<p class="custom-block-title">${md.renderInline(title, env)}</p>` : ''}${md.render(body, env)}</div>\n`
    },
    quote(args, body, env) {
      const f = {}
      body.split('\n').forEach(l => { const m = l.match(/^(\w+):\s*(.*)$/); if (m) f[m[1]] = (f[m[1]] ? f[m[1]] + ' ' : '') + m[2] })
      const by = f.url ? `<a href="${attr(f.url)}" target="_blank" rel="noopener">${md.renderInline(f.by || f.url, env)}</a>` : md.renderInline(f.by || '', env)
      return `<figure class="quote-card">${f.en ? `<div class="en">“${md.renderInline(f.en, env)}”</div>` : ''}${f.zh ? `<div class="zh">${md.renderInline(f.zh, env)}</div>` : ''}<figcaption>— ${by}</figcaption></figure>\n`
    },
    exercise(args, body, env) {
      const id = (env.relativePath || '').replace(/^ch\//, '').replace(/\.md$/, '')
      const b = env.__exBlock = (env.__exBlock ?? -1) + 1
      const items = body.split('\n').filter(l => /^\s*-\s+/.test(l)).map(l => l.replace(/^\s*-\s+/, ''))
      return `<Checklist title="${attr(args || '练习')}">${items.map((it, i) =>
        `<ChecklistItem k="${id}-${b}-${i}">${md.renderInline(it, env)}</ChecklistItem>`).join('')}</Checklist>\n`
    },
    compare(args, body, env) {
      return `<Compare title="${attr(args)}">${md.render(body, env)}</Compare>\n`
    }
  }
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const info = tokens[idx].info.trim()
    const kind = info.split(/\s+/)[0]
    if (blocks[kind]) return blocks[kind](info.slice(kind.length).trim(), tokens[idx].content.replace(/\n$/, ''), env)
    return fallback(tokens, idx, options, env, self)
  }
}
