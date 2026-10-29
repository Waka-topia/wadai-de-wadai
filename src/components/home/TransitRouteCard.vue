<template>
  <div class="mb-3">
    <v-btn
      block
      :color="color"
      class="text-none justify-start position-relative z-10 transition-border-radius"
      height="48"
      :class="expanded ? 'rounded-t-lg rounded-b-0' : 'rounded-lg'"
      flat
      theme="dark"
      @click="toggle"
    >
      <v-icon start class="transition-transform" :class="{ 'rotate-90': expanded }">
        mdi-chevron-right
      </v-icon>
      <span class="flex-grow-1 text-left text-truncate" style="min-width: 0">{{ label }}</span>
    </v-btn>

    <div class="expand-wrapper" :class="{ expanded }">
      <div class="expand-inner bg-white border-s border-e border-b rounded-b-lg">
        <div class="pa-4">
          <div class="d-flex flex-column align-center text-center">
            <!-- 種別・行き先のバッジと発車時刻 -->
            <div class="d-flex align-center mb-1" style="max-width: 100%">
              <slot v-if="next" name="badges" :departure="next" />
              <div class="text-h6 font-weight-bold">
                {{ next ? `${next.departureTime}発` : '終了' }}
              </div>
            </div>

            <!-- 発車までのカウントダウン -->
            <div class="text-h3 font-weight-bold mb-2" :class="`text-${accentColor}`">
              <span class="text-h2">{{ next ? next.timeUntil.minutes : '--' }}</span>
              <span class="text-h6">分</span>
              <span class="text-h4 mx-1">{{ seconds }}</span>
              <span class="text-h6">秒</span>
            </div>

            <!-- その次の便 -->
            <div
              v-if="following"
              class="mt-2 py-1 px-3 bg-grey-lighten-4 rounded-pill d-inline-flex align-center"
              style="max-width: 100%"
            >
              <span class="text-caption text-grey-darken-1 mr-2">次発</span>
              <slot name="following-prefix" :departure="following" />
              <span class="text-caption font-weight-bold text-grey-darken-2 text-truncate">
                {{ following.departureTime }}発
              </span>
            </div>

            <slot v-if="next" name="extra" :departure="next" />

            <div class="mt-2 w-100 text-right">
              <v-btn
                variant="text"
                density="compact"
                color="grey"
                class="px-0"
                size="small"
                :href="timetableUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                時刻表を見る <v-icon end size="x-small">mdi-open-in-new</v-icon>
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  // 路線ボタンの背景色
  color: { type: String, required: true },
  // カウントダウンの文字色（Vuetify のカラー名）
  accentColor: { type: String, default: 'blue' },
  timetableUrl: { type: String, required: true },
  // 次の便（便が無いときは null）
  next: { type: Object, default: null },
  // その次の便（便が無いときは null）
  following: { type: Object, default: null },
})
const emit = defineEmits(['toggle'])

const expanded = ref(false)

const seconds = computed(() =>
  props.next ? String(props.next.timeUntil.seconds).padStart(2, '0') : '--',
)

const toggle = () => {
  expanded.value = !expanded.value
  emit('toggle', expanded.value)
}
</script>

<style scoped>
.expand-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  transition:
    grid-template-rows 0.3s ease-out,
    visibility 0s 0.3s,
    opacity 0.3s ease-out;
  overflow: hidden;
  visibility: hidden;
  opacity: 0;
}

.expand-wrapper.expanded {
  grid-template-rows: 1fr;
  visibility: visible;
  opacity: 1;
  transition:
    grid-template-rows 0.3s ease-out,
    visibility 0s 0s,
    opacity 0.3s ease-out;
}

.expand-inner {
  overflow: hidden;
}

.rotate-90 {
  transform: rotate(90deg);
}

.transition-transform {
  transition: transform 0.2s ease;
}

.transition-border-radius {
  transition:
    border-radius 0.3s ease-out,
    background-color 0.2s !important;
}

.z-10 {
  z-index: 10;
}
</style>
