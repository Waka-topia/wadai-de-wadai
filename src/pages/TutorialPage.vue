<template>
  <div class="tutorial-container">
    <div class="tutorial-slider m-7 overflow-hidden rounded-lg">
      <div
        class="slider-track d-flex transition-transform"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <img src="@/assets/tutorial/1.webp" alt="tutorial 1" class="slider-img" />
        <img src="@/assets/tutorial/2.webp" alt="tutorial 2" class="slider-img" />
        <img src="@/assets/tutorial/6.webp" alt="tutorial 3" class="slider-img" />
        <img src="@/assets/tutorial/7.webp" alt="tutorial 4" class="slider-img" />
      </div>
    </div>

    <div class="floating-nav-container">
      <v-btn
        color="white"
        class="text-blue-darken-2 font-weight-bold back-btn"
        elevation="2"
        rounded="pill"
        size="large"
        :prepend-icon="isFirstSlide ? 'mdi-close' : 'mdi-chevron-left'"
        @click="handleBack"
      >
        {{ isFirstSlide ? '閉じる' : '戻る' }}
      </v-btn>

      <v-btn
        color="blue-darken-2"
        class="text-white font-weight-bold next-btn"
        elevation="2"
        rounded="pill"
        size="large"
        :append-icon="isLastSlide ? 'mdi-check' : 'mdi-chevron-right'"
        @click="handleNext"
      >
        {{ isLastSlide ? '完了する' : '次へ' }}
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentIndex = ref(0)
const totalImages = 4

// 状態を判定する算出プロパティ
const isFirstSlide = computed(() => currentIndex.value === 0)
const isLastSlide = computed(() => currentIndex.value === totalImages - 1)

/**
 * Handle back button click: slide back or exit tutorial
 *
 * @returns {void}
 */
const handleBack = () => {
  if (currentIndex.value > 0) {
    // 2枚目以降なら前の画像に戻る
    currentIndex.value--
  } else {
    // 1枚目ならマイページ（または前の画面）に戻る
    void router.push('/mypage')
  }
}

/**
 * Handle next button click: slide forward or finish tutorial
 *
 * @returns {void}
 */
const handleNext = () => {
  if (currentIndex.value < totalImages - 1) {
    // 最後でなければ次の画像へ進む
    currentIndex.value++
  } else {
    // 最後ならチュートリアルを完了してマイページへ戻る
    void router.push('/mypage')
  }
}
</script>

<style scoped>
.tutorial-container {
  position: relative;
  width: 100%;
  height: 100%;
}

/* 1. 枠組み（はみ出た部分を隠して1枚分だけ見せる） */
.tutorial-slider {
  width: 100%;
  background-color: #f5f5f5;
  overflow: hidden;
}

/* 2. 画像を横一列に並べるトラック */
.slider-track {
  width: 100%;
}

/* スライド時の滑らかなアニメーション */
.transition-transform {
  transition: transform 0.3s ease-in-out;
}

/* 3. 各画像を必ず枠の100%の幅にする */
.slider-img {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  padding: 70px;
  box-sizing: border-box;
  object-fit: contain;
}

/* フローティングボタンのコンテナ */
.floating-nav-container {
  position: fixed;
  bottom: calc(80px + env(safe-area-inset-bottom));
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
  pointer-events: none;
}

/* ボタン自体はクリック判定を有効化し、サイズを明示的に大きくする */
.floating-nav-container .v-btn {
  pointer-events: auto;
  height: 54px !important; /* ボタンの縦幅を厚く */
  font-size: 1.1rem !important; /* 文字サイズを大きく */
  padding: 0 28px !important; /* 左右の余白を広げて横幅も大きく */
}

.back-btn {
  margin-right: auto;
}
.next-btn {
  margin-left: auto;
}
</style>
