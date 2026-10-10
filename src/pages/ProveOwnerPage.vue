<template>
  <AuthCard
    icon="mdi-account-star"
    title="団体・代表者として認証"
    max-width="520"
    :loading="isLoading"
  >
    <template #subtitle>
      <div class="d-flex justify-center ga-2 mt-3">
        <v-chip size="small" color="orange" variant="tonal" prepend-icon="mdi-hand-wave">
          代理登録の引き継ぎ
        </v-chip>
        <v-chip size="small" color="blue" variant="tonal" prepend-icon="mdi-check-decagram">
          公式マーク付与
        </v-chip>
      </div>
    </template>

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
        color="orange-darken-2"
        persistent-hint
        prepend-inner-icon="mdi-domain"
        no-data-text="団体が見つかりません。正しい名称を入力してください。"
        clearable
        class="mb-2"
        @update:model-value="onGroupSelected"
      />

      <!-- 代表者の存在チェック中 -->
      <div v-if="selectedGroup && isCheckingGroup" class="d-flex align-center ga-2 mb-4 px-1">
        <v-progress-circular indeterminate color="orange-darken-2" size="18" width="2" />
        <span class="text-body-2 text-grey-darken-1">団体情報を確認中...</span>
      </div>

      <!-- 代表者の存在チェック結果を表示 -->
      <template v-if="selectedGroup && registrationMode && !isCheckingGroup">
        <v-divider class="mb-4" />

        <!-- subsequent: すでに代表者あり -->
        <div
          v-if="registrationMode === 'subsequent'"
          class="d-flex align-center ga-3 bg-green-lighten-5 rounded-lg pa-3 mb-4"
        >
          <v-avatar color="green" size="36" class="flex-shrink-0">
            <v-icon color="white" size="18">mdi-account-check</v-icon>
          </v-avatar>
          <div>
            <p class="text-body-2 font-weight-bold text-green-darken-2 mb-0">
              すでに代表者がいます
            </p>
            <p class="text-caption text-green-darken-1 mb-0">
              パスワードを入力するだけで即座に登録できます
            </p>
          </div>
        </div>

        <!-- initial: 最初の代表者 -->
        <div
          v-if="registrationMode === 'initial'"
          class="d-flex align-center ga-3 bg-orange-lighten-5 rounded-lg pa-3 mb-4"
        >
          <v-avatar color="orange-darken-1" size="36" class="flex-shrink-0">
            <v-icon color="white" size="18">mdi-account-plus</v-icon>
          </v-avatar>
          <div>
            <p class="text-body-2 font-weight-bold text-orange-darken-3 mb-0">
              最初の代表者になります
            </p>
            <p class="text-caption text-orange-darken-2 mb-0">
              パスワード設定後、運営による承認が必要です
            </p>
          </div>
        </div>

        <!-- パスワード入力（後続: 既存パスワードを入力） -->
        <div v-if="registrationMode === 'subsequent'">
          <p class="text-caption text-uppercase text-grey-darken-1 font-weight-bold mb-3">
            <v-icon size="13" class="mr-1 mb-1">mdi-lock-outline</v-icon>
            パスワード認証
          </p>
          <PasswordField
            v-model="password"
            :rules="[required]"
            hint="団体の代表者から共有されたパスワードを入力してください。"
            label="団体パスワード"
          />
        </div>

        <!-- パスワード設定（初回: 新パスワードを設定） -->
        <div v-if="registrationMode === 'initial'">
          <p class="text-caption text-uppercase text-grey-darken-1 font-weight-bold mb-3">
            <v-icon size="13" class="mr-1 mb-1">mdi-lock-outline</v-icon>
            パスワードを新規設定
          </p>
          <PasswordField
            v-model="password"
            :rules="[required, passwordRule]"
            hint="8文字以上にしてください。このパスワードは後から同じ団体のメンバーが登録する際に使います。"
            label="新しいパスワードを設定"
            placeholder="Xa4%j87d"
          />
          <PasswordField
            v-model="confirmPassword"
            :rules="[required, passwordRule, confirmPasswordRule(password)]"
            hint="パスワードの確認のため、もう一度入力してください。"
            label="パスワードの確認"
            placeholder="Xa4%j87d"
          />
        </div>
      </template>

      <v-btn
        type="submit"
        :loading="isLoading"
        :disabled="!selectedGroup || isCheckingGroup"
        block
        color="orange-darken-2"
        size="x-large"
        rounded="pill"
        class="font-weight-bold mt-2"
        elevation="0"
      >
        <template v-if="registrationMode === 'subsequent'">
          <v-icon start>mdi-check-circle</v-icon>
          パスワードで即登録
        </template>
        <template v-else>団体証明を申請する</template>
      </v-btn>

      <p v-if="registrationMode" class="text-caption mt-4 px-2 text-grey">
        <template v-if="registrationMode === 'initial'">
          このパスワードは団体ごとに任意のものを設定してください。
          団体メンバーのみで共有し、厳重に保管してください。
        </template>
        <template v-else-if="registrationMode === 'subsequent'">
          パスワードは団体の既存代表者にお問い合わせください。
        </template>
      </p>
    </v-form>

    <v-divider class="my-4"></v-divider>

    <v-btn
      variant="text"
      color="grey-darken-1"
      rounded="pill"
      block
      @click="showSnackbar('パスワードリセット機能は現在準備中です。', 'info')"
    >
      パスワードを忘れた場合はこちら
    </v-btn>
  </AuthCard>
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
import AuthCard from '@/components/auth/AuthCard.vue'
import PasswordField from '@/components/common/PasswordField.vue'

const selectedGroup = ref(null)
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const isCheckingGroup = ref(false)
const registrationMode = ref(null) // 'initial' | 'subsequent'

const { showSnackbar, notifySuccess, notifyError } = useSnackbar()

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
    notifyError(error)
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

      notifySuccess('代表者として登録されました！')

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

      notifySuccess('申請を受け付けました')

      setTimeout(() => {
        router.push('/prove-owner/description')
      }, 1000)
    }
  } catch (error) {
    void logFirebaseAnalyticsEvent('prove_owner_submit_error', {})
    notifyError(error)
  } finally {
    isLoading.value = false
  }
}
</script>
