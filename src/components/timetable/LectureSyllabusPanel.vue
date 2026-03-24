<template>
  <div class="mt-4" :class="isExpanded ? 'syllabus-panel' : ''">
    <template v-if="!isExpanded">
      <v-btn
          block
          variant="tonal"
          color="teal"
          class="text-body-2 font-weight-bold py-2"
          height="auto"
          @click="expandPanel"
        >
        <v-icon size="18" class="mr-2">mdi-book-open-variant</v-icon>
        みんなのシラバスを見る
      </v-btn>
    </template>

    <template v-else>
      <div class="syllabus-header mb-3">
        <v-icon color="teal" size="20" class="mr-2">mdi-book-open-variant</v-icon>
      <span class="syllabus-title">みんなのシラバス</span>
      <v-spacer></v-spacer>
      <v-btn v-if="!isEditing" size="small" density="compact" variant="text" color="grey" class="mr-1" @click="closePanel">
        閉じる
      </v-btn>
      <v-btn v-if="!isEditing && isLoggedIn" size="small" density="compact" variant="text" color="teal" @click="startEdit">
        <v-icon left size="16">mdi-pencil</v-icon>編集
      </v-btn>
    </div>

    <div v-if="loading" class="text-center py-4">
      <v-progress-circular indeterminate size="24" color="teal"></v-progress-circular>
    </div>
    
    <div v-else-if="!isEditing" class="syllabus-content">
      <template v-if="hasContent">
        <div v-if="syllabus.description" class="syllabus-section">
          <div class="section-title">授業概要</div>
          <div class="section-body">{{ syllabus.description }}</div>
        </div>
        <div v-if="syllabus.grading" class="syllabus-section">
          <div class="section-title">評価方法</div>
          <div class="section-body">{{ syllabus.grading }}</div>
        </div>
        <div v-if="syllabus.textbook" class="syllabus-section">
          <div class="section-title">教科書・参考書</div>
          <div class="section-body">{{ syllabus.textbook }}</div>
        </div>
        
        <div class="syllabus-footer mt-3">
          <v-btn v-if="syllabus.previousVersion" size="x-small" variant="tonal" color="blue-grey" class="mb-1" @click="showHistory = !showHistory">
            <v-icon left size="14">mdi-history</v-icon>
            {{ showHistory ? '履歴を閉じる' : '1つ前の履歴を見る' }}
          </v-btn>

          <div class="footer-meta">
            <v-icon size="12" color="grey" class="mr-1">mdi-account-edit</v-icon>
            最終更新: {{ syllabus.lastEditedBy }}
            <span v-if="updatedDate">({{ updatedDate }})</span>
          </div>
        </div>

        <!-- 履歴表示エリア -->
        <v-expand-transition>
          <div v-if="showHistory && syllabus.previousVersion" class="history-view mt-3">
            <div class="d-flex justify-space-between align-center mb-2">
              <div class="text-caption font-weight-bold text-blue-grey-darken-1">
                1つ前の内容 (編集者: {{ syllabus.previousVersion.editedBy }})
              </div>
              <v-btn size="x-small" variant="flat" color="blue-grey" @click="restorePrevious">
                この内容を復元する
              </v-btn>
            </div>
            
            <div v-if="syllabus.previousVersion.description" class="history-text text-caption">
              <strong class="text-grey-darken-1">概要:</strong> {{ syllabus.previousVersion.description }}
            </div>
            <div v-if="syllabus.previousVersion.grading" class="history-text text-caption">
              <strong class="text-grey-darken-1">評価:</strong> {{ syllabus.previousVersion.grading }}
            </div>
            <div v-if="syllabus.previousVersion.textbook" class="history-text text-caption">
              <strong class="text-grey-darken-1">教科書:</strong> {{ syllabus.previousVersion.textbook }}
            </div>
          </div>
        </v-expand-transition>
      </template>
      <template v-else>
        <div class="empty-state text-center py-3">
          <v-icon color="grey-lighten-1" size="32" class="mb-2">mdi-file-document-outline</v-icon>
          <div class="text-caption text-grey">まだシラバス情報がありません。<br>あなたが最初の編集者になりませんか？</div>
          <v-btn v-if="isLoggedIn" size="small" variant="outlined" color="teal" class="mt-3" @click="startEdit">
            シラバスを作成
          </v-btn>
        </div>
      </template>
    </div>

    <div v-else class="syllabus-edit-form">
      <div class="field-label">授業概要</div>
      <v-textarea v-model="editForm.description" variant="outlined" density="compact" rows="3" placeholder="この授業で学ぶこと" class="mb-2"></v-textarea>
      
      <div class="field-label">評価方法</div>
      <v-textarea v-model="editForm.grading" variant="outlined" density="compact" rows="2" placeholder="期末テスト 50%, レポート 50%" class="mb-2"></v-textarea>
      
      <div class="field-label">教科書・参考書</div>
      <v-textarea v-model="editForm.textbook" variant="outlined" density="compact" rows="2" placeholder="使用するテキストや指定図書" class="mb-2"></v-textarea>
      
      <div class="d-flex justify-end gap-2 mt-2">
        <v-btn variant="text" size="small" @click="cancelEdit">キャンセル</v-btn>
        <v-btn color="teal" variant="flat" size="small" :loading="saving" @click="saveEdition">保存</v-btn>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { getSyllabus, saveSyllabus } from '@/services/syllabusService'

const props = defineProps({
  lectureName: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:expanded'])

const store = useStore()
const isLoggedIn = computed(() => store.getters['auth/isAuthenticated'])
const uid = computed(() => store.getters['auth/userId'])
const userName = computed(() => store.getters['auth/displayName'] || '匿名ユーザー')

const loading = ref(true)
const isEditing = ref(false)
const saving = ref(false)
const showHistory = ref(false)
const isExpanded = ref(false)

const syllabus = ref({
  description: '',
  grading: '',
  textbook: '',
  lastEditedBy: '',
  updatedAt: null,
  previousVersion: null,
})

const editForm = ref({
  description: '',
  grading: '',
  textbook: '',
})

const hasContent = computed(() => {
  return !!(syllabus.value.description || syllabus.value.grading || syllabus.value.textbook)
})

const updatedDate = computed(() => {
  if (!syllabus.value.updatedAt) return ''
  const d = syllabus.value.updatedAt.toDate ? syllabus.value.updatedAt.toDate() : new Date(syllabus.value.updatedAt)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
})

const loadSyllabus = async () => {
  if (!props.lectureName || !isExpanded.value) return
  loading.value = true
  isEditing.value = false
  try {
    const data = await getSyllabus(props.lectureName)
    if (data) {
      syllabus.value = {
        description: data.description || '',
        grading: data.grading || '',
        textbook: data.textbook || '',
        lastEditedBy: data.lastEditedBy || '匿名ユーザー',
        updatedAt: data.updatedAt || null,
        previousVersion: data.previousVersion || null,
      }
    } else {
      syllabus.value = {
        description: '',
        grading: '',
        textbook: '',
        lastEditedBy: '',
        updatedAt: null,
        previousVersion: null,
      }
    }
  } catch (e) {
    console.error('シラバス取得エラー:', e)
  } finally {
    loading.value = false
  }
}

watch(() => props.lectureName, () => {
  isExpanded.value = false
  emit('update:expanded', false)
  isEditing.value = false
  showHistory.value = false
})

const expandPanel = () => {
  isExpanded.value = true
  emit('update:expanded', true)
  loadSyllabus()
}

const closePanel = () => {
  isExpanded.value = false
  emit('update:expanded', false)
}

const startEdit = () => {
  editForm.value = {
    description: syllabus.value.description,
    grading: syllabus.value.grading,
    textbook: syllabus.value.textbook,
  }
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
}

const restorePrevious = () => {
  if (!syllabus.value.previousVersion) return
  // 前バージョンの内容をエディタにセットして編集モードを開く
  editForm.value = {
    description: syllabus.value.previousVersion.description || '',
    grading: syllabus.value.previousVersion.grading || '',
    textbook: syllabus.value.previousVersion.textbook || '',
  }
  showHistory.value = false
  isEditing.value = true
}

const saveEdition = async () => {
  if (!isLoggedIn.value) return
  saving.value = true
  try {
    await saveSyllabus(props.lectureName, editForm.value, uid.value, userName.value)
    await loadSyllabus()
    isEditing.value = false
  } catch (e) {
    console.error('保存エラー:', e)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.syllabus-panel {
  background: white;
  border: none;
  border-radius: 8px;
  padding: 12px 4px;
}

.syllabus-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.syllabus-title {
  font-size: 0.95rem;
  font-weight: bold;
  color: #00796b;
  white-space: nowrap;
}

.syllabus-section {
  margin-bottom: 12px;
}

.section-title {
  font-size: 0.75rem;
  font-weight: bold;
  color: #555;
  margin-bottom: 4px;
}

.section-body {
  font-size: 0.82rem;
  color: #333;
  line-height: 1.5;
  white-space: pre-wrap;
  background: #f9fbfb;
  padding: 8px 10px;
  border-radius: 6px;
  border-left: 3px solid #b2dfdb;
}

.syllabus-footer {
  font-size: 0.7rem;
  color: #999;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 4px;
}

.footer-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-left: auto;
  white-space: nowrap;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 4px;
}

.history-view {
  background: #f0f4f8;
  border-radius: 6px;
  padding: 10px 12px;
  border-left: 3px solid #607d8b;
}

.history-text {
  margin-bottom: 4px;
  white-space: pre-wrap;
  line-height: 1.4;
}
.history-text:last-child {
  margin-bottom: 0;
}

.gap-2 {
  gap: 8px;
}
</style>
