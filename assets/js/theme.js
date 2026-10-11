import {store} from './store.js';
export function initTheme(btn){
  const apply=t=>document.documentElement.dataset.theme=t;
  apply(store.get('theme', matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'));
  btn.addEventListener('click',()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';apply(t);store.set('theme',t)});
}
