<template>
  <v-dialog v-model="dialog" persistent no-click-animation max-width="90vw" width="90vw">
    <v-card class="rounded-xl overflow-hidden" height="90vh">
      <v-carousel
        v-model="currentStep"
        height="100%"
        hide-delimiter-background
        :show-arrows="false"
        color="primary"
      >
        <v-carousel-item v-for="n in 4" :key="n">
          <div class="tutorial-container pa-10">
            <h2 class="text-h2 font-weight-black text-grey-lighten-3 mb-6">0{{ n }}</h2>
            <slot :name="`content-${n}`">
              <h3 class="text-h4 mb-4">チュートリアルステップ {{ n }}</h3>
              <p>ここに画像や説明文を自由に配置してください。</p>
            </slot>
          </div>
        </v-carousel-item>

        <v-carousel-item>
          <div class="tutorial-container d-flex flex-column">
            <div
              class="flex-grow-1 pa-10 d-flex flex-column justify-center align-center text-center"
            >
              <v-icon size="80" color="success" class="mb-6">mdi-check-decagram</v-icon>
              <h3 class="text-h4 font-weight-bold mb-4">準備が整いました</h3>

              <div class="action-section w-100" style="max-width: 400px">
                <v-checkbox
                  v-model="tutorialDontShowAgain"
                  label="これ以降表示しない"
                  color="primary"
                  hide-details
                  class="mb-4 justify-center"
                ></v-checkbox>

                <v-btn
                  block
                  color="primary"
                  size="x-large"
                  rounded="pill"
                  @click="completeTutorial"
                >
                  アプリをはじめる
                </v-btn>
              </div>
            </div>
          </div>
        </v-carousel-item>
      </v-carousel>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const dialog = ref(false)
const currentStep = ref(0)

// プロパティ名を改名
const tutorialDontShowAgain = ref(false)

onMounted(() => {
  // 保存されているフラグを確認
  const isHidden = localStorage.getItem('hide_intro_tutorial')

  // 未ログイン/ログイン済みに関わらず、フラグがなければ表示
  if (!isHidden) {
    dialog.value = true
  }
})

const completeTutorial = async () => {
  // 改名後の変数でチェック
  if (tutorialDontShowAgain.value) {
    // ローカルへの保存
    localStorage.setItem('hide_intro_tutorial', 'true')

    // ログイン済みユーザーへのバックエンド同期（必要に応じて）
    // await userService.setTutorialFlag(true)
  }

  dialog.value = false
}
</script>

<style scoped>
.tutorial-container {
  height: 100%;
  width: 100%;
  overflow-y: auto;
  background-color: white;
}

:deep(.v-carousel__controls) {
  bottom: 20px;
}
</style>
