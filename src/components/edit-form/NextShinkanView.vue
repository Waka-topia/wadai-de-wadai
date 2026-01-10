<template>
  <div>
    <h3>次の新歓情報</h3>
    <div>
      <p><strong>団体名:</strong> {{ nextShinkan.groupName }}</p>
      <p><strong>次に行く日付:</strong> {{ nextShinkan.nextDate }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const nextShinkan = computed(
  () => store.state.shinkan.nextShinkan || { groupName: '未設定', nextDate: '未設定' },
)
</script>
