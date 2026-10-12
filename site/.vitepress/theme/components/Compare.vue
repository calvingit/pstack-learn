<!-- 对照表：标题 + 普通 Markdown 表格 -->
<script setup>defineProps({ title: String })</script>
<template><div class="compare-block"><div v-if="title" class="compare-title">{{ title }}</div><slot /></div></template>
