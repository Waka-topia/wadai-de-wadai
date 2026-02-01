<template>
  <p>
    {{ job }}
  </p>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'

const route = useRoute()
const store = useStore()

const jobId = Number(route.params.id)

const job = computed(() => store.state.jobs.currentJob)

onMounted(() => {
  store.dispatch('fetchJobById', jobId)
})
</script>
