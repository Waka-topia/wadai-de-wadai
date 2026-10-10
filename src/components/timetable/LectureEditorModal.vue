<template>
  <FormFieldDefaults>
    <v-form id="lecture-form" class="pa-4 editor-form" @submit.prevent="onSubmit">
      <div class="mb-4">
        <v-select
          v-model="quarterSelectValue"
          :items="quarterSelectOptions"
          item-title="title"
          item-value="value"
          label="履修期間"
          :rules="[required]"
        />
      </div>

      <div class="mb-4">
        <v-select
          v-model="form.day"
          :items="dayOptions"
          item-title="title"
          item-value="value"
          label="曜日"
          :rules="[required]"
        />
      </div>

      <div class="mb-4">
        <v-select
          v-model="form.periods"
          :items="[1, 2, 3, 4, 5, 6]"
          multiple
          chips
          closable-chips
          label="時限（複数選択で連続コマ）"
          :rules="[required]"
        />
      </div>

      <v-text-field
        v-model="form.name"
        :rules="[required]"
        class="mb-2"
        label="講義名"
        hint="検索せずに直接追加する場合は講義名を入力してください"
        placeholder="例：基礎プログラミング"
      />

      <v-text-field
        v-model="form.teacher"
        class="mb-2"
        :rules="[required]"
        label="担当教員"
        placeholder="例：山田 太郎"
      />

      <v-row class="mb-1" dense>
        <v-col cols="8"
          ><v-text-field
            v-model="form.room"
            :rules="[required]"
            label="教室"
            placeholder="例：A棟101"
        /></v-col>
        <v-col cols="4"
          ><v-select
            v-model="form.credits"
            :items="[0, 1, 2, 3, 4]"
            :rules="[required]"
            label="単位数"
        /></v-col>
      </v-row>
      <v-row class="mb-1" dense>
        <v-col cols="12"
          ><v-select
            v-model="form.required"
            :items="requiredItems"
            :rules="[required]"
            item-title="label"
            item-value="value"
            label="区分"
        /></v-col>
        <v-col cols="12"
          ><v-select
            v-model="form.creditStatus"
            :items="creditStatusItems"
            :rules="[required]"
            item-title="label"
            item-value="value"
            label="単位取得状況"
        /></v-col>
      </v-row>

      <v-textarea
        v-model="form.memo"
        auto-grow
        label="メモ"
        placeholder="例：出席必須, 教科書持参"
        rows="2"
      />

      <div class="d-flex align-center justify-space-between mb-2">
        <span class="text-caption font-weight-bold text-grey-darken-1">カラー</span
        ><v-chip size="x-small" variant="tonal">{{ form.color }}</v-chip>
      </div>
      <v-item-group v-model="form.color" class="mb-4 d-flex flex-wrap ga-2" mandatory>
        <v-item
          v-for="(colorDef, colorKey) in lectureColorPalette"
          v-slot="{ isSelected, toggle }"
          :key="colorKey"
          :value="colorKey"
        >
          <v-btn
            :aria-label="`${colorKey} を選択`"
            :class="{ 'color-choice--selected': isSelected }"
            :color="colorDef.border"
            :variant="isSelected ? 'flat' : 'tonal'"
            density="comfortable"
            icon
            size="small"
            @click="toggle"
          >
            <v-icon :icon="isSelected ? 'mdi-check' : 'mdi-palette'" color="white" size="14" />
          </v-btn>
        </v-item>
      </v-item-group>

      <LectureReviewPanel v-if="currentLectureName" :lecture-name="currentLectureName" />

      <!-- 保存ボタン -->
      <v-btn
        color="orange"
        variant="flat"
        class="font-weight-bold text-white mt-3"
        type="submit"
        form="lecture-form"
        block
        rounded="pill"
        :disabled="!canSubmit"
        >この講義を保存する</v-btn
      >

      <!-- 削除ボタン -->
      <BaseDialog
        v-if="isExistingLecture"
        v-model="showDeleteConfirm"
        :title="`${currentLectureName}を削除しますか？`"
        :message="`「${currentLectureName}」をこの時間から削除します。この操作は取り消せません。`"
        :confirm-label="`削除する`"
        :confirm-color="`error`"
        @confirm="handleDelete"
      >
        <template #activator="{ props: activatorProps }">
          <v-btn
            v-bind="activatorProps"
            class="mt-3 font-weight-bold"
            color="red-lighten-1"
            rounded="pill"
            block
            >この講義を削除する</v-btn
          >
        </template>
      </BaseDialog>
    </v-form>
  </FormFieldDefaults>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { lectureColorPalette, weekdays } from '@/config/timetable'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { required } from '@/utils/forms/validate'
import LectureReviewPanel from '@/components/timetable/LectureReviewPanel.vue'
import BaseDialog from '@/components/common/BaseDialog.vue'
import FormFieldDefaults from '@/components/common/FormFieldDefaults.vue'

const props = defineProps({
  selectedCell: { type: Object, default: null }, // { day, period, lectureId }
  prefillName: { type: String, default: '' },
})
const emit = defineEmits(['save', 'delete'])
const store = useStore()

const currentSemester = computed(() => store.getters['timetable/semester'])
// 現在表示されているクォーター（'all', '1Q', '2Q', '3Q', '4Q'）を取得
const currentDisplayQuarter = computed(() => store.state.timetable.displayQuarter)

const availableQuarters = computed(() =>
  currentSemester.value === 'second' ? ['3Q', '4Q'] : ['1Q', '2Q'],
)

const quarterSelectOptions = computed(() => {
  if (currentSemester.value === 'second') {
    return [
      { title: '3Q', value: '3Q' },
      { title: '4Q', value: '4Q' },
      { title: '後期（3Q・4Q）', value: '3Q,4Q' },
    ]
  } else {
    return [
      { title: '1Q', value: '1Q' },
      { title: '2Q', value: '2Q' },
      { title: '前期（1Q・2Q）', value: '1Q,2Q' },
    ]
  }
})

const quarterSelectValue = computed({
  get() {
    return (form.value.quarters ?? []).join(',')
  },
  set(val) {
    form.value.quarters = val ? val.split(',') : [...availableQuarters.value]
  },
})

const requiredItems = [
  { label: '必修', value: 'req' },
  { label: '選択必修', value: 'semi' },
  { label: 'その他', value: 'none' },
]
const creditStatusItems = [
  { label: '履修中・未定', value: 'taking' },
  { label: '取得済', value: 'earned' },
  { label: '落単', value: 'failed' },
]

const form = ref({
  id: null,
  name: '',
  originalName: '',
  color: 'orange',
  room: '',
  memo: '',
  teacher: '',
  credits: 2,
  required: 'none',
  creditStatus: 'taking',
  isFromSyllabus: false,
  quarters: [],
  periods: [],
  day: null,
})

const resetForm = () => {
  // もしカレンダーが「1Qのみ」などの特定クォーター表示になっていれば、それだけをデフォルトにする
  // 「半期全体('all')」の場合は、学期の全クォーター（['1Q', '2Q']など）をデフォルトにする
  const defaultQuarters =
    currentDisplayQuarter.value !== 'all' && currentDisplayQuarter.value
      ? [currentDisplayQuarter.value]
      : [...availableQuarters.value]

  form.value = {
    id: null,
    name: props.prefillName || '',
    originalName: props.prefillName || '',
    color: 'orange',
    room: '',
    memo: '',
    teacher: '',
    credits: 2,
    required: 'none',
    creditStatus: 'taking',
    isFromSyllabus: false,
    quarters: defaultQuarters,
    // シラバス検索から開くとセル未指定（period: null）のことがあるため、null を初期値に入れない
    periods: props.selectedCell?.period ? [props.selectedCell.period] : [],
    day: props.selectedCell?.day || null,
  }
}

const showDeleteConfirm = ref(false)

const currentLectureName = computed(() =>
  typeof form.value.name === 'object' && form.value.name !== null
    ? form.value.name.name
    : form.value.name,
)

// 既存講義の判定は「編集用IDを持っているか」で行う
const isExistingLecture = computed(() => !!form.value.id)
const dayOptions = weekdays.map(({ value, label }) => ({ title: `${label}曜日`, value }))

watch(
  () => props.selectedCell,
  (cell) => {
    if (!cell) return

    // 配列化された授業データを取得
    const lectures = store.getters['timetable/getLectures'](cell.day, cell.period) || []
    let lecture = null

    if (cell.lectureId) {
      // クリックされたカードのIDで特定
      lecture = lectures.find((l) => l.id === cell.lectureId)
    }

    if (lecture) {
      form.value = {
        id: lecture.id,
        name: lecture.name || '',
        originalName: lecture.originalName || lecture.name || '',
        color: lecture.color || 'orange',
        room: lecture.room || '',
        memo: lecture.memo || '',
        teacher: lecture.teacher || '',
        credits: lecture.credits !== undefined ? lecture.credits : 2,
        required: lecture.required || 'none',
        creditStatus: lecture.creditStatus || 'taking',
        isFromSyllabus: !!lecture.isFromSyllabus,
        quarters:
          lecture.quarters && lecture.quarters.length
            ? lecture.quarters
            : [...availableQuarters.value],
        periods: lecture.periods && lecture.periods.length ? lecture.periods : [cell.period],
        day: cell.day,
      }
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

const onSubmit = async (validationPromise) => {
  const { valid } = await validationPromise
  if (!valid) throw new Error('入力に誤りがあります。')
  executeFinalSave()
}

const executeFinalSave = () => {
  const name = typeof form.value.name === 'object' ? form.value.name.name : form.value.name
  void logFirebaseAnalyticsEvent('lecture_editor_save', {
    day: form.value.day,
    periods: form.value.periods,
    isExisting: isExistingLecture.value,
  })
  emit('save', {
    day: form.value.day,
    periods: form.value.periods,
    lecture: { ...form.value, name, originalName: form.value.originalName || name },
  })
}

const handleDelete = () => {
  if (!props.selectedCell) return
  void logFirebaseAnalyticsEvent('lecture_editor_delete', {
    day: form.value.day,
    periods: form.value.periods,
  })
  showDeleteConfirm.value = false
  emit('delete', {
    day: form.value.day,
    periods: form.value.periods,
    lectureId: form.value.id,
  })
}

const isFormValid = computed(() => {
  return Boolean(
    quarterSelectValue.value &&
    form.value.day &&
    form.value.periods.length > 0 &&
    form.value.name &&
    form.value.teacher &&
    form.value.room,
  )
})

const isChanged = computed(() => {
  if (!isExistingLecture.value) return true

  const originalLecture = store.getters['timetable/getLectures'](
    props.selectedCell?.day,
    props.selectedCell?.period,
  )?.find((l) => l.id === form.value.id)

  if (!originalLecture) return true

  return (
    JSON.stringify({
      name: form.value.name,
      teacher: form.value.teacher,
      room: form.value.room,
      memo: form.value.memo,
      day: form.value.day,
      periods: form.value.periods,
      quarters: form.value.quarters,
      color: form.value.color,
      credits: form.value.credits,
      required: form.value.required,
      creditStatus: form.value.creditStatus,
    }) !==
    JSON.stringify({
      name: originalLecture.name || '',
      teacher: originalLecture.teacher || '',
      room: originalLecture.room || '',
      memo: originalLecture.memo || '',
      day: props.selectedCell?.day || null,
      periods: originalLecture.periods || [],
      quarters: originalLecture.quarters || [],
      color: originalLecture.color || 'orange',
      credits: originalLecture.credits ?? 2,
      required: originalLecture.required || 'none',
      creditStatus: originalLecture.creditStatus || 'taking',
    })
  )
})

const canSubmit = computed(() => {
  if (isExistingLecture.value) {
    return isFormValid.value && isChanged.value
  }

  return isFormValid.value
})
</script>

<style scoped>
.editor-form {
  display: flex;
  flex-direction: column;
}
.color-choice--selected {
  box-shadow:
    0 0 0 2px #fff,
    0 0 0 4px rgba(255, 152, 0, 0.8);
}
.modal-actions {
  padding: 8px 16px 12px;
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
