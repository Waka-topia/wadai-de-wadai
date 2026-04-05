<template>
  <v-dialog v-model="dialog" persistent no-click-animation max-width="90vw" width="90vw">
    <v-card class="rounded-xl overflow-hidden" height="90vh">
      <v-carousel height="100%" hide-delimiter-background :show-arrows="false" color="orange">
        <v-carousel-item>
          <div class="tutorial-container pa-10">
            <div class="text-h2 font-weight-black text-orange-darken-1 my-6">01</div>
            <div class="mt-4">
              <img src="@/assets/tutorial/1.webp" class="tutorial-image rounded-lg w-100" alt="" />
            </div>
          </div>
        </v-carousel-item>

        <v-carousel-item>
          <div class="tutorial-container pa-10">
            <div class="text-h2 font-weight-black text-orange-darken-1 my-6">02</div>
            <div class="mt-4">
              <img src="@/assets/tutorial/2.webp" class="tutorial-image rounded-lg w-100" alt="" />
            </div>
          </div>
        </v-carousel-item>

        <v-carousel-item>
          <div class="tutorial-container pa-10">
            <div class="text-h2 font-weight-black text-orange-darken-1 my-6">04</div>
            <div class="mt-4">
              <img src="@/assets/tutorial/6.webp" class="tutorial-image rounded-lg w-100" alt="" />
            </div>
          </div>
        </v-carousel-item>

        <v-carousel-item>
          <div class="tutorial-container pa-10">
            <div class="text-h2 font-weight-black text-orange-darken-1 my-6">05</div>
            <div class="mt-4">
              <img src="@/assets/tutorial/7.webp" class="tutorial-image rounded-lg w-100" alt="" />
            </div>
          </div>
        </v-carousel-item>

        <v-carousel-item>
          <div class="tutorial-container d-flex flex-column">
            <div
              class="flex-grow-1 pa-10 d-flex flex-column justify-center align-center text-center"
            >
              <v-icon size="80" color="success" class="mb-6">mdi-check-decagram</v-icon>
              <h3 class="text-h4 font-weight-bold my-4">準備が整いました</h3>
              <p class="text-body-1 mb-10 text-grey-darken-1">
                「これ以降表示しない」にチェックを入れると、次回から表示されません。
              </p>

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
                  color="orange"
                  size="x-large"
                  rounded="pill"
                  elevation="4"
                  class="text-white font-weight-bold"
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
import { db, auth } from '../../firebase/config'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth' // 追加

const dialog = ref(false)
const tutorialDontShowAgain = ref(false)

onMounted(() => {
  // 1. ログイン状態の変化を監視
  onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      try {
        // 2. Firestoreからユーザー設定を取得
        const userRef = doc(db, 'users', currentUser.uid)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
          const userData = userSnap.data()
          // 3. データベースのフラグが true でなければ表示
          if (userData.tutorialDontShowAgain !== true) {
            dialog.value = true
          }
        } else {
          // ユーザーデータ自体がない（初回ログイン等）場合は表示
          dialog.value = true
        }
      } catch (e) {
        console.error('[Firebase] Read error:', e)
        // エラー時は安全のために表示しない、またはデフォルト表示にするか決める
      }
    }
  })
})

/** チュートリアル終了およびフラグの永続化 */
const handleTutorialFinish = async () => {
  if (tutorialDontShowAgain.value) {
    const currentUser = auth.currentUser

    if (currentUser && currentUser.uid) {
      try {
        const userRef = doc(db, 'users', currentUser.uid)
        // 4. Firestoreのみ更新（localStorageは削除）
        await updateDoc(userRef, {
          tutorialDontShowAgain: true,
        })
        console.log(`[Firebase] Flags updated for user: ${currentUser.uid}`)
      } catch (e) {
        console.error('[Firebase] Write error:', e)
      }
    }
  }
  dialog.value = false
}
</script>
