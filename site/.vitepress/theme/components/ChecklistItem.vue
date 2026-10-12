<script setup>
import { ref, onMounted } from 'vue'
import { store } from '../store.js'
const props = defineProps({ k: { type: String, required: true } })
const checked = ref(false)
onMounted(() => { checked.value = store.isChecked(props.k) })
const onChange = () => store.setChecked(props.k, checked.value)
</script>
<template>
  <li><label><input type="checkbox" v-model="checked" @change="onChange" /> <span><slot /></span></label></li>
</template>
