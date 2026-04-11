<template>
  <v-progress-linear v-if="isLoading" color="orange" indeterminate=""></v-progress-linear>

  <v-container class="px-3 py-8" style="max-width: 600px">
    <div class="text-center mb-6">
      <v-icon color="orange" size="48" class="mb-3">mdi-account-star</v-icon>
      <h1 class="text-h5 font-weight-bold mb-3">団体・代表者としての認証</h1>
      <p class="text-body-2 text-grey-darken-2" style="line-height: 1.6">
        ここのページでは、自分たちの団体のメンバーとして登録・認証が行えます。<br />
        認証が完了すると、<span class="font-weight-bold text-orange"
          >代理登録された新歓情報の引き継ぎ</span
        >や、新しいイベントを<span class="font-weight-bold text-orange">公式マーク付き</span
        >で掲載できるようになります！
      </p>
    </div>

    <v-card class="pa-6" rounded="lg" elevation="2">
      <div class="d-flex align-center mb-5">
        <v-avatar color="orange-lighten-4" size="32" class="mr-3">
          <v-icon color="orange" size="18">mdi-account-check</v-icon>
        </v-avatar>
        <h2 class="text-subtitle-1 font-weight-bold mb-0">認証手続き</h2>
      </div>

      <v-form @submit.prevent="onSubmit">
        <v-autocomplete
          v-model="selectedGroup"
          :items="allGroups"
          :rules="[required]"
          item-title="name"
          item-value="id"
          return-object
          label="団体名"
          variant="outlined"
          density="comfortable"
          persistent-hint
          prepend-inner-icon="mdi-domain"
          no-data-text="団体が見つかりません。正しい名称を入力してください。"
          clearable
          @update:model-value="onGroupSelected"
        />

        <!-- 代表者の存在チェック結果を表示 -->
        <v-alert
          v-if="selectedGroup && registrationMode === 'subsequent'"
          variant="tonal"
          color="success"
          icon="mdi-account-group"
          density="compact"
          class="mb-4"
        >
          <p class="text-body-2 mb-0">
            この団体にはすでに代表者がいます。団体パスワードを入力するだけで即座に登録できます。
          </p>
        </v-alert>

        <v-alert
          v-if="selectedGroup && registrationMode === 'initial'"
          variant="tonal"
          color="info"
          icon="mdi-account-plus"
          density="compact"
          class="mb-4"
        >
          <p class="text-body-2 mb-0">
            この団体の最初の代表者になります。パスワードを新しく設定後、運営による承認が必要です。
          </p>
        </v-alert>

        <!-- パスワード入力（後続: 既存パスワードを入力） -->
        <div v-if="registrationMode === 'subsequent'">
          <v-text-field
            v-model="password"
            :append-inner-icon="visible ? 'mdi-eye' : 'mdi-eye-off'"
            :rules="[required]"
            :type="visible ? 'text' : 'password'"
            clearable
            hint="団体の代表者から共有されたパスワードを入力してください。"
            label="団体パスワード"
            prepend-inner-icon="mdi-lock-outline"
            @click:append-inner="visible = !visible"
          ></v-text-field>
        </div>

        <!-- パスワード設定（初回: 新パスワードを設定） -->
        <div v-if="registrationMode === 'initial'">
          <v-text-field
            v-model="password"
            :append-inner-icon="visible ? 'mdi-eye' : 'mdi-eye-off'"
            :rules="[required, passwordRule]"
            :type="visible ? 'text' : 'password'"
            clearable
            hint="8文字以上にしてください。このパスワードは後から同じ団体のメンバーが登録する際に使います。"
            label="新しいパスワードを設定"
            placeholder="Xa4%j87d"
            prepend-inner-icon="mdi-lock-outline"
            @click:append-inner="visible = !visible"
          ></v-text-field>
          <v-text-field
            v-model="confirmPassword"
            :append-inner-icon="confirmVisible ? 'mdi-eye' : 'mdi-eye-off'"
            :rules="[required, passwordRule, confirmPasswordRule(password)]"
            :type="confirmVisible ? 'text' : 'password'"
            clearable
            hint="パスワードの確認のため、もう一度入力してください。"
            label="パスワードの確認"
            placeholder="Xa4%j87d"
            prepend-inner-icon="mdi-lock-outline"
            @click:append-inner="confirmVisible = !confirmVisible"
          ></v-text-field>
        </div>

        <v-btn
          type="submit"
          :loading="isLoading"
          :disabled="!selectedGroup || isCheckingGroup"
          block
          color="orange"
          size="large"
          variant="elevated"
        >
          <template v-if="registrationMode === 'subsequent'">
            <v-icon start>mdi-check-circle</v-icon>
            パスワードで即登録
          </template>
          <template v-else> 申請する </template>
        </v-btn>

        <p class="text-caption mt-4 px-2 text-grey">
          <template v-if="registrationMode === 'initial'">
            このパスワードは団体ごとに任意のものを設定してください。
            団体メンバーのみで共有し、厳重に保管してください。
          </template>
          <template v-else-if="registrationMode === 'subsequent'">
            パスワードは団体の既存代表者にお問い合わせください。
          </template>
        </p>

        <v-btn
          variant="plain"
          class="mt-3"
          @click="showSnackbar('パスワードリセット機能は現在準備中です。', 'info')"
        >
          パスワードを忘れた場合はこちら
        </v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { required, passwordRule, confirmPasswordRule } from '@/utils/forms/validate'
import { useStore } from 'vuex'
import { useFirebasePageView } from '@/composables/useFirebasePageView'
import { useSnackbar } from '@/composables/useSnackbar'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { allGroups } from '@/data/groups'

const selectedGroup = ref(null)
const password = ref('')
const confirmPassword = ref('')
const visible = ref(false)
const confirmVisible = ref(false)
const isLoading = ref(false)
const isCheckingGroup = ref(false)
const registrationMode = ref(null) // 'initial' | 'subsequent'

const { showSnackbar } = useSnackbar()

const router = useRouter()
const store = useStore()

useFirebasePageView('view_prove_owner', {})

/**
 * 団体選択時に、既存の代表者がいるかチェックして登録モードを切り替える
 *
 * @param {object} group 選択された団体
 */
const onGroupSelected = async (group) => {
  if (!group) {
    registrationMode.value = null
    return
  }

  try {
    isCheckingGroup.value = true
    password.value = ''
    confirmPassword.value = ''

    const hasReps = await store.dispatch('prove/checkExistingRepresentatives', String(group.id))
    registrationMode.value = hasReps ? 'subsequent' : 'initial'

    void logFirebaseAnalyticsEvent('prove_owner_group_selected', {
      groupId: String(group.id),
      mode: registrationMode.value,
    })
  } catch (error) {
    showSnackbar(error.message, 'error', { icon: 'mdi-alert-circle' })
    registrationMode.value = 'initial'
  } finally {
    isCheckingGroup.value = false
  }
}

/**
 * フォーム送信ハンドラ（初回申請 or パスワード即登録を分岐）
 *
 * @param {Promise} validationPromise バリデーション結果
 */
const onSubmit = async (validationPromise) => {
  try {
    isLoading.value = true

    const { valid } = await validationPromise
    if (!valid) throw new Error('入力に誤りがあります。')

    const selected = selectedGroup.value

    if (registrationMode.value === 'subsequent') {
      // 後続登録: パスワード認証で即座に登録
      await store.dispatch('prove/submitPasswordRegistration', {
        groupId: String(selected.id),
        userId: store.getters['auth/userId'],
        userName: store.getters['auth/displayName'],
        password: password.value,
      })

      void logFirebaseAnalyticsEvent('prove_owner_instant_register_success', {
        organizationId: String(selected.id),
      })

      showSnackbar('代表者として登録されました！', 'success', { icon: 'mdi-check-circle' })

      setTimeout(() => {
        router.push('/eventcal')
      }, 1500)
    } else {
      // 初回申請: 運営承認が必要
      await store.dispatch('prove/submitInitialApplication', {
        organizationId: selected.id,
        password: password.value,
        userId: store.getters['auth/userId'],
        userNameSnapshot: store.getters['auth/displayName'],
        emailSnapshot: store.getters['auth/email'],
        groupNameSnapshot: selected.name,
      })

      void logFirebaseAnalyticsEvent('prove_owner_submit_success', {
        organizationId: String(selected.id),
      })

      showSnackbar('申請を受け付けました', 'success', { icon: 'mdi-check-circle' })

      setTimeout(() => {
        router.push('/prove-owner/description')
      }, 1000)
    }
  } catch (error) {
    void logFirebaseAnalyticsEvent('prove_owner_submit_error', {})
    showSnackbar(error.message, 'error', { icon: 'mdi-alert-circle' })
  } finally {
    isLoading.value = false
  }
}
</script>
