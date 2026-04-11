<template>
  <v-btn
    v-if="isAuthenticated"
    icon
    :variant="isBookmarked ? 'flat' : 'elevated'"
    :color="isBookmarked ? 'orange-lighten-5' : 'white'"
    class="bookmark-btn"
    @click="toggleBookmark"
  >
    <v-icon size="35" :color="isBookmarked ? 'orange' : 'grey-lighten-1'">
      {{ isBookmarked ? 'mdi-star' : 'mdi-star-outline' }}
    </v-icon>
  </v-btn>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useSnackbar } from '@/composables/useSnackbar'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'

const props = defineProps({
  jobId: {
    type: Number,
    required: true,
  },
  isBookmarked: {
    type: Boolean,
    default: false,
  },
})

const store = useStore()

// authモジュールからuserIdが存在するかどうか判定
const isAuthenticated = computed(() => !!store.state.auth?.userId)

const { showSnackbar } = useSnackbar()

const toggleBookmark = () => {
  const willBookmark = !props.isBookmarked
  void logFirebaseAnalyticsEvent('job_bookmark_toggle', {
    jobId: props.jobId,
    bookmarked: willBookmark,
  })
  showSnackbar(willBookmark ? 'お気に入りに登録しました' : 'お気に入りを解除しました', 'info', {
    icon: 'mdi-check-circle',
  })

  store.dispatch('toggleJobBookmark', props.jobId)
}
</script>

<style scoped>
.bookmark-btn {
  border: 1px solid transparent;
}
</style>
