<!-- 首页章节卡片，带已读标记 -->
<script setup>
import { ref, onMounted } from 'vue'
import { withBase } from 'vitepress'
import { chapters } from '../data.js'
import { store, version } from '../store.js'
const mounted = ref(false)
onMounted(() => { mounted.value = true })
const done = id => (version.value, mounted.value && store.isDone(id))
</script>
<template>
  <div class="home-grid">
    <a v-for="c in chapters" :key="c.id" class="home-card" :href="withBase(`/ch/${c.id}.html`)">
      <div class="num">第 {{ c.num }} 章<span v-if="done(c.id)"> · 已读</span></div>
      <div class="title">{{ c.title }}</div>
      <div class="sum">{{ c.summary }}</div>
    </a>
  </div>
</template>
