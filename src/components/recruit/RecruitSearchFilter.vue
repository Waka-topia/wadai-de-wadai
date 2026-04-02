<template>
  <div class="search-filter-bg pa-4">
    <v-card class="mx-1" rounded="xl">
      <div class="d-flex align-center px-4 py-3">
        <div class="flex-grow-1" @click="dialog = true">
          <div class="d-flex align-center">
            <v-icon color="orange" size="20" class="mr-2">mdi-tag</v-icon>

            <div v-if="selectedTags.length" class="d-flex align-center flex-wrap" style="gap: 6px">
              <v-chip
                v-for="tag in selectedTags"
                :key="tag"
                size="small"
                color="orange"
                variant="flat"
                class="text-white custom-tag"
              >
                {{ tag }}
              </v-chip>
            </div>

            <span v-else class="text-body-2 text-grey">タグを選択してください</span>
          </div>
        </div>

        <v-btn icon variant="text" color="orange" size="large" @click="applyTagFilter">
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
      </div>
    </v-card>

    <v-dialog v-model="dialog" max-width="500">
      <v-card rounded="xl">
        <v-card-title class="font-weight-bold">タグ検索</v-card-title>

        <v-card-text>
          <div class="d-flex flex-wrap" style="gap: 8px">
            <v-chip
              v-for="tag in allTags"
              :key="tag"
              :color="selectedTags.includes(tag) ? 'orange' : '#f0f0f0'"
              :variant="selectedTags.includes(tag) ? 'flat' : 'flat'"
              :class="
                selectedTags.includes(tag)
                  ? 'custom-tag selected-tag text-white'
                  : 'custom-tag-outlined'
              "
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </v-chip>
          </div>
        </v-card-text>

        <v-card-actions class="justify-space-between px-4 pb-4">
          <v-btn variant="text" @click="clearTags">クリア</v-btn>
          <div>
            <v-btn variant="text" @click="dialog = false">閉じる</v-btn>
            <v-btn color="orange" class="text-white" @click="applyTagFilter">検索する</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'

const store = useStore()
const route = useRoute()
const router = useRouter()

const dialog = ref(false)

const jobs = computed(() => store.state.jobs.jobs || [])

const allTags = computed(() => {
  const tagSet = new Set()
  jobs.value.forEach((job) => {
    ;(job.tags || []).forEach((tag) => tagSet.add(tag))
  })
  return [...tagSet]
})

const selectedTags = ref([])

watch(
  () => route.query.tags,
  (tags) => {
    if (!tags) {
      selectedTags.value = []
    } else {
      selectedTags.value = Array.isArray(tags) ? tags : [tags]
    }
  },
  { immediate: true },
)

const toggleTag = (tag) => {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter((t) => t !== tag)
  } else {
    selectedTags.value = [...selectedTags.value, tag]
  }
}

const clearTags = () => {
  selectedTags.value = []
}

const applyTagFilter = () => {
  router.push({
    path: '/jobs',
    query: selectedTags.value.length ? { tags: selectedTags.value } : {},
  })
  dialog.value = false
}
</script>

<style scoped>
.search-filter-bg {
  background-color: #ff9800;
}

.custom-tag {
  position: relative;
  padding: 6px 12px 6px 18px;
  clip-path: polygon(10px 0%, 100% 0%, 100% 100%, 10px 100%, 0% 50%);
  border-radius: 6px;
}

.custom-tag::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
}

.custom-tag-outlined {
  position: relative;
  padding: 6px 12px 6px 18px;
  clip-path: polygon(10px 0%, 100% 0%, 100% 100%, 10px 100%, 0% 50%);
  border-radius: 6px;
}

.custom-tag-outlined::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  background: black;
  border-radius: 50%;
}
</style>
