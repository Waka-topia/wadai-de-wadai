<template>
  <v-dialog
    v-model="dialog"
    persistent
    no-click-animation
    max-width="90vw"
    width="90vw"
  >
    <v-card class="rounded-xl overflow-hidden" height="90vh">
      <v-carousel
        height="100%"
        hide-delimiter-background
        :show-arrows="false"
        color="primary"
      >
        <v-carousel-item v-for="n in 4" :key="n">
          <div class="tutorial-container pa-10">
            <div class="text-h2 font-weight-black text-blue-lighten-4 mb-6">0{{ n }}</div>
            <h3 class="text-h4 mb-4 font-weight-bold">ステップ {{ n }} のタイトル</h3>
            <div class="mt-4">
              <v-img
                src="https://placehold.jp/24/3e8ed0/ffffff/400x300.png?text=Waka-topia"
                class="rounded-lg mb-6"
                cover
                height="250"
              ></v-img>
              <p class="text-body-1 text-grey-darken-1">
                ここにアプリの使い方や画像などを自由に配置してください。
              </p>
            </div>
          </div>
        </v-carousel-item>

        <v-carousel-item>
          <div class="tutorial-container d-flex flex-column">
            <div class="flex-grow-1 pa-10 d-flex flex-column justify-center align-center text-center">
              <v-icon size="80" color="success" class="mb-6">mdi-check-decagram</v-icon>
              <h3 class="text-h4 font-weight-bold mb-4">準備が整いました</h3>
              <p class="text-body-1 mb-10 text-grey-darken-1">
                「これ以降表示しない」にチェックを入れると、次回から表示されません。
              </p>

              <div class="action-section w-100" style="max-width: 400px;">
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
                  elevation="4"
                  @click="handleTutorialFinish"
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
// 先ほど成功した config のパスから、db と auth の両方を読み込む
import { db, auth } from '../../firebase/config'
import { doc, updateDoc } from 'firebase/firestore'

const dialog = ref(false)
const tutorialDontShowAgain = ref(false)

onMounted(() => {
  const isHiddenLocal = localStorage.getItem('hide_intro_tutorial')
  if (!isHiddenLocal) {
    dialog.value = true
  }
})

/**
 * チュートリアル終了およびフラグの永続化
 */
const handleTutorialFinish = async () => {
  if (tutorialDontShowAgain.value) {
    // 1. ローカルストレージに保存
    localStorage.setItem('hide_intro_tutorial', 'true')

    // 2. Firebase Auth から直接現在のログインユーザーを取得する (推測不要で確実)
    const currentUser = auth.currentUser

    // 認証済みであればFirestoreを更新
    if (currentUser && currentUser.uid) {
      try {
        const userRef = doc(db, 'users', currentUser.uid)
        await updateDoc(userRef, {
          tutorialDontShowAgain: true
        })
        console.log(`[Firebase] Write success for user: ${currentUser.uid}`)
      } catch (e) {
        console.error('[Firebase] Write error:', e)
      }
    }
  }
  dialog.value = false
}
</script>
