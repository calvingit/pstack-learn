<!-- 章节页顶部信息条 -->
<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'
const { frontmatter } = useData()
const params = computed(() => frontmatter.value.chapter)
</script>
<template>
  <div v-if="params" class="chapter-meta">
    <span>第 {{ params.num }} 章</span><span>约 {{ params.minutes }} 分钟</span>
    <span>来源 {{ params.sources.length }} 条</span><span>练习 {{ params.exercises }} 项</span>
  </div>
</template>
