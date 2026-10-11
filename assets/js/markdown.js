// 小型 Markdown 渲染器（本项目自写，MIT）。支持标题、段落、列表、引用、代码块、表格、链接、粗体、斜体、行内代码。
// 带 info 的代码块（如 ```callout warn 标题）交给 components 渲染。
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
export function inline(s){
  const codes=[];
  s = s.replace(/`([^`]+)`/g,(_,c)=>{codes.push(c);return `\u0000${codes.length-1}\u0000`});
  s = esc(s);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(_,t,u)=>{
    const ext=/^https?:/.test(u);
    return `<a href="${u}"${ext?' target="_blank" rel="noopener"':''}>${t}</a>`});
  s = s.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/(^|[^*])\*([^*\s][^*]*)\*/g,'$1<em>$2</em>');
  s = s.replace(/【已核实】/g,'<span class="tag verified">已核实</span>').replace(/【未核实】/g,'<span class="tag unverified">未核实</span>');
  s = s.replace(/\u0000(\d+)\u0000/g,(_,i)=>`<code>${esc(codes[i])}</code>`);
  return s;
}
export function slug(t){return t.trim().toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g,'-').replace(/^-|-$/g,'')}
export function render(md, blockHook){
  const lines = md.replace(/\r/g,'').split('\n');
  let out=[], i=0;
  const para=[];
  const flush=()=>{ if(para.length){out.push(`<p>${inline(para.join(' '))}</p>`);para.length=0} };
  while(i<lines.length){
    const l=lines[i];
    let m;
    if((m=l.match(/^```\s*(.*)$/))){
      flush(); const info=m[1].trim(); const body=[]; i++;
      while(i<lines.length && !/^```\s*$/.test(lines[i])){body.push(lines[i]);i++} i++;
      const kind=info.split(/\s+/)[0];
      const custom = blockHook && kind && blockHook(kind, info.slice(kind.length).trim(), body.join('\n'));
      out.push(custom ?? `<pre><code${kind?` class="lang-${esc(kind)}"`:''}>${esc(body.join('\n'))}</code></pre>`);
      continue;
    }
    if((m=l.match(/^(#{1,4})\s+(.*)$/))){flush(); const n=m[1].length; out.push(`<h${n} id="${slug(m[2])}">${inline(m[2])}</h${n}>`); i++; continue}
    if(/^\s*(---|\*\*\*)\s*$/.test(l)){flush();out.push('<hr>');i++;continue}
    if(/^>\s?/.test(l)){flush(); const b=[]; while(i<lines.length&&/^>\s?/.test(lines[i])){b.push(lines[i].replace(/^>\s?/,''));i++} out.push(`<blockquote>${render(b.join('\n'),blockHook)}</blockquote>`); continue}
    if(/^\|.*\|\s*$/.test(l) && i+1<lines.length && /^\|[\s:|-]+\|\s*$/.test(lines[i+1])){
      flush(); const row=r=>r.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim());
      const head=row(l); i+=2; const rows=[];
      while(i<lines.length&&/^\|.*\|\s*$/.test(lines[i])){rows.push(row(lines[i]));i++}
      out.push(`<table><thead><tr>${head.map(h=>`<th>${inline(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`);
      continue;
    }
    if((m=l.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/))){
      flush(); const ordered=/\d/.test(m[2]); const items=[];
      while(i<lines.length){
        const mm=lines[i].match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
        if(mm && mm[1].length===0){items.push(mm[3]);i++;continue}
        if(mm || (/^\s{2,}\S/.test(lines[i]) && items.length)){items[items.length-1]+='\n'+lines[i].replace(/^\s{2,3}/,'');i++;continue}
        break;
      }
      const tag=ordered?'ol':'ul';
      out.push(`<${tag}>${items.map(it=>{const [f,...rest]=it.split('\n');return `<li>${inline(f)}${rest.length?render(rest.join('\n'),blockHook):''}</li>`}).join('')}</${tag}>`);
      continue;
    }
    if(/^\s*$/.test(l)){flush();i++;continue}
    para.push(l.trim()); i++;
  }
  flush();
  return out.join('\n');
}
