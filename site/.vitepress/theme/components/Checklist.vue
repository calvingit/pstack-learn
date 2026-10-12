<!-- 练习清单：子项是 ChecklistItem，勾选状态存在浏览器 -->
<script setup>defineProps({ title: { type: String, default: '练习' } })</script>
<template>
  <div class="checklist"><div class="checklist-title">✎ {{ title }}</div><ul><slot /></ul></div>
</template>
