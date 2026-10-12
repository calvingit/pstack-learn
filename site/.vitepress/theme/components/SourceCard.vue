<!-- 来源卡片：传 id（查 sources.json）或直接传 source 对象 -->
<script setup>
import { computed } from 'vue'
import { sourceMap } from '../data.js'
const props = defineProps({ id: String, source: Object })
const s = computed(() => props.source || sourceMap[props.id])
</script>
<template>
  <div class="source-card" v-if="s">
    <a :href="s.url" target="_blank" rel="noopener">{{ s.title }}</a>
    <Badge :type="s.verified ? 'tip' : 'warning'" :text="s.verified ? '已核实' : '未核实'" />
    <div class="meta">{{ s.author }} · {{ s.date }} · {{ s.type }}</div>
    <div class="note" v-if="s.note">{{ s.note }}</div>
  </div>
  <div class="source-card" v-else>缺少来源：{{ id }}</div>
</template>
