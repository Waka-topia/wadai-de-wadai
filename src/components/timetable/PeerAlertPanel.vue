<template>
  <div class="alert-panel">
    <div class="alert-panel-header">
      <v-icon size="18" color="orange">mdi-bell-ring</v-icon>
      <span class="panel-title">みんなの情報</span>
      <span class="lecture-name-chip">{{ lectureName }}</span>
    </div>

    <!-- アラート投稿フォーム -->
    <div class="post-form">
      <v-text-field
        v-model="newContent"
        variant="outlined"
        density="compact"
        placeholder="例：3/15 レポート締切、次回小テストあり"
        hide-details
        class="flex-grow-1"
        @keyup.enter="submitAlert"
      />
      <v-btn
        color="orange"
        variant="flat"
        :disabled="!newContent.trim()"
        size="small"
        class="ml-2"
        @click="submitAlert"
      >
        投稿
      </v-btn>
    </div>

    <!-- アラート一覧 -->
    <div v-if="isLoading" class="loading-area">
      <v-progress-circular indeterminate color="orange" size="24" />
    </div>

    <div v-else-if="alerts.length === 0" class="empty-alerts">
      <v-icon color="#ddd" size="32">mdi-bell-outline</v-icon>
      <p>まだ情報はありません</p>
    </div>

    <div v-else class="alert-list">
      <div v-for="alert in alerts" :key="alert.id" class="alert-item">
        <div class="alert-meta">
          <v-icon size="14" color="#aaa">mdi-account-circle</v-icon>
          <span class="author-name">{{ alert.authorName }}</span>
          <span class="alert-date">{{ formatDate(alert.createdAt) }}</span>
          <v-btn
            v-if="alert.authorUid === currentUid"
            icon
            variant="text"
            size="x-small"
            color="error"
            @click="removeAlert(alert)"
          >
            <v-icon size="14">mdi-trash-can-outline</v-icon>
          </v-btn>
        </div>
        <div class="alert-content">{{ alert.content }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { fetchAlerts, postAlert, deleteAlert } from '@/services/alertService'
import { normalizeLectureName } from '@/utils/lectureNormalizer'

const props = defineProps({
  lectureName: {
    type: String,
    default: '',
  },
})

const store = useStore()
const alerts = ref([])
const isLoading = ref(false)
const newContent = ref('')

const currentUid = store.getters['auth/userId']
const currentDisplayName = store.getters['auth/displayName']

const nameNormalized = ref('')

const loadAlerts = async () => {
  if (!props.lectureName) return
  nameNormalized.value = normalizeLectureName(props.lectureName, { katakana: true })
  isLoading.value = true
  alerts.value = await fetchAlerts(nameNormalized.value)
  isLoading.value = false
}

onMounted(loadAlerts)
watch(() => props.lectureName, loadAlerts)

const submitAlert = async () => {
  const content = newContent.value.trim()
  if (!content || !nameNormalized.value) return
  await postAlert(nameNormalized.value, props.lectureName, content, {
    uid: currentUid,
    displayName: currentDisplayName,
  })
  newContent.value = ''
  await loadAlerts()
}

const removeAlert = async (alert) => {
  await deleteAlert(nameNormalized.value, alert.id)
  await loadAlerts()
}

const formatDate = (ts) => {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.alert-panel {
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-top: 16px;
}

.alert-panel-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.panel-title {
  font-size: 0.9rem;
  font-weight: bold;
  color: #444;
}

.lecture-name-chip {
  font-size: 0.75rem;
  background: #fff3e0;
  color: #ff9800;
  border-radius: 20px;
  padding: 2px 10px;
  margin-left: auto;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

.post-form {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 12px;
}

.loading-area,
.empty-alerts {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 0;
  color: #bbb;
  font-size: 0.85rem;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 240px;
  overflow-y: auto;
}

.alert-item {
  background: #fafafa;
  border-left: 3px solid #ff9800;
  border-radius: 4px;
  padding: 8px 10px;
}

.alert-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.author-name {
  font-size: 0.78rem;
  font-weight: bold;
  color: #666;
}

.alert-date {
  font-size: 0.72rem;
  color: #aaa;
  margin-left: 4px;
}

.alert-content {
  font-size: 0.88rem;
  color: #333;
  line-height: 1.4;
}
</style>
