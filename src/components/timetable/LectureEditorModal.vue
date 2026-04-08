<template>
  <v-dialog v-model="dialog" max-width="480" persistent scrollable>
    <v-card class="modal-card" rounded="xl" height="65vh" min-height="480" max-height="600">
      <v-card-title class="modal-title">
        <span>{{ selectedCell ? `${dayLabel} ${displayPeriods}限` : '講義を登録' }}</span>
        <v-btn icon variant="text" @click="close"><v-icon>mdi-close</v-icon></v-btn>
      </v-card-title>

      <template v-if="!isEditMode && isExistingLecture">
        <v-card-text class="modal-body detail-view">
          <div class="detail-header-block mb-4">
            <div class="detail-course-name">{{ form.name }}</div>
            <div class="detail-tags mt-2">
              <v-chip
                size="small"
                :color="colorPalette[form.color]?.border || 'orange'"
                class="mr-2"
                variant="flat"
                text-color="white"
                >{{ requiredLabel }}</v-chip
              >
              <v-chip size="small" variant="tonal" class="mr-2">{{
                form.quarters && form.quarters.length ? form.quarters.join(', ') : '未設定'
              }}</v-chip>
              <v-chip size="small" variant="tonal" class="mr-2">{{ form.credits }}単位</v-chip>
            </div>
          </div>

          <div v-show="!isSyllabusExpanded">
            <v-list density="compact" class="detail-info-list mb-4" bg-color="transparent">
              <v-list-item>
                <template #prepend
                  ><v-icon color="grey-darken-1" size="20" class="mr-3"
                    >mdi-account</v-icon
                  ></template
                >
                <v-list-item-title class="text-body-2">{{
                  form.teacher || '未設定'
                }}</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <template #prepend
                  ><v-icon color="grey-darken-1" size="20" class="mr-3"
                    >mdi-map-marker</v-icon
                  ></template
                >
                <v-list-item-title class="text-body-2">{{
                  form.room || '未設定'
                }}</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <template #prepend
                  ><v-icon color="grey-darken-1" size="20" class="mr-3"
                    >mdi-school-outline</v-icon
                  ></template
                >
                <v-list-item-title class="text-body-2 d-flex align-center">
                  取得状況：<v-chip
                    size="x-small"
                    :variant="form.creditStatus === 'taking' ? 'tonal' : 'flat'"
                    :color="creditStatusColor"
                    class="ml-2 font-weight-bold"
                    >{{ creditStatusLabel }}</v-chip
                  >
                </v-list-item-title>
              </v-list-item>
              <v-list-item v-if="form.memo">
                <template #prepend
                  ><v-icon color="grey-darken-1" size="20" class="mr-3"
                    >mdi-note-text</v-icon
                  ></template
                >
                <v-list-item-title class="text-body-2" style="white-space: pre-wrap">{{
                  form.memo
                }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </div>

          <LectureSyllabusPanel
            v-if="selectedLectureName"
            class="mt-0"
            :lecture-name="form.originalName || selectedLectureName"
            :is-private="!form.isFromSyllabus"
            :default-expanded="isSyllabusExpanded"
            @update:expanded="isSyllabusExpanded = $event"
            @linked="handleSyllabusLinked"
          />
        </v-card-text>
        <v-card-actions v-show="!isSyllabusExpanded" class="modal-actions">
          <v-btn variant="text" color="error" @click="confirmDelete">削除</v-btn>
          <v-spacer />
          <v-btn color="orange" variant="flat" @click="isEditMode = true"> 編集する </v-btn>
        </v-card-actions>
      </template>

      <template v-else>
        <v-card-text class="modal-body">
          <v-alert
            v-if="!isExistingLecture"
            color="teal-lighten-5"
            border="start"
            border-color="teal"
            class="mb-4 pb-2 pt-3 px-3"
            density="compact"
          >
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption font-weight-bold text-teal-darken-3">
                  📚 みんなのシラバスから探す
                </div>
                <div class="text-teal-darken-1" style="font-size: 0.65rem">
                  楽単度や過去のレビューが見れます！
                </div>
              </div>
              <v-btn
                color="teal"
                variant="flat"
                size="small"
                class="font-weight-bold px-3"
                @click="jumpToSyllabusSearch"
                >検索する</v-btn
              >
            </div>
          </v-alert>

          <v-form class="editor-form" @submit.prevent="onSubmit">
            <div class="mb-4">
              <div class="text-caption font-weight-bold text-grey-darken-1 mb-1">
                履修期間（複数選択可）*
              </div>
              <v-btn-toggle
                v-model="form.quarters"
                multiple
                mandatory
                color="orange"
                variant="outlined"
                density="comfortable"
                class="w-100 d-flex"
              >
                <v-btn v-for="q in availableQuarters" :key="q" :value="q" class="flex-grow-1">{{
                  q
                }}</v-btn>
              </v-btn-toggle>
            </div>

            <div class="mb-4">
              <v-select
                v-model="form.periods"
                :items="[1, 2, 3, 4, 5, 6]"
                multiple
                chips
                closable-chips
                label="時限（複数選択で連続コマ）*"
                variant="outlined"
                density="comfortable"
                :rules="[(v) => v.length > 0 || '時限を選択してください']"
              >
                <template #prepend
                  ><v-chip color="orange" variant="flat" class="mt-1 font-weight-bold"
                    >{{ dayLabel }}曜日</v-chip
                  ></template
                >
              </v-select>
            </div>

            <v-text-field
              v-model="form.name"
              :rules="[required]"
              class="mb-2"
              density="comfortable"
              label="講義名 *"
              placeholder="例：基礎プログラミング"
              variant="outlined"
            >
              <template v-if="!isExistingLecture" #details
                ><div class="text-caption text-grey" style="font-size: 0.72rem">
                  ※検索せずに直接追加する場合は講義名を入力してください
                </div></template
              >
            </v-text-field>

            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-caption font-weight-bold text-grey-darken-1">カラー</span
              ><v-chip size="x-small" variant="tonal">{{ form.color }}</v-chip>
            </div>
            <v-item-group v-model="form.color" class="mb-4 d-flex flex-wrap ga-2" mandatory>
              <v-item
                v-for="(colorDef, colorKey) in colorPalette"
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
                  <v-icon
                    :icon="isSelected ? 'mdi-check' : 'mdi-palette'"
                    color="white"
                    size="14"
                  />
                </v-btn>
              </v-item>
            </v-item-group>

            <v-text-field
              v-model="form.teacher"
              class="mb-2"
              :rules="[required]"
              density="comfortable"
              label="担当教員"
              placeholder="例：山田 太郎"
              variant="outlined"
            />

            <v-row class="mb-1" dense>
              <v-col cols="8"
                ><v-text-field
                  v-model="form.room"
                  :rules="[required]"
                  density="comfortable"
                  label="教室"
                  placeholder="例：A棟101"
                  variant="outlined"
              /></v-col>
              <v-col cols="4"
                ><v-select
                  v-model="form.credits"
                  :items="[0, 1, 2, 3, 4]"
                  :rules="[required]"
                  density="comfortable"
                  label="単位数"
                  variant="outlined"
              /></v-col>
            </v-row>
            <v-row class="mb-1" dense>
              <v-col cols="12"
                ><v-select
                  v-model="form.required"
                  :items="requiredItems"
                  :rules="[required]"
                  density="comfortable"
                  item-title="label"
                  item-value="value"
                  label="区分"
                  variant="outlined"
              /></v-col>
              <v-col cols="12"
                ><v-select
                  v-model="form.creditStatus"
                  :items="creditStatusItems"
                  :rules="[required]"
                  density="comfortable"
                  item-title="label"
                  item-value="value"
                  label="単位取得状況"
                  variant="outlined"
              /></v-col>
            </v-row>

            <v-textarea
              v-model="form.memo"
              auto-grow
              density="comfortable"
              label="メモ"
              placeholder="例：出席必須, 教科書持参"
              rows="2"
              variant="outlined"
            />
            <v-card-actions class="modal-actions">
              <v-spacer />
              <v-btn variant="text" @click="isExistingLecture ? (isEditMode = false) : close()"
                >キャンセル</v-btn
              >
              <v-btn color="orange" variant="flat" type="submit"> 保存 </v-btn>
            </v-card-actions>
          </v-form>

          <LectureReviewPanel
            v-if="currentLectureName && !isEditMode"
            :lecture-name="currentLectureName"
          />
        </v-card-text>
      </template>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showDeleteConfirm" max-width="320">
    <v-card rounded="xl">
      <v-card-title class="confirm-title">講義を削除しますか？</v-card-title>
      <v-card-text class="confirm-body"
        >「{{
          currentLectureName
        }}」をこの時間から削除します。この操作は取り消せません。</v-card-text
      >
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
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { required } from '@/utils/forms/validate'
import LectureSyllabusPanel from '@/components/timetable/LectureSyllabusPanel.vue'
import LectureReviewPanel from '@/components/timetable/LectureReviewPanel.vue'

const props = defineProps({
  modelValue: Boolean,
  selectedCell: { type: Object, default: null }, // { day, period, lectureId }
})

const emit = defineEmits(['update:modelValue', 'saved', 'deleted'])
const store = useStore()
const router = useRouter()

const currentSemester = computed(() => store.getters['timetable/semester'])
// 現在表示されているクォーター（'all', '1Q', '2Q', '3Q', '4Q'）を取得
const currentDisplayQuarter = computed(() => store.state.timetable.displayQuarter)

const availableQuarters = computed(() =>
  currentSemester.value === 'second' ? ['3Q', '4Q'] : ['1Q', '2Q'],
)

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

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
    quarters: defaultQuarters,
    periods: props.selectedCell ? [props.selectedCell.period] : [],
  }
}

const isEditMode = ref(false)
const isSyllabusExpanded = ref(false)
const showDeleteConfirm = ref(false)

const jumpToSyllabusSearch = () => {
  if (!props.selectedCell) return
  void logFirebaseAnalyticsEvent('lecture_editor_syllabus_search_jump', {
    day: props.selectedCell.day,
    period: props.selectedCell.period,
  })
  emit('update:modelValue', false)
  router.push({
    path: '/syllabus-search',
    state: { targetDay: props.selectedCell.day, targetPeriod: props.selectedCell.period },
  })
}

const currentLectureName = computed(() =>
  typeof form.value.name === 'object' && form.value.name !== null
    ? form.value.name.name
    : form.value.name,
)
const selectedLectureName = computed(() => currentLectureName.value)
const requiredLabel = computed(() => {
  const item = requiredItems.find((i) => i.value === form.value.required)
  return item ? item.label : 'その他'
})
const creditStatusLabel = computed(() => {
  const item = creditStatusItems.find((i) => i.value === form.value.creditStatus)
  return item ? item.label : '履修中・未定'
})
const creditStatusColor = computed(() =>
  form.value.creditStatus === 'earned'
    ? 'teal'
    : form.value.creditStatus === 'failed'
      ? 'error'
      : 'grey',
)

// 既存講義の判定は「編集用IDを持っているか」で行う
const isExistingLecture = computed(() => !!form.value.id)
const dayLabel = computed(() => {
  const labels = { mon: '月', tue: '火', wed: '水', thu: '木', fri: '金' }
  return props.selectedCell ? labels[props.selectedCell.day] || '' : ''
})
const displayPeriods = computed(() =>
  form.value.periods && form.value.periods.length > 0
    ? [...form.value.periods].sort((a, b) => a - b).join(', ')
    : props.selectedCell?.period || '',
)

watch(
  () => props.selectedCell,
  (cell) => {
    if (!cell) {
      isEditMode.value = true
      return
    }

    // 配列化された授業データを取得
    const lectures = store.getters['timetable/getLectures'](cell.day, cell.period) || []
    let lecture = null

    if (cell.lectureId) {
      // クリックされたカードのIDで特定
      lecture = lectures.find((l) => l.id === cell.lectureId)
    }

    isEditMode.value = !lecture
    isSyllabusExpanded.value = false

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
      }
    } else {
      resetForm()
    }
  },
)

const onSubmit = async (validationPromise) => {
  const { valid } = await validationPromise
  if (!valid) throw new Error('入力に誤りがあります。')
  executeFinalSave()
}

const executeFinalSave = () => {
  const name = typeof form.value.name === 'object' ? form.value.name.name : form.value.name
  void logFirebaseAnalyticsEvent('lecture_editor_save', {
    day: props.selectedCell?.day,
    periods: form.value.periods,
    isExisting: isExistingLecture.value,
  })

  store.dispatch('timetable/saveLecture', {
    day: props.selectedCell.day,
    periods: form.value.periods,
    lecture: { ...form.value, name, originalName: form.value.originalName || name },
  })
  emit('saved', name)
  close()
}

const handleSyllabusLinked = (masterName) => {
  form.value.originalName = masterName
  form.value.isFromSyllabus = true
  executeFinalSave()
}

const confirmDelete = () => (showDeleteConfirm.value = true)

const handleDelete = () => {
  if (!props.selectedCell) return
  void logFirebaseAnalyticsEvent('lecture_editor_delete', {
    day: props.selectedCell.day,
    periods: form.value.periods,
  })

  // 対象のIDを持つ授業だけを削除する
  store.dispatch('timetable/removeLecture', {
    day: props.selectedCell.day,
    periods: form.value.periods,
    lectureId: form.value.id,
  })
  showDeleteConfirm.value = false
  emit('deleted')
  close()
}

const close = () => (dialog.value = false)
</script>

<style scoped>
.modal-card {
  overflow: hidden;
  display: flex !important;
  flex-direction: column !important;
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
  overflow-x: hidden;
  flex: 1 1 auto;
  overflow-y: auto;
  scrollbar-gutter: stable;
}
.editor-form {
  display: flex;
  flex-direction: column;
}
.detail-course-name {
  font-size: 1.4rem;
  font-weight: bold;
  color: #333;
  line-height: 1.4;
}
.detail-tags {
  display: flex;
  align-items: center;
}
.detail-info-list {
  background: transparent !important;
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
