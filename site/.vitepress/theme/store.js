// localStorage 进度：沿用 v2 的键名，旧站的勾选和已读记录不会丢
import { ref } from 'vue'
const KEY = 'pstack-learn-v2'
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} } }
export const version = ref(0)
function toggle(field, k, v) {
  const s = read(); const d = s[field] || {}
  if (v) d[k] = 1; else delete d[k]
  s[field] = d; localStorage.setItem(KEY, JSON.stringify(s)); version.value++
}
export const store = {
  isDone: id => typeof window !== 'undefined' && !!(read().done || {})[id],
  setDone: (id, v) => toggle('done', id, v),
  isChecked: k => typeof window !== 'undefined' && !!(read().checks || {})[k],
  setChecked: (k, v) => toggle('checks', k, v)
}
