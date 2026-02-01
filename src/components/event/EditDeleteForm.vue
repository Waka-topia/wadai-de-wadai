<template>
  <v-card variant="outlined" rounded="lg">
    <v-card-text>
      <v-text-field
        v-model="organizerId"
        label="団体ID"
        variant="outlined"
        density="comfortable"
        required
        prepend-inner-icon="mdi-identifier"
      />
      <v-text-field
        v-model="password"
        label="パスワード"
        type="password"
        variant="outlined"
        density="comfortable"
        required
        prepend-inner-icon="mdi-lock"
      />
      <v-btn color="error" block variant="flat" @click="onDelete">
        <v-icon start>mdi-delete</v-icon>
        削除
      </v-btn>
    </v-card-text>
  </v-card>
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
    {{ snackbar.message }}
  </v-snackbar>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const snackbar = ref({
  show: false,
  message: '',
  color: '',
})

const router = useRouter()
const store = useStore()
const organizerId = ref('')
const password = ref('')
const props = defineProps({
  eventId: {
    type: String,
    required: true,
  },
})

const onDelete = async () => {
  try {
    await store.dispatch('event/deleteEvent', {
      eventId: props.eventId,
      organizerId: organizerId.value,
      inputPassword: password.value,
    })
    snackbar.value = {
      show: true,
      message: 'イベントが正常に削除されました。',
      color: 'success',
    }
    setTimeout(() => {
      router.push('/eventcal')
    }, 500)
  } catch (error) {
    snackbar.value = {
      show: true,
      message: error.message,
      color: 'error',
    }
  }
}
</script>
