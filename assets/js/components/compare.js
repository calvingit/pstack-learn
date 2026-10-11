// ```compare 标题  内容是普通 Markdown 表格，外加标题与样式
import {render,inline} from '../markdown.js';
export function compare(args,body,ctx){
  return `<div class="compare-block">${args?`<div class="callout-title">${inline(args)}</div>`:''}${render(body,ctx.hook).replace('<table>','<table class="compare">')}</div>`;
}
