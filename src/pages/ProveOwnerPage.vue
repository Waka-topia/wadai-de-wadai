<template>
  <v-progress-linear v-if="isLoading" color="success" indeterminate=""></v-progress-linear>
  <v-sheet class="pa-12" rounded>
    <v-card class="py-8">
      <v-form v-model="form" @submit.prevent="onSubmit">
        <v-text-field
          v-model="orgName"
          class="mb-2"
          :rules="[required, nameCheck]"
          clearable
          hint="団体名を入力してください。"
          label="Organization Name"
          placeholder="サッカー部"
        />
        <v-text-field
          v-model="userName"
          class="mb-2"
          :rules="[required, nameCheck]"
          clearable
          hint="本名を入力してください。"
          label="User Name"
          placeholder="山田太郎"
        />
        <v-text-field
          v-model="email"
          class="mb-2"
          :rules="[required, emailDomainCheck]"
          clearable
          hint="大学のメールアドレスを入力してください。"
          label="Email"
          placeholder="sxxxxxx@wakayama-u.ac.jp"
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
import { proveOwnerService } from '@/services/eventService'
import { useStore } from 'vuex'

const orgName = ref('')
const userName = ref('')
const email = ref('')
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

const required = (value) => !!value || 'このフィールドは必須です。'

const nameCheck = (value) => {
  if (value && value.length < 2) {
    return '名前は2文字以上で入力してください'
  }
  return true
}

const emailDomainCheck = (value) => {
  if (value && value.endsWith('@wakayama-u.ac.jp')) {
    return true
  }
  return '有効な和歌山大学のメールアドレスを入力してください'
}

const onSubmit = async () => {
  try {
    isLoading.value = true
    await proveOwnerService(userId.value, {
      organizationName: orgName.value,
      userName: userName.value,
      email: email.value,
    })

    snackbar.value = {
      show: true,
      color: 'success',
      message: '申請が完了しました',
    }

    setTimeout(() => {
      router.push('/eventcal')
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
