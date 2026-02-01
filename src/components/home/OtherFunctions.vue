<template>
  <div class="mb-6">
    <div class="d-flex align-center justify-space-between mb-2">
      <div class="d-flex align-center">
        <span class="font-weight-bold">その他の機能</span>
      </div>
      <router-link
        to="/functions"
        class="text-decoration-none text-orange d-flex align-center text-body-2"
      >
        機能一覧
        <v-icon size="small">mdi-chevron-right</v-icon>
      </router-link>
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
  </div>
</template>

<script setup>
import { ref } from 'vue'

const features = ref([
  {
    label: 'Moodle',
    icon: 'mdi-school',
    color: 'orange',
    url: 'https://moodle.wakayama-u.ac.jp/',
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
    label: 'マップ',
    icon: 'mdi-map-marker-radius-outline',
    color: 'grey',
    url: null, // 将来的に内部リンクなど
  },
])

const openLink = (item) => {
  if (item.url) {
    window.open(item.url, '_blank')
  }
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
</style>
