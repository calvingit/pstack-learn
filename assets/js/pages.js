// 页面渲染：首页、章节页、速查页
import {render,inline,slug} from './markdown.js';
import {makeHook} from './components/index.js';
import {sourceCard} from './components/source-card.js';
import {getJSON,getText} from './data.js';
import {store} from './store.js';

const minutes=t=>Math.max(1,Math.round((t.replace(/```[\s\S]*?```/g,'').replace(/\s/g,'').length)/300));

export async function homePage(app,chapters){
  const t=await getText('content/home.md');
  app.innerHTML=render(t)+`<div class="home-grid">${chapters.map(c=>`<a class="home-card" href="#/ch/${c.id}"><div class="num">第 ${c.num} 章${store.isDone(c.id)?' · 已读':''}</div><div><strong>${c.title}</strong></div><div class="sum">${c.summary}</div></a>`).join('')}</div>`;
}

export async function chapterPage(app,chapters,id,anchor){
  const idx=chapters.findIndex(c=>c.id===id);
  if(idx<0){app.innerHTML='<h1>找不到这一章</h1><p><a href="#/">回首页</a></p>';return}
  const c=chapters[idx];
  const [md,sources]=await Promise.all([getText(`content/${c.file}`),getJSON('sources')]);
  const srcMap=Object.fromEntries(sources.map(s=>[s.id,s]));
  const ctx={chapterId:c.id,sources:srcMap,usedSources:new Set()};
  ctx.hook=makeHook(ctx);
  const body=render(md,ctx.hook);
  (c.sources||[]).forEach(s=>ctx.usedSources.add(s));
  const used=[...ctx.usedSources].map(s=>srcMap[s]).filter(Boolean);
  const prev=chapters[idx-1],next=chapters[idx+1];
  app.innerHTML=`<div class="chapter-meta"><span>第 ${c.num} 章</span><span>约 ${minutes(md)} 分钟</span><span>来源 ${used.length} 条</span><span>练习 ${ctx.exerciseCount||0} 项</span></div>${body}
  ${used.length?`<h2 id="本章来源">本章来源</h2><div class="source-list">${used.map(sourceCard).join('')}</div>`:''}
  <div class="chapter-footer"><label class="done-toggle"><input type="checkbox" id="doneToggle" ${store.isDone(c.id)?'checked':''}> 本章已读完</label>
  <span class="pager">${prev?`<a href="#/ch/${prev.id}">← ${prev.title}</a>`:''}${next?`<a href="#/ch/${next.id}">${next.title} →</a>`:''}</span></div>`;
  app.querySelector('#doneToggle').addEventListener('change',e=>store.setDone(c.id,e.target.checked));
  app.querySelectorAll('[data-check]').forEach(cb=>{cb.checked=store.isChecked(cb.dataset.check);cb.addEventListener('change',()=>store.setChecked(cb.dataset.check,cb.checked))});
  if(anchor){document.getElementById(slug(anchor))?.scrollIntoView()}else window.scrollTo(0,0);
}

const REF={
  principles:{title:'24 条原则速查',group:'group',render:x=>`<strong>${x.name}</strong>（${x.zh}）<br>${inline(x.desc)}${x.ch?` · <a href="#/ch/${x.ch}">相关章节</a>`:''}`},
  playbooks:{title:'23 个 playbook 速查',group:'group',render:x=>`<strong>${x.name}</strong>（${x.zh}）<br>${inline(x.desc)}`},
  skills:{title:'技能清单',group:'group',render:x=>`<code>/${x.name}</code> ${x.zh?`（${x.zh}）`:''}<br>${inline(x.desc)}`},
  glossary:{title:'术语表',group:null,render:x=>`<strong>${x.name}</strong>${x.zh?`（${x.zh}）`:''}：${inline(x.desc)}`},
};
export async function refPage(app,kind){
  if(kind==='sources'){
    const s=await getJSON('sources');
    const types=[...new Set(s.map(x=>x.type))];
    app.innerHTML=`<h1>来源列表</h1><p>本课程引用的全部来源，共 ${s.length} 条。时间为北京时间。“已核实”表示我读过原文或原帖全文；“未核实”表示只读到摘要、转述或标题。</p>${types.map(t=>`<h2>${t}</h2><div class="source-list">${s.filter(x=>x.type===t).map(sourceCard).join('')}</div>`).join('')}`;
    return;
  }
  const cfg=REF[kind]; if(!cfg){app.innerHTML='<h1>没有这个速查页</h1>';return}
  const data=await getJSON(kind);
  const groups=cfg.group?[...new Set(data.map(x=>x[cfg.group]))]:[null];
  app.innerHTML=`<h1>${cfg.title}</h1><p>共 ${data.length} 项。原文以 <a href="https://github.com/cursor/plugins/tree/main/pstack" target="_blank" rel="noopener">cursor/plugins/pstack</a> 0.15.17 为准，中文说明是我的转述。</p>
  ${groups.length>1?`<div class="ref-filter">${['全部',...groups].map((g,i)=>`<button data-g="${g}" class="${i?'':'on'}">${g}</button>`).join('')}</div>`:''}
  <div class="source-list" id="refList">${data.map(x=>`<div class="source-card" data-group="${cfg.group?x[cfg.group]:''}">${cfg.render(x)}</div>`).join('')}</div>`;
  app.querySelectorAll('.ref-filter button').forEach(b=>b.addEventListener('click',()=>{
    app.querySelectorAll('.ref-filter button').forEach(o=>o.classList.toggle('on',o===b));
    app.querySelectorAll('#refList [data-group]').forEach(el=>el.hidden=!(b.dataset.g==='全部'||el.dataset.group===b.dataset.g));
  }));
}
