// localStorage 封装：阅读进度、练习勾选、主题。
const KEY='pstack-learn-v2';
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{}}catch{return {}}};
const write=s=>localStorage.setItem(KEY,JSON.stringify(s));
export const store={
  get(k,d){const s=read();return k in s?s[k]:d},
  set(k,v){const s=read();s[k]=v;write(s)},
  isDone(id){return !!this.get('done',{})[id]},
  setDone(id,v){const d=this.get('done',{});if(v)d[id]=1;else delete d[id];this.set('done',d);document.dispatchEvent(new CustomEvent('progress'))},
  isChecked(k){return !!this.get('checks',{})[k]},
  setChecked(k,v){const d=this.get('checks',{});if(v)d[k]=1;else delete d[k];this.set('checks',d)}
};
