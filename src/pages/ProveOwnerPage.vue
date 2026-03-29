<template>
  <v-progress-linear v-if="isLoading" color="success" indeterminate=""></v-progress-linear>
  <v-sheet class="pa-12" rounded>
    <v-card class="py-8">
      <v-form v-model="form" @submit.prevent="onSubmit">
        <v-select
          v-model="orgName"
          :items="allGroups"
          :rules="[required]"
          item-title="name"
          item-value="name"
          label="団体名"
          variant="outlined"
          density="comfortable"
          required
          persistent-hint
          prepend-inner-icon="mdi-domain"
        />
        <v-text-field
          v-model="password"
          :append-inner-icon="visible ? 'mdi-eye' : 'mdi-eye-off'"
          :rules="[required, passwordRule]"
          :type="visible ? 'text' : 'password'"
          clearable
          hint="8文字以上にしてください。"
          label="Password"
          placeholder="Xa4%j87d"
          prepend-inner-icon="mdi-lock-outline"
          @click:append-inner="visible = !visible"
        ></v-text-field>
        <v-text-field
          :model-value="userName"
          class="mb-2"
          disabled
          hint="アカウント情報から自動入力されます。"
          label="User Name"
        />
        <v-text-field
          :model-value="email"
          class="mb-2"
          disabled
          hint="アカウント情報から自動入力されます。"
          label="Email"
          prepend-inner-icon="mdi-email-outline"
        ></v-text-field>

        <v-btn
          type="submit"
          :loading="isLoading"
          block
          color="orange"
          size="large"
          variant="elevated"
        >
          申請する
        </v-btn>
      </v-form>
    </v-card>
  </v-sheet>

  <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
    {{ snackbar.message }}
  </v-snackbar>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createRandomId, proveOwnerService } from '@/services/eventService'
import { useStore } from 'vuex'
import { allGroups } from '@/data/groups'

const orgName = ref('')
const password = ref('')
const visible = ref(false)
const form = ref(false)
const isLoading = ref(false)
const snackbar = ref({
  show: false,
  color: '',
  message: '',
})

const router = useRouter()
const store = useStore()

const userId = computed(() => store.getters['auth/userId'])
const userName = computed(() => store.getters['auth/displayName'])
const email = computed(() => store.getters['auth/email'])

const required = (value) => !!value || 'このフィールドは必須です。'
const passwordRule = (value) => {
  if (value && value.length < 8) {
    return 'パスワードは8文字以上で入力してください'
  }
  return true
}

const onSubmit = async () => {
  try {
    isLoading.value = true

    const tempId = createRandomId()
    await proveOwnerService(userId.value, {
      organizationName: orgName.value,
      password: password.value,
      userName: userName.value,
      email: email.value,
      tempId,
    })

    snackbar.value = {
      show: true,
      color: 'success',
      message: '申請が完了しました',
    }

    setTimeout(() => {
      router.push('/prove-owner/description')
    }, 1000)
  } catch (error) {
    snackbar.value = {
      show: true,
      color: 'error',
      message: error.message,
    }
  } finally {
    isLoading.value = false
  }
}
</script>
