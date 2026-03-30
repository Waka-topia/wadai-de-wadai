<template>
  <v-dialog max-width="500">
    <template #activator="{ props: activatorProps }">
      <v-card rounded="lg">
        <v-card-text>
          <v-btn v-bind="activatorProps" color="error" block variant="flat">
            <v-icon start>mdi-delete</v-icon>
            削除
          </v-btn>
          <p class="text-body-2 mt-3 text-grey text-center">このイベントの作成者のみ削除できます</p>
        </v-card-text>
      </v-card>
    </template>

    <template #default="{ isActive }">
      <v-card title="注意">
        <v-card-text>このイベントを削除します。本当によろしいですか？</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text="キャンセル" @click="isActive.value = false"></v-btn>
          <v-btn color="red" text="削除" @click="onDelete(isActive)"></v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
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
const props = defineProps({
  eventId: {
    type: String,
    required: true,
  },
})

const onDelete = async (isActive) => {
  try {
    const currentUserId = store.getters['auth/userId']

    await store.dispatch('event/deleteEvent', {
      eventId: props.eventId,
      currentUserId,
    })

    snackbar.value = {
      show: true,
      message: 'イベントが正常に削除されました。',
      color: 'success',
    }

    isActive.value = false

    setTimeout(() => {
      router.push('/eventcal')
    }, 500)
  } catch (error) {
    isActive.value = false
    snackbar.value = {
      show: true,
      message: error.message,
      color: 'error',
    }
  }
}
</script>
