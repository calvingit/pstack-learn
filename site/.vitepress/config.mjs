import { defineConfig } from 'vitepress'
import { blocksPlugin } from './blocks.mjs'
import chapters from '../../data/chapters.json' with { type: 'json' }

function cjkTokenize(text) {
  const out = []
  for (const w of text.toLowerCase().split(/[\s\p{P}\p{S}]+/u)) {
    if (!w) continue
    out.push(w)
    for (const run of w.match(/[\u3400-\u9fff]+/g) || [])
      for (let i = 0; i < run.length; i++) out.push(run.slice(i, i + 12))
  }
  return out
}

// 侧栏用的短章名（章节页标题仍用 chapters.json 的完整标题）
const SHORT = {
  '02-poteto-mode': '入口与剧本机制',
  '08-principles': '原则体系',
  '09-self-improve': '自我改进',
  '10-community': '社区实践',
  '11-calvingit': '对照我们的仓库',
  '12-changelog': '更新记录'
}

export default defineConfig({
  lang: 'zh-CN',
  title: 'pstack 中文课程',
  description: '系统学习 @poteto 的 pstack：原创分析、源码解读、社区资料和练习',
  // GitHub Pages 用 /pstack-learn/；Cloudflare Pages（CF_PAGES=1）用 /；也可用 VITEPRESS_BASE 覆盖
  base: process.env.VITEPRESS_BASE || (process.env.CF_PAGES ? '/' : '/pstack-learn/'),
  cleanUrls: false,
  lastUpdated: false,
  markdown: { config: md => md.use(blocksPlugin), lineNumbers: false },
  themeConfig: {
    nav: [
      { text: '开始学习', link: '/ch/00-intro' },
      { text: '速查', items: [
        { text: '24 条原则', link: '/ref/principles' },
        { text: '23 个 playbook', link: '/ref/playbooks' },
        { text: '技能清单', link: '/ref/skills' },
        { text: '术语表', link: '/ref/glossary' },
        { text: '来源列表', link: '/ref/sources' }
      ] },
      { text: 'pstack 源码', link: 'https://github.com/cursor/plugins/tree/main/pstack' }
    ],
    // 侧栏只放简短章名，不出现技能 / playbook / 原则名；速查页各一项，默认折叠
    // 第 11 章是可选的仓库对照，不放进主线分组。上一章/下一章仍按 chapters.json 顺序。
    sidebar: [
      { text: '课程', items: chapters.filter(c => c.id !== '11-calvingit').map(c => ({ text: `${c.num}. ${SHORT[c.id] || c.title.split('：')[0]}`, link: `/ch/${c.id}` })) },
      { text: '可选', items: chapters.filter(c => c.id === '11-calvingit').map(c => ({ text: `${c.num}. ${SHORT[c.id] || c.title.split('：')[0]}`, link: `/ch/${c.id}` })) },
      { text: '速查', collapsed: true, items: [
        { text: '原则', link: '/ref/principles' },
        { text: 'Playbook', link: '/ref/playbooks' },
        { text: '技能清单', link: '/ref/skills' },
        { text: '术语表', link: '/ref/glossary' },
        { text: '来源列表', link: '/ref/sources' }
      ] }
    ],
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一章', next: '下一章' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/calvingit/pstack-learn' }],
    darkModeSwitchLabel: '外观', lightModeSwitchTitle: '切换到浅色', darkModeSwitchTitle: '切换到深色',
    sidebarMenuLabel: '目录', returnToTopLabel: '回到顶部', langMenuLabel: '语言',
    notFound: { title: '找不到这个页面', quote: '链接可能已经变了。', linkText: '回首页' },
    search: {
      provider: 'local',
      options: {
        // 中文没有空格分词。建索引时把每段中文拆成所有后缀（最长 12 字），
        // 浏览器端默认分词 + 前缀匹配就能命中任意中文子串，如“验证”“懒惰协议”。
        miniSearch: { options: { tokenize: cjkTokenize }, searchOptions: { prefix: true, fuzzy: 0.1, combineWith: 'AND' } },
        translations: {
          button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
          modal: { noResultsText: '没有结果：', resetButtonTitle: '清除', backButtonTitle: '关闭',
            displayDetails: '显示详情', footer: { selectText: '打开', navigateText: '切换', closeText: '关闭' } }
        }
      }
    }
  }
})
