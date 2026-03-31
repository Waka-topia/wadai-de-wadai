<template>
  <v-select
    v-model="selectedOrg"
    :items="allGroups"
    item-title="name"
    item-value="name"
    label="団体名"
    variant="outlined"
    density="comfortable"
    required
    persistent-hint
    prepend-inner-icon="mdi-domain"
    class="pt-5"
    @update:model-value="handleOrgChange"
  />

  <!-- 現在登録中の団体バッジ -->
  <div v-if="currentOrgName" class="d-flex align-center gap-2 mt-1 px-1">
    <span class="text-caption text-medium-emphasis">現在の団体:</span>
    <v-chip
      v-for="value in currentOrgName"
      size="small"
      color="primary"
      variant="tonal"
      prepend-icon="mdi-domain"
    >
      {{ value.name }}
    </v-chip>
  </div>

  <!-- パスワード確認ダイアログ -->
  <v-dialog v-model="dialog" max-width="400" persistent>
    <v-card>
      <v-card-title class="text-h6 pa-4">パスワード確認</v-card-title>
      <v-card-text>
        <p class="mb-3 text-body-2 text-medium-emphasis">
          「{{ pendingOrg }}」を選択するにはパスワードを入力してください。
        </p>
        <v-text-field
          v-model="password"
          label="パスワード"
          :type="showPassword ? 'text' : 'password'"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          :error-messages="errorMessage"
          variant="outlined"
          density="comfortable"
          autofocus
          @click:append-inner="showPassword = !showPassword"
          @keyup.enter="confirmPassword"
        />
      </v-card-text>
      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="text" @click="cancelSelection">キャンセル</v-btn>
        <v-btn color="primary" variant="flat" :loading="loading" @click="confirmPassword">
          確認
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
    {{ snackbar.message }}
  </v-snackbar>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { allGroups } from '@/data/groups'

const store = useStore()

// フォームの選択値（初期値なし）
const selectedOrg = ref(null)

// バッジ表示用（store の確定済み値）
const currentOrgName = computed(() => store.getters['auth/belongingOrgs'] || '')

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

// ダイアログ関連
const dialog = ref(false)
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const loading = ref(false)
const pendingOrg = ref('')

const handleOrgChange = (value) => {
  if (!value) return
  pendingOrg.value = value
  password.value = ''
  errorMessage.value = ''
  showPassword.value = false
  dialog.value = true
}

const confirmPassword = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    // ここでパスワードの検証を行う（例: API 呼び出し）
    snackbar.value = {
      show: true,
      message: '団体の管理者権限を取得しました。',
      color: 'success',
    }
  } catch {
    snackbar.value = {
      show: true,
      message: 'パスワードの確認に失敗しました。もう一度お試しください。',
      color: 'error',
    }
  } finally {
    loading.value = false
    dialog.value = false
  }
}

const cancelSelection = () => {
  selectedOrg.value = null
  dialog.value = false
  pendingOrg.value = ''
}

onMounted(() => {
  store.dispatch('auth/fetchUserOrgs')
})
</script>
