// 入口：加载章节目录，挂路由、侧栏、搜索、主题
import {getJSON} from './data.js';
import {parseRoute,onRoute} from './router.js';
import {renderNav} from './nav.js';
import {initSearch} from './search.js';
import {initTheme} from './theme.js';
import {homePage,chapterPage,refPage} from './pages.js';

const app=document.getElementById('app'), side=document.getElementById('sidebar');
initTheme(document.getElementById('themeToggle'));
document.getElementById('navToggle').addEventListener('click',()=>side.classList.toggle('open'));

const chapters=await getJSON('chapters');
initSearch(document.getElementById('search'),document.getElementById('searchResults'),chapters);
let current='home';
document.addEventListener('progress',()=>renderNav(side,chapters,current));
onRoute(async()=>{
  const r=parseRoute(); side.classList.remove('open');
  current=r.name==='chapter'?r.id:r.name==='ref'?'ref-'+r.kind:'home';
  renderNav(side,chapters,current);
  try{
    if(r.name==='chapter') await chapterPage(app,chapters,r.id,r.anchor);
    else if(r.name==='ref') await refPage(app,r.kind);
    else await homePage(app,chapters);
    document.title=(document.querySelector('#app h1')?.textContent||'首页')+' · pstack 中文课程';
  }catch(e){console.error(e);app.innerHTML=`<h1>加载失败</h1><p>${e.message}</p><p>如果你是直接双击打开的文件，请改用 <code>python3 -m http.server</code> 启动本地服务。</p>`}
});
