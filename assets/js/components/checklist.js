// ```exercise 标题  每行 "- 项目"，勾选状态存在 localStorage
import {inline} from '../markdown.js';
export function exercise(args,body,ctx){
  const items=body.split('\n').filter(l=>/^\s*-\s+/.test(l)).map(l=>l.replace(/^\s*-\s+/,''));
  const b=ctx.exBlock=(ctx.exBlock??-1)+1;
  ctx.exerciseCount=(ctx.exerciseCount||0)+items.length;
  return `<ul class="checklist"><li class="ex-title">✎ ${inline(args||'练习')}</li>${items.map((it,i)=>{
    const key=`${ctx.chapterId}-${b}-${i}`;
    return `<li><input type="checkbox" data-check="${key}" id="c-${key}"><label for="c-${key}">${inline(it)}</label></li>`}).join('')}</ul>`;
}
