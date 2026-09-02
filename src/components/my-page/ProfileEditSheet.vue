<template>
  <div class="text-center">
    <v-btn
      class="text-white font-weight-bold"
      color="orange"
      elevation="3"
      rounded="pill"
      @click="open"
    >
      プロフィール編集
    </v-btn>

    <v-bottom-sheet v-model="isOpen" :inset="false">
      <v-card class="rounded-t-xl text-left">
        <SheetHeader
          title="ユーザープロフィール"
          :loading="isSaving"
          @close="isOpen = false"
          @submit="save"
        />

        <v-card-text class="sheet-body">
          <UserIconPicker v-model="form.iconId" class="mb-4" />

          <v-text-field
            v-model="form.displayName"
            label="ユーザーネーム"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-account-outline"
            :rules="[required]"
          />

          <div class="d-flex align-center mt-1 mb-3">
            <v-icon class="mr-2" color="orange" size="small">mdi-map-marker</v-icon>
            <span class="text-body-2 font-weight-bold">次に行く新歓</span>
          </div>

          <v-autocomplete
            v-model="form.groupName"
            :items="groupNames"
            label="次回参加予定の団体"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-account-group-outline"
            clearable
          />

          <v-text-field
            v-model="form.nextDate"
            label="参加予定日"
            type="date"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-calendar"
            :disabled="!form.groupName"
            hide-details
          />

          <p class="text-caption text-grey-darken-1 mt-2 mb-0">
            登録するとランキングのカードに表示されます。
          </p>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useStore } from 'vuex'
import UserIconPicker from '@/components/my-page/UserIconPicker.vue'
import SheetHeader from '@/components/templates/SheetHeader.vue'
import { useSnackbar } from '@/composables/useSnackbar'
import { allGroups } from '@/data/groups'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { saveProfile } from '@/services/profileService'
import { required } from '@/utils/forms/validate'

const store = useStore()
const { showSnackbar } = useSnackbar()

const isOpen = ref(false)
const isSaving = ref(false)

const form = reactive({
  displayName: '',
  iconId: '',
  groupName: null,
  nextDate: '',
})

const groupNames = computed(() => allGroups.map((group) => group.name))
const userId = computed(() => store.getters['auth/userId'])

/** 現在のプロフィールをフォームに読み込んでシートを開く */
const open = () => {
  const current = store.getters['users/currentUserData']
  form.displayName = current.userName === 'Unknown' ? '' : current.userName
  form.iconId = current.iconId || ''
  form.groupName = current.nextShinkan?.groupName || null
  form.nextDate = current.nextShinkan?.nextDate || ''
  isOpen.value = true
}

const save = async () => {
  if (!form.displayName.trim()) {
    showSnackbar('ユーザーネームを入力してください。', 'warning')
    return
  }

  isSaving.value = true

  try {
    await saveProfile({
      userId: userId.value,
      displayName: form.displayName,
      iconId: form.iconId,
      nextShinkan: form.groupName ? { groupName: form.groupName, nextDate: form.nextDate } : null,
    })

    await store.dispatch('users/refreshCurrentUserData', userId.value)
    void logFirebaseAnalyticsEvent('profile_updated', { hasNextShinkan: Boolean(form.groupName) })

    showSnackbar('プロフィールを保存しました。', 'success', { icon: 'mdi-check-circle' })
    isOpen.value = false
  } catch (error) {
    showSnackbar(error.message, 'error', { icon: 'mdi-alert-circle' })
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.sheet-body {
  max-height: 60vh;
  overflow-y: auto;
}
</style>
