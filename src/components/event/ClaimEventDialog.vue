<template>
  <v-dialog v-model="dialogOpen" max-width="500" persistent>
    <v-card rounded="lg">
      <v-card-title class="text-h6 font-weight-bold pa-5 pb-3">
        <v-icon class="mr-2" color="orange">
          {{ showRedirectPrompt ? 'mdi-alert-circle' : 'mdi-swap-horizontal' }}
        </v-icon>
        {{ showRedirectPrompt ? '代表者認証が必要です' : 'イベントの管理権限を引き継ぐ' }}
      </v-card-title>

      <v-divider />

      <div v-if="!showRedirectPrompt">
        <v-card-text class="pa-5">
          <p class="text-body-2 mb-4">
            <strong>{{ eventOrganizer }}</strong>
            のイベント管理権限をあなたに引き継ぎます。
          </p>

          <v-alert variant="tonal" color="success" icon="mdi-check-circle" class="mb-4">
            <div class="text-body-2">
              <p class="font-weight-bold mb-2">引き継ぐと以下のことができます:</p>
              <ul class="pl-4">
                <li>イベント内容の自由な編集・更新</li>
                <li>公式マーク付きで上位表示</li>
                <li>最新情報を直接発信</li>
              </ul>
            </div>
          </v-alert>

          <v-alert variant="tonal" color="warning" icon="mdi-alert" density="compact">
            <p class="text-body-2 mb-0">
              引き継ぎ後は、あなたのみがこのイベントを編集・削除できます。
            </p>
          </v-alert>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" :disabled="isLoading" @click="onCancel">キャンセル</v-btn>
          <v-btn
            color="orange"
            variant="elevated"
            :loading="isLoading"
            class="text-white font-weight-bold"
            @click="onConfirm"
          >
            <v-icon start>mdi-check</v-icon>
            引き継ぐ
          </v-btn>
        </v-card-actions>
      </div>

      <div v-else>
        <v-card-text class="pa-5">
          <p class="text-body-2 mb-4">
            この機能を利用するには、あなたが
            <strong>{{ eventOrganizer }}</strong>
            の公式メンバー（代表者）であることの認証が必要です。
          </p>
          <p class="text-body-2 text-grey-darken-1 mb-0">
            認証ページへ移動して手続きを行いますか？
          </p>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="onCancel">キャンセル</v-btn>
          <v-btn color="orange" variant="elevated" @click="onRedirect">
            <v-icon start>mdi-arrow-right</v-icon>
            認証ページへ進む
          </v-btn>
        </v-card-actions>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useSnackbar } from '@/composables/useSnackbar'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'

const router = useRouter()
const store = useStore()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  eventId: {
    type: String,
    required: true,
  },
  eventOrganizer: {
    type: String,
    default: '',
  },
  organizationId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'transferred'])

const dialogOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isLoading = ref(false)
const showRedirectPrompt = ref(false)

const { notifySuccess, notifyError } = useSnackbar()

const onCancel = () => {
  dialogOpen.value = false
}

const onConfirm = async () => {
  try {
    isLoading.value = true

    const currentUserId = store.getters['auth/userId']
    const currentUserName = store.getters['auth/displayName']

    await store.dispatch('event/transferOwnership', {
      eventId: props.eventId,
      currentUserId,
      currentUserName,
      organizationId: props.organizationId,
    })

    void logFirebaseAnalyticsEvent('event_claim_ownership_success', {
      eventId: props.eventId,
      organizationId: props.organizationId,
    })

    notifySuccess('イベントの管理権限を引き継ぎました！')

    dialogOpen.value = false
    emit('transferred')
  } catch (error) {
    void logFirebaseAnalyticsEvent('event_claim_ownership_error', {
      eventId: props.eventId,
    })
    // エラーが代表者証明未完了に関するものだった場合、ダイアログを案内モードに切り替え
    if (error.message.includes('代表者証明が必要です')) {
      showRedirectPrompt.value = true
    } else {
      notifyError(error)
    }
  } finally {
    isLoading.value = false
  }
}

const onRedirect = () => {
  dialogOpen.value = false
  router.push('/prove-owner')
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      showRedirectPrompt.value = false // 開くたびにリセット
      void logFirebaseAnalyticsEvent('event_claim_dialog_open', {
        eventId: props.eventId,
      })
    }
  },
)
</script>
