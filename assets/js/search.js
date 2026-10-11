// 全文搜索：章节正文 + 原则/技能/playbook/术语
import {getJSON,getText} from './data.js';
let index=null;
async function build(chapters){
  const items=[];
  for(const c of chapters){
    const t=await getText(`content/${c.file}`);
    t.split(/\n(?=## )/).forEach(sec=>{const h=(sec.match(/^##?\s+(.*)/m)||[])[1]||c.title;items.push({kind:'章节',title:`${c.num} ${c.title} · ${h}`,href:`#/ch/${c.id}`,text:sec})});
  }
  for(const [name,kind,ref] of [['principles','原则','principles'],['skills','技能','skills'],['playbooks','Playbook','playbooks'],['glossary','术语','glossary']]){
    (await getJSON(name)).forEach(x=>items.push({kind,title:x.name,href:`#/ref/${ref}`,text:`${x.name} ${x.zh||''} ${x.desc||''}`}));
  }
  return items;
}
export function initSearch(input,box,chapters){
  let timer;
  input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(run,120)});
  input.addEventListener('keydown',e=>{if(e.key==='Escape'){box.hidden=true;input.blur()}});
  document.addEventListener('click',e=>{if(!box.contains(e.target)&&e.target!==input)box.hidden=true});
  box.addEventListener('click',e=>{if(e.target.closest('a'))box.hidden=true});
  async function run(){
    const q=input.value.trim().toLowerCase();
    if(!q){box.hidden=true;return}
    index=index||await build(chapters);
    const hits=index.filter(x=>(x.title+' '+x.text).toLowerCase().includes(q)).slice(0,30);
    box.innerHTML=hits.length?hits.map(h=>{const i=h.text.toLowerCase().indexOf(q);const snip=i>=0?h.text.slice(Math.max(0,i-30),i+60).replace(/[<>]/g,''):'';return `<a href="${h.href}"><span class="kind">${h.kind}</span>${h.title}<div class="snip">${snip}</div></a>`}).join(''):'<div style="padding:10px">没有结果</div>';
    box.hidden=false;
  }
}
