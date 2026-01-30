<template>
  <div class="mb-6">
    <div class="d-flex align-center justify-space-between mb-2">
      <div class="d-flex align-center">
        <span class="font-weight-bold">その他の機能</span>
      </div>
      <router-link to="/functions" class="text-decoration-none text-orange d-flex align-center text-body-2">
        機能一覧
        <v-icon size="small">mdi-chevron-right</v-icon>
      </router-link>
    </div>

    <!-- Features Grid -->
    <v-card flat class="rounded-xl pa-4 mb-4">
      <v-row dense>
        <v-col v-for="(item, i) in features" :key="i" cols="3" class="text-center clickable-icon" @click="openLink(item)">
          <div class="d-flex flex-column align-center">
            <v-btn icon variant="text" :color="item.color" class="mb-1" size="small">
                <v-icon size="large">{{ item.icon }}</v-icon>
            </v-btn>
            <span class="text-caption font-weight-bold truncate-text">{{ item.label }}</span>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <!-- Wakayama Match Teaser (Premium Design) -->
    <v-card
      class="rounded-xl overflow-hidden position-relative teaser-card"
      elevation="2"
      color="pink-accent-1"
    >
        <!-- Background Gradient/Pattern Overlay -->
        <div class="teaser-bg"></div>

        <div class="d-flex align-center justify-space-between px-4 py-3 position-relative z-index-1">
            <div class="d-flex align-center">
                <div class="mr-3 glass-icon-container">
                    <v-icon color="white" size="large">mdi-heart-multiple</v-icon>
                </div>
                <div>
                    <div class="text-subtitle-2 font-weight-bold text-white mb-0">ワカヤママッチ</div>
                    <div class="text-caption text-white opacity-90">和大生限定の友達づくりサービス</div>
                </div>
            </div>

            <v-chip
                size="x-small"
                color="white"
                variant="flat"
                class="font-weight-bold text-pink-accent-3"
            >
                COMING SOON
            </v-chip>
        </div>
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
        url: 'https://moodle.wakayama-u.ac.jp/'
    },
    {
        label: '教育サポート',
        icon: 'mdi-cube',
        color: 'blue',
        url: 'https://kmags.wakayama-u.ac.jp/campusweb/'
    },
    {
        label: '大学HP',
        icon: 'mdi-web',
        color: 'green',
        url: 'https://www.wakayama-u.ac.jp/'
    },
    {
        label: 'マップ',
        icon: 'mdi-map-marker-radius-outline',
        color: 'grey',
        url: null // 将来的に内部リンクなど
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

/* Premium Teaser Styles */
.teaser-card {
    background: linear-gradient(135deg, #FF4081 0%, #F50057 100%);
}

.teaser-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
        radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 20%),
        radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.2) 0%, transparent 25%);
}

.glass-icon-container {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.z-index-1 {
    z-index: 1;
}
</style>
