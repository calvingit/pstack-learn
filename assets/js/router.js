// 哈希路由：#/  #/ch/<id>  #/ref/<kind>
export function parseRoute(){
  const h=decodeURIComponent(location.hash.replace(/^#/,''))||'/';
  const [path,anchor]=h.split('::');
  const parts=path.split('/').filter(Boolean);
  if(!parts.length) return {name:'home'};
  if(parts[0]==='ch') return {name:'chapter',id:parts[1],anchor};
  if(parts[0]==='ref') return {name:'ref',kind:parts[1],anchor};
  return {name:'notfound'};
}
export function onRoute(fn){ window.addEventListener('hashchange',fn); fn(); }
