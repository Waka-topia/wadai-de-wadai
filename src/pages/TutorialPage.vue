<template>
  <div class="tutorial-container">
    <div class="tutorial-slider overflow-hidden rounded-lg elevation-2">
      <div
        class="slider-track d-flex transition-transform"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <img src="@/assets/tutorial/1.webp" alt="tutorial 1" class="slider-img" />
        <img src="@/assets/tutorial/2.webp" alt="tutorial 2" class="slider-img" />
        <img src="@/assets/tutorial/6.webp" alt="tutorial 3" class="slider-img" />
        <img src="@/assets/tutorial/7.webp" alt="tutorial 4" class="slider-img" />
      </div>

      <div class="slider-indicators">
        <div
          v-for="n in totalImages"
          :key="n"
          class="indicator-dot"
          :class="{ active: currentIndex === n - 1 }"
        />
      </div>
    </div>

    <div class="floating-nav-container">
      <v-btn
        color="white"
        class="text-blue-darken-2 font-weight-bold back-btn"
        elevation="4"
        rounded="pill"
        :prepend-icon="isFirstSlide ? 'mdi-close' : 'mdi-chevron-left'"
        @click="handleBack"
      >
        {{ isFirstSlide ? '閉じる' : '戻る' }}
      </v-btn>

      <v-btn
        color="blue-darken-2"
        class="text-white font-weight-bold next-btn"
        elevation="4"
        rounded="pill"
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
  padding-bottom: 120px; /* 下部ボタン群と重ならないよう余白を確保 */
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
  padding: 70px; /* ★ここで好みの余白を指定します（例: 16px, 24px, 5% など） */
  box-sizing: border-box; /* ★重要：paddingを含めて全体を「幅100%」に抑え込む魔法のプロパティ */
  object-fit: contain;
}

/* 下部の丸いインジケーター */
.slider-indicators {
  position: absolute;
  bottom: 16px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
}
.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.3);
  transition: background-color 0.2s;
}
.indicator-dot.active {
  background-color: #ff9800; /* アクティブな丸の色（オレンジ） */
}

/* フローティングボタンのコンテナ */
.floating-nav-container {
  position: fixed;
  /* BottomNavigationの高さ(64px) + 余白(16px) + セーフエリアを考慮 */
  bottom: calc(80px + env(safe-area-inset-bottom));
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
  pointer-events: none;
  z-index: 100;
}

/* ボタン自体はクリック判定を有効化する */
.floating-nav-container .v-btn {
  pointer-events: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  transition: width 0.3s ease; /* 文字幅が変わった時に滑らかに */
}

/* 中央に突き出たホームボタンとの干渉を避けるため、左右に寄せる */
.back-btn {
  margin-right: auto;
}
.next-btn {
  margin-left: auto;
}
</style>
