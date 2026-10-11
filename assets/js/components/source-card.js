// ```sources id1,id2  从 data/sources.json 渲染来源卡片
import {inline} from '../markdown.js';
export function sourceCard(s){
  if(!s) return '';
  const tag=s.verified?'<span class="tag verified">已核实</span>':'<span class="tag unverified">未核实</span>';
  return `<div class="source-card"><a href="${s.url}" target="_blank" rel="noopener">${inline(s.title)}</a>${tag}<div class="meta">${inline(s.author)} · ${s.date} · ${s.type}</div><div>${inline(s.note||'')}</div></div>`;
}
export function sources(args,body,ctx){
  const ids=(args+' '+body).split(/[\s,]+/).filter(Boolean);
  ids.forEach(id=>ctx.usedSources.add(id));
  return `<div class="source-list">${ids.map(id=>sourceCard(ctx.sources[id])||`<div class="source-card">缺少来源：${id}</div>`).join('')}</div>`;
}
