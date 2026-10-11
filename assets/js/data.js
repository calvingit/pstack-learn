// 读取 data/*.json 与 content/*.md，带缓存。
const cache=new Map();
export async function getJSON(name){
  if(!cache.has(name)) cache.set(name, fetch(`data/${name}.json`).then(r=>{if(!r.ok)throw new Error(`data/${name}.json ${r.status}`);return r.json()}));
  return cache.get(name);
}
export async function getText(path){
  if(!cache.has(path)) cache.set(path, fetch(path).then(r=>{if(!r.ok)throw new Error(`${path} ${r.status}`);return r.text()}));
  return cache.get(path);
}
