<template>
  <div class="mb-6">
    <div class="d-flex align-center justify-space-between mb-2">
      <div class="d-flex align-center">
        <span class="font-weight-bold">その他の機能</span>
      </div>
    </div>

    <!-- Features Grid -->
    <v-card flat class="rounded-xl pa-4 mb-4">
      <v-row dense>
        <v-col
          v-for="(item, i) in features"
          :key="i"
          cols="3"
          class="text-center clickable-icon"
          @click="openLink(item)"
        >
          <div class="d-flex flex-column align-center">
            <v-btn icon variant="text" :color="item.color" class="mb-1" size="small">
              <v-icon size="large">{{ item.icon }}</v-icon>
            </v-btn>
            <span class="text-caption font-weight-bold truncate-text">{{ item.label }}</span>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <!-- Campus Map Section -->
    <v-card v-if="showMapSection" flat class="rounded-xl pa-4">
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="d-flex align-center">
          <v-icon color="grey" class="mr-2">mdi-map-marker-radius-outline</v-icon>
          <span class="font-weight-bold">キャンパスマップ</span>
        </div>
      </div>

      <div class="map-preview mb-3">
        <div class="map-placeholder">
          <v-icon size="64" color="grey-lighten-1">mdi-map</v-icon>
          <p class="text-caption text-grey mt-2">和歌山大学キャンパスマップ</p>
        </div>
      </div>

      <v-btn block color="orange" variant="flat" prepend-icon="mdi-map-search" @click="goToMap">
        マップ全体を見る
      </v-btn>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'

const router = useRouter()
const showMapSection = ref(false) // マップセクションの表示状態

const features = ref([
  {
    label: 'Moodle',
    icon: 'mdi-school',
    color: 'orange',
    url: 'https://moodle.wakayama-u.ac.jp/',
  },
  {
    label: 'シラバス',
    icon: 'mdi-book-open-variant',
    color: 'deep-purple',
    url: 'https://web.wakayama-u.ac.jp/syllabus/',
  },
  {
    label: '教育サポート',
    icon: 'mdi-cube',
    color: 'blue',
    url: 'https://kmags.wakayama-u.ac.jp/campusweb/',
  },
  {
    label: '大学HP',
    icon: 'mdi-web',
    color: 'green',
    url: 'https://www.wakayama-u.ac.jp/',
  },
  {
    label: 'グループ',
    icon: 'mdi-sofa-outline',
    color: 'grey',
    url: 'https://web.wakayama-u.ac.jp/lib/grouproom/',
  },
  {
    label: 'セミナー',
    icon: 'mdi-sofa-outline',
    color: 'grey',
    url: 'http://web.wakayama-u.ac.jp/lib/seminar/',
  },
])

/**
 * リンクまたはマップセクションを開く
 *
 * @param {object} item - 機能アイテム
 */
const openLink = (item) => {
  if (item.isMap) {
    void logFirebaseAnalyticsEvent('home_other_functions_map_toggle', {
      visible: !showMapSection.value,
    })
    // マップアイコンをクリックした場合、マップセクションを表示/非表示
    showMapSection.value = !showMapSection.value
  } else if (item.url) {
    void logFirebaseAnalyticsEvent('home_other_functions_external_link', { label: item.label })
    window.open(item.url, '_blank')
  }
}

/** マップページに遷移 */
const goToMap = () => {
  void logFirebaseAnalyticsEvent('home_other_functions_go_map', {})
  router.push('/map')
}
</script>

<style scoped>
.clickable-icon {
  transition: opacity 0.2s;
  cursor: pointer;
}
.clickable-icon:active {
  opacity: 0.7;
}

.truncate-text {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.map-preview {
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
}

.map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}
</style>
