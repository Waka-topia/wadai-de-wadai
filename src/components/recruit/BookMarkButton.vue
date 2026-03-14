<template>
  <v-btn
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

  <v-snackbar v-model="snackbar" :timeout="2000" location="bottom">
    {{ snackbarMessage }}

    <template v-slot:actions>
      <v-btn color="orange" variant="text" @click="snackbar = false"> 閉じる </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'

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

const snackbar = ref(false)
const snackbarMessage = ref('')

const toggleBookmark = () => {
  const willBookmark = !props.isBookmarked
  snackbarMessage.value = willBookmark ? 'お気に入りに登録しました' : 'お気に入りを解除しました'

  snackbar.value = true

  store.dispatch('toggleJobBookmark', props.jobId)
}
</script>

<style scoped>
.bookmark-btn {
  border: 1px solid transparent;
}
</style>
