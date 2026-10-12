import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import './style.css'
import Checklist from './components/Checklist.vue'
import ChecklistItem from './components/ChecklistItem.vue'
import Compare from './components/Compare.vue'
import SourceCard from './components/SourceCard.vue'
import ChapterGrid from './components/ChapterGrid.vue'
import ChapterMeta from './components/ChapterMeta.vue'
import ChapterFooter from './components/ChapterFooter.vue'

export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'doc-before': () => h(ChapterMeta),
    'doc-footer-before': () => h(ChapterFooter)
  }),
  enhanceApp({ app }) {
    Object.entries({ Checklist, ChecklistItem, Compare, SourceCard, ChapterGrid })
      .forEach(([n, c]) => app.component(n, c))
  }
}
