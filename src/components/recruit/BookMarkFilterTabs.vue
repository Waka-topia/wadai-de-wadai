<template>
  <div class="d-flex align-center bg-white rounded-t">
    <v-tabs v-model="filterTab" color="orange" bg-color="transparent" grow>
      <v-tab
        v-for="option in filterOptions"
        :key="option.value"
        :value="option.value"
        class="font-weight-bold"
      >
        <v-icon
          v-if="option.activeIcon"
          size="large"
          :color="filterTab === option.value ? 'orange' : 'grey-lighten-1'"
        >
          {{ filterTab === option.value ? option.activeIcon : option.inactiveIcon }}
        </v-icon>
        {{ option.label }}
      </v-tab>
    </v-tabs>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const filterTab = computed({
  get: () => store.state.jobs.showBookmarkedOnly,
  set: (value) => store.commit('setShowBookmarkedOnly', value),
})

const isAuthenticated = computed(() => !!store.state.auth?.userId)

const filterOptions = computed(() => {
  const options = [{ value: false, label: 'すべて' }]
  if (isAuthenticated.value) {
    options.push({
      value: true,
      label: '「気になる」求人のみ',
      activeIcon: 'mdi-star',
      inactiveIcon: 'mdi-star-outline',
    })
  }
  return options
})
</script>
