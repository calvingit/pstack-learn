// ```callout <tip|warn|ok|bad> 标题
import {render,inline} from '../markdown.js';
export function callout(args,body,ctx){
  const [type,...t]=args.split(/\s+/);
  const title=t.join(' ');
  return `<div class="callout ${type||'tip'}">${title?`<div class="callout-title">${inline(title)}</div>`:''}${render(body,ctx.hook)}</div>`;
}
