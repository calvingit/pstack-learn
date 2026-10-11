// ```quote  每行 key: value，key 为 en / zh / by / url
import {inline} from '../markdown.js';
export function quote(args,body){
  const f={};body.split('\n').forEach(l=>{const m=l.match(/^(\w+):\s*(.*)$/);if(m)f[m[1]]=(f[m[1]]?f[m[1]]+' ':'')+m[2]});
  const by=f.url?`<a href="${f.url}" target="_blank" rel="noopener">${inline(f.by||f.url)}</a>`:inline(f.by||'');
  return `<figure class="quote-card">${f.en?`<div class="en">“${inline(f.en)}”</div>`:''}${f.zh?`<div class="zh">${inline(f.zh)}</div>`:''}<figcaption class="by">— ${by}</figcaption></figure>`;
}
