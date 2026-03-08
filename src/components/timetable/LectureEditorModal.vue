<template>
  <v-dialog v-model="dialog" max-width="480" persistent>
    <v-card class="modal-card" rounded="xl">
      <v-card-title class="modal-title">
        <span>{{ selectedCell ? `${dayLabel} ${selectedCell.period}限` : '講義を登録' }}</span>
        <v-btn icon variant="text" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="modal-body">
        <!-- 講義名 -->
        <div class="field-label">講義名 <span class="required">*</span></div>
        <v-text-field
          v-model="form.name"
          variant="outlined"
          placeholder="例：基礎プログラミング"
          density="compact"
          :rules="[v => !!v || '講義名を入力してください']"
          class="mb-3"
        />

        <!-- 担当教員 -->
        <div class="field-label">担当教員</div>
        <v-text-field
          v-model="form.teacher"
          variant="outlined"
          placeholder="例：山田 太郎"
          density="compact"
          class="mb-3"
        />

        <!-- 教室 -->
        <div class="field-label">教室</div>
        <v-text-field
          v-model="form.room"
          variant="outlined"
          placeholder="例：A棟101"
          density="compact"
          class="mb-3"
        />

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
      </v-card-text>

      <v-card-actions class="modal-actions">
        <v-btn
          v-if="isEditing"
          variant="text"
          color="error"
          @click="handleDelete"
        >
          削除
        </v-btn>
        <v-spacer />
        <v-btn variant="text" @click="close">キャンセル</v-btn>
        <v-btn
          color="orange"
          variant="flat"
          :disabled="!form.name"
          @click="handleSave"
        >
          保存
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'

const props = defineProps({
  modelValue: Boolean,
  selectedCell: {
    type: Object,
    default: null, // { day, period }
  },
})

const emit = defineEmits(['update:modelValue'])

const store = useStore()

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const form = ref({ name: '', teacher: '', room: '', memo: '' })

// 既存の講義があれば編集モード
const isEditing = computed(() => {
  if (!props.selectedCell) return false
  return !!store.getters['timetable/getLecture'](props.selectedCell.day, props.selectedCell.period)
})

const dayLabel = computed(() => {
  const labels = { mon: '月', tue: '火', wed: '水', thu: '木', fri: '金' }
  return props.selectedCell ? labels[props.selectedCell.day] || '' : ''
})

// セルが変わったらフォームをリセット or 既存データをロード
watch(
  () => props.selectedCell,
  (cell) => {
    if (!cell) return
    const existing = store.getters['timetable/getLecture'](cell.day, cell.period)
    form.value = existing
      ? { name: existing.name, teacher: existing.teacher || '', room: existing.room || '', memo: existing.memo || '' }
      : { name: '', teacher: '', room: '', memo: '' }
  },
)

const handleSave = () => {
  if (!props.selectedCell || !form.value.name) return
  store.dispatch('timetable/saveLecture', {
    day: props.selectedCell.day,
    period: props.selectedCell.period,
    lecture: { ...form.value },
  })
  close()
}

const handleDelete = () => {
  if (!props.selectedCell) return
  store.dispatch('timetable/removeLecture', {
    day: props.selectedCell.day,
    period: props.selectedCell.period,
  })
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

.modal-actions {
  padding: 8px 16px 20px;
}
</style>
