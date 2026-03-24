<template>
  <v-dialog v-model="dialog" max-width="480" persistent scrollable>
    <v-card class="modal-card" rounded="xl">
      <v-card-title class="modal-title">
        <span>{{ selectedCell ? `${dayLabel} ${selectedCell.period}限` : '講義を登録' }}</span>
        <v-btn icon variant="text" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="modal-body">
        <!-- 講義名（サジェスト付き） -->
        <div class="field-label">講義名 <span class="required">*</span></div>
        <v-combobox
          v-model="form.name"
          :items="suggestions"
          :loading="suggestLoading"
          item-title="name"
          item-value="name"
          variant="outlined"
          placeholder="例：基礎プログラミング"
          density="compact"
          no-filter
          hide-no-data
          persistent-placeholder
          :rules="[(v) => !!v || '講義名を入力してください']"
          class="mb-2"
          @update:search="onNameSearch"
        >
          <template #item="{ item, props: itemProps }">
            <v-list-item v-bind="itemProps">
              <template #append>
                <v-chip size="x-small" color="orange" variant="tonal">
                  {{ item.raw.count }}人登録済
                </v-chip>
              </template>
            </v-list-item>
          </template>
        </v-combobox>

        <!-- カラー選択 -->
        <div class="field-label">カラー</div>
        <div class="color-palette mb-3">
          <button
            v-for="(colorDef, colorKey) in colorPalette"
            :key="colorKey"
            class="color-swatch"
            :style="{ backgroundColor: colorDef.border }"
            :class="{ 'color-swatch--selected': form.color === colorKey }"
            :title="colorKey"
            type="button"
            @click="form.color = colorKey"
          >
            <v-icon v-if="form.color === colorKey" color="white" size="14">mdi-check</v-icon>
          </button>
        </div>

        <!-- 担当教員 -->
        <div class="field-label">担当教員</div>
        <v-text-field
          v-model="form.teacher"
          variant="outlined"
          placeholder="例：山田 太郎"
          density="compact"
          class="mb-2"
        />

        <!-- 教室 + 単位数（横並び） -->
        <div class="row-fields">
          <div class="row-field flex-grow-1">
            <div class="field-label">教室</div>
            <v-text-field
              v-model="form.room"
              variant="outlined"
              placeholder="例：A棟101"
              density="compact"
            />
          </div>
          <div class="row-field credits-field">
            <div class="field-label">単位数</div>
            <v-select
              v-model="form.credits"
              :items="[0, 1, 2, 3, 4]"
              variant="outlined"
              density="compact"
              suffix="単位"
            />
          </div>
        </div>

        <!-- 必修区分 -->
        <div class="row-fields">
          <div class="row-field" style="width: 130px">
            <div class="field-label">区分</div>
            <v-select
              v-model="form.required"
              :items="requiredItems"
              item-title="label"
              item-value="value"
              variant="outlined"
              density="compact"
            />
          </div>
        </div>

        <!-- メモ -->
        <div class="field-label">メモ</div>
        <v-textarea
          v-model="form.memo"
          variant="outlined"
          placeholder="例：出席必須, 教科書持参"
          density="compact"
          rows="2"
          class="mb-2"
        />

        <!-- ピア・アラート（編集モード時のみ表示） -->
        <PeerAlertPanel v-if="isEditing" :lecture-name="currentLectureName" />

        <!-- 楽単レビュー（編集モード時のみ表示） -->
        <LectureReviewPanel v-if="isEditing" :lecture-name="currentLectureName" />
      </v-card-text>

      <v-card-actions class="modal-actions">
        <v-btn v-if="isEditing" variant="text" color="error" @click="confirmDelete"> 削除 </v-btn>
        <v-spacer />
        <v-btn variant="text" @click="close">キャンセル</v-btn>
        <v-btn color="orange" variant="flat" :disabled="!form.name" @click="handleSave">
          保存
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 削除確認ダイアログ -->
  <v-dialog v-model="showDeleteConfirm" max-width="320">
    <v-card rounded="xl">
      <v-card-title class="confirm-title">講義を削除しますか？</v-card-title>
      <v-card-text class="confirm-body">
        「{{ currentLectureName }}」をこの時間から削除します。この操作は取り消せません。
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="showDeleteConfirm = false">キャンセル</v-btn>
        <v-btn color="error" variant="flat" @click="handleDelete">削除する</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { searchSuggestions } from '@/services/lectureIndexService'
import PeerAlertPanel from '@/components/timetable/PeerAlertPanel.vue'
import LectureReviewPanel from '@/components/timetable/LectureReviewPanel.vue'

const props = defineProps({
  modelValue: Boolean,
  selectedCell: {
    type: Object,
    default: null, // { day, period }
  },
})

const emit = defineEmits(['update:modelValue', 'saved', 'deleted'])

const store = useStore()

/** カラーパレット定義 */
const colorPalette = {
  orange: { border: '#ff9800' },
  red: { border: '#e91e63' },
  blue: { border: '#2196f3' },
  green: { border: '#4caf50' },
  purple: { border: '#9c27b0' },
  teal: { border: '#009688' },
  indigo: { border: '#3f51b5' },
  brown: { border: '#795548' },
}


/** 必修区分の選択肢 */
const requiredItems = [
  { label: '選択', value: 'elective' },
  { label: '必修', value: 'required' },
  { label: '選択必修', value: 'semi-required' },
]

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const defaultForm = () => ({
  name: '',
  teacher: '',
  room: '',
  memo: '',
  color: 'orange',
  credits: 2,
  required: 'elective',
})
const form = ref(defaultForm())
const suggestions = ref([])
const suggestLoading = ref(false)
const showDeleteConfirm = ref(false)

const currentLectureName = computed(() => {
  const raw = form.value.name
  return typeof raw === 'object' && raw !== null ? raw.name : raw
})

let searchTimer = null
const onNameSearch = (val) => {
  clearTimeout(searchTimer)
  if (!val || typeof val !== 'string' || val.length < 1) {
    suggestions.value = []
    return
  }
  suggestLoading.value = true
  searchTimer = setTimeout(async () => {
    suggestions.value = await searchSuggestions(val)
    suggestLoading.value = false
  }, 300)
}

const isEditing = computed(() => {
  if (!props.selectedCell) return false
  return !!store.getters['timetable/getLecture'](props.selectedCell.day, props.selectedCell.period)
})

const dayLabel = computed(() => {
  const labels = { mon: '月', tue: '火', wed: '水', thu: '木', fri: '金' }
  return props.selectedCell ? labels[props.selectedCell.day] || '' : ''
})

watch(
  () => props.selectedCell,
  (cell) => {
    if (!cell) return
    const existing = store.getters['timetable/getLecture'](cell.day, cell.period)
    form.value = existing
      ? {
          name: existing.name,
          teacher: existing.teacher || '',
          room: existing.room || '',
          memo: existing.memo || '',
          color: existing.color || 'orange',
          credits: existing.credits ?? 2,
          required: existing.required || 'elective',
        }
      : defaultForm()
  },
)

const handleSave = () => {
  if (!props.selectedCell || !form.value.name) return
  const name = typeof form.value.name === 'object' && form.value.name !== null
    ? form.value.name.name
    : form.value.name
  store.dispatch('timetable/saveLecture', {
    day: props.selectedCell.day,
    period: props.selectedCell.period,
    lecture: { ...form.value, name },
  })
  emit('saved', name)
  close()
}

const confirmDelete = () => {
  showDeleteConfirm.value = true
}

const handleDelete = () => {
  if (!props.selectedCell) return
  store.dispatch('timetable/removeLecture', {
    day: props.selectedCell.day,
    period: props.selectedCell.period,
  })
  showDeleteConfirm.value = false
  emit('deleted')
  close()
}

const close = () => {
  dialog.value = false
}
</script>

<style scoped>
.modal-card {
  overflow: hidden;
}

.modal-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 0;
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
}

.modal-body {
  padding: 16px 20px;
}

.field-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 4px;
}

.required {
  color: #f44336;
}

/* カラーパレット */
.color-palette {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.color-swatch {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.12s, box-shadow 0.12s;
}

.color-swatch:hover {
  transform: scale(1.15);
}

.color-swatch--selected {
  border-color: #333;
  transform: scale(1.15);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* 横並びフィールド */
.row-fields {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 4px;
}

.row-field {
  min-width: 0;
}

.credits-field {
  width: 100px;
  flex-shrink: 0;
}

.required-field {
  width: 110px;
  flex-shrink: 0;
}

.modal-actions {
  padding: 8px 16px 20px;
}

.confirm-title {
  font-size: 1rem;
  font-weight: bold;
  color: #333;
  padding: 20px 20px 8px;
}

.confirm-body {
  font-size: 0.88rem;
  color: #555;
  padding: 0 20px 12px;
}
</style>
