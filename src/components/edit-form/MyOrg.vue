<template>
  <v-select
    v-model="orgName"
    :items="allGroups"
    item-title="name"
    item-value="name"
    label="団体名"
    variant="outlined"
    density="comfortable"
    required
    persistent-hint
    prepend-inner-icon="mdi-domain"
    class="pt-5"
  />
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { allGroups } from '@/data/groups'

const store = useStore()

const orgName = computed({
  get: () => store.getters['auth/belongingOrgs'][0]?.name || '',
  set: (value) => store.dispatch('auth/saveUserOrgs', [{ name: value }]),
})

onMounted(() => {
  store.dispatch('auth/fetchUserOrgs')
})
</script>
