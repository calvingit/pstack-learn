<!-- 章节页底部：本章来源 + 已读开关 -->
<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useData } from 'vitepress'
import { store } from '../store.js'
import SourceCard from './SourceCard.vue'
const { frontmatter } = useData()
const params = computed(() => frontmatter.value.chapter)
const done = ref(false)
const sync = () => { if (params.value?.id) done.value = store.isDone(params.value.id) }
onMounted(sync); watch(() => params.value?.id, sync)
const onChange = () => store.setDone(params.value.id, done.value)
</script>
<template>
  <div v-if="params?.id" class="chapter-footer">
    <h2 v-if="params.sources.length" id="本章来源">本章来源</h2>
    <div class="source-list"><SourceCard v-for="s in params.sources" :key="s" :id="s" /></div>
    <label class="done-toggle"><input type="checkbox" v-model="done" @change="onChange" /> 本章已读完</label>
  </div>
</template>
