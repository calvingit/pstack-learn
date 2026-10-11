// 侧栏：章节列表 + 进度条 + 速查入口
import {store} from './store.js';
export function renderNav(el,chapters,current){
  const done=chapters.filter(c=>store.isDone(c.id)).length;
  const pct=Math.round(done/chapters.length*100);
  const groups=[...new Set(chapters.map(c=>c.group))];
  el.innerHTML=`<div class="progress-label">已读 ${done}/${chapters.length}</div><div class="progress-bar"><span style="width:${pct}%"></span></div>
  <a class="nav-link ${current==='home'?'active':''}" href="#/">首页</a>
  ${groups.map(g=>`<div class="nav-group">${g}</div>${chapters.filter(c=>c.group===g).map(c=>`<a class="nav-link ${store.isDone(c.id)?'done':''} ${current===c.id?'active':''}" href="#/ch/${c.id}"><span class="dot"></span>${c.num} ${c.title}</a>`).join('')}`).join('')}
  <div class="nav-group">附录 · 速查</div>
  ${[['principles','24 条原则'],['playbooks','23 个 playbook'],['skills','技能清单'],['glossary','术语表'],['sources','来源列表']].map(([k,t])=>`<a class="nav-link ${current==='ref-'+k?'active':''}" href="#/ref/${k}">${t}</a>`).join('')}`;
}
