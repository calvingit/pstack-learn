// 自定义块组件注册表：Markdown 中 ```<kind> <args> 的代码块会交给这里渲染。
import {callout} from './callout.js';
import {quote} from './quote.js';
import {exercise} from './checklist.js';
import {sources} from './source-card.js';
import {compare} from './compare.js';
export const components={callout,quote,exercise,sources,compare};
export function makeHook(ctx){
  return (kind,args,body)=>components[kind]?components[kind](args,body,ctx):null;
}
