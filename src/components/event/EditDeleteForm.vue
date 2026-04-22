<template>
  <div class="edit-delete-root">
    <v-card rounded="lg" class="mb-4" elevation="0">
      <v-card-text>
        <div class="d-flex flex-column ga-3 mb-3">
          <!-- 編集ボタン & ダイアログ -->
          <v-dialog v-model="editDialogOpen" max-width="700">
            <template #activator="{ props: editProps }">
              <v-btn
                v-bind="editProps"
                color="grey-darken-3 font-weight-bold"
                variant="flat"
                rounded="pill"
              >
                <v-icon start>mdi-pencil</v-icon>
                このイベントを編集する
              </v-btn>
            </template>
            <v-card rounded="lg">
              <v-card-title class="text-h5 font-weight-bold pa-5 pb-3">
                <v-icon class="mr-2" color="blue-darken-1">mdi-pencil-outline</v-icon>
                イベントの編集
              </v-card-title>
              <v-divider />
              <EventForm v-if="editDialogOpen" :initial-event="event" @success="onEditSuccess" />
              <v-divider />
              <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn variant="text" @click="editDialogOpen = false">キャンセル</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <!-- 削除ボタン & ダイアログ -->
          <v-dialog v-model="deleteDialogOpen" max-width="500">
            <template #activator="{ props: deleteProps }">
              <v-btn
                v-bind="deleteProps"
                class="font-weight-bold"
                color="red-lighten-1"
                variant="flat"
                rounded="pill"
              >
                <v-icon start>mdi-delete</v-icon>
                削除する
              </v-btn>
            </template>

            <v-card rounded="xl">
              <v-card-title class="font-weight-bold text-grey-darken-4 pa-5 pb-2"
                >注意</v-card-title
              >
              <v-card-text> このイベントを削除します。本当によろしいですか？ </v-card-text>
              <v-card-actions class="pa-4 pt-2">
                <v-btn class="flex-grow-1" variant="text" @click="deleteDialogOpen = false"
                  >キャンセル</v-btn
                >
                <v-divider vertical style="border-color: #000000; opacity: 1" />
                <v-btn
                  class="flex-grow-1 font-weight-bold"
                  color="red"
                  variant="text"
                  @click="onDelete"
                  >削除する</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-dialog>
        </div>
        <p class="text-caption text-grey text-center mb-0">
          ※作成者本人、または団体の代表者のみ操作できます
        </p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useSnackbar } from '@/composables/useSnackbar'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import EventForm from '@/components/event/EventForm.vue'

const props = defineProps({
  eventId: {
    type: String,
    required: true,
  },
  /** 編集用に渡されるイベント全データ */
  event: {
    type: Object,
    required: true,
  },
})

const { showSnackbar } = useSnackbar()

const router = useRouter()
const store = useStore()
const editDialogOpen = ref(false)
const deleteDialogOpen = ref(false)

const onEditSuccess = () => {
  editDialogOpen.value = false
  // 編集成功時はsnackbarはEventForm側で出すが、もし追加の処理が必要ならここに書く
}

const onDelete = async () => {
  try {
    const currentUserId = store.getters['auth/userId']

    void logFirebaseAnalyticsEvent('event_detail_delete_confirm', { eventId: props.eventId })

    await store.dispatch('event/deleteEvent', {
      eventId: props.eventId,
      currentUserId,
    })

    showSnackbar('イベントが正常に削除されました。', 'success', { icon: 'mdi-check-circle' })

    deleteDialogOpen.value = false

    setTimeout(() => {
      router.push('/eventcal')
    }, 500)
  } catch (error) {
    deleteDialogOpen.value = false
    showSnackbar(error.message, 'error', { icon: 'mdi-alert-circle' })
  }
}
</script>
