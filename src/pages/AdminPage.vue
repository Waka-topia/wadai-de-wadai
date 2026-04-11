<template>
  <v-progress-linear v-if="isLoading" color="success" indeterminate=""></v-progress-linear>

  <v-sheet class="pa-6" rounded>
    <v-card class="pa-4">
      <h1 class="text-h5 mb-4">代表者証明 申請者一覧</h1>

      <div class="mb-4">
        <v-btn
          :disabled="isRegisteringGroups"
          color="primary"
          variant="flat"
          @click="registerGroups"
        >
          {{ isRegisteringGroups ? '登録中...' : 'groups.js を Firebase に登録' }}
        </v-btn>
      </div>

      <div class="d-none d-md-block">
        <v-table>
          <thead>
            <tr>
              <th class="text-left">ユーザID</th>
              <th class="text-left">一時ID</th>
              <th class="text-left">団体名</th>
              <th class="text-left">申請者名</th>
              <th class="text-left">メール</th>
              <th class="text-left">申請日時</th>
              <th class="text-left">承認</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="applicant in applicants" :key="applicant.applicationId">
              <td class="text-body-2 text-break">{{ applicant.userId }}</td>
              <td class="text-body-2 text-break">
                {{ applicant.tempId }}
              </td>
              <td>{{ applicant.organizationName }}</td>
              <td>{{ applicant.userName }}</td>
              <td>{{ applicant.email }}</td>
              <td>{{ formatDate(applicant.requestedAt) }}</td>
              <td class="d-flex align-center">
                <v-switch
                  :disabled="updatingUserId === applicant.applicationId"
                  :model-value="applicant.isOfficial"
                  color="success"
                  hide-details
                  inset
                  @update:model-value="(value) => toggleApproval(applicant.applicationId, value)"
                />
                <span class="text-caption ml-2">
                  {{ applicant.isOfficial ? '承認' : '非承認' }}
                </span>
              </td>
            </tr>

            <tr v-if="!isLoading && applicants.length === 0">
              <td class="text-center py-6" colspan="7">申請データはありません</td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <div v-if="!isLoading && applicants.length === 0" class="d-md-none text-center py-6">
        申請データはありません
      </div>

      <v-row v-else class="d-md-none" dense>
        <v-col v-for="applicant in applicants" :key="applicant.applicationId" cols="12">
          <v-card class="pa-4" variant="outlined">
            <p class="text-subtitle-2 mb-1">ユーザID</p>
            <p class="mb-3 text-body-2 text-break">{{ applicant.userId }}</p>

            <p class="text-subtitle-2 mb-1">一時ID</p>
            <p class="mb-3 text-body-2 text-break">
              {{ applicant.tempId }}
            </p>

            <p class="text-subtitle-2 mb-1">団体名</p>
            <p class="mb-3 text-body-2">
              {{ applicant.organizationName }}
            </p>

            <p class="text-subtitle-2 mb-1">申請者名</p>
            <p class="mb-3 text-body-2">{{ applicant.userName }}</p>

            <p class="text-subtitle-2 mb-1">メール</p>
            <p class="mb-3 text-body-2 text-break">
              {{ applicant.email }}
            </p>

            <p class="text-subtitle-2 mb-1">申請日時</p>
            <p class="mb-3 text-body-2">
              {{ formatDate(applicant.requestedAt) }}
            </p>

            <div class="d-flex align-center justify-space-between">
              <span class="text-caption">{{ applicant.isOfficial ? '承認' : '非承認' }}</span>
              <v-switch
                :disabled="updatingUserId === applicant.applicationId"
                :model-value="applicant.isOfficial"
                color="success"
                hide-details
                inset
                @update:model-value="(value) => toggleApproval(applicant.applicationId, value)"
              />
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </v-sheet>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { registerAllGroupsService } from '@/services/groupService'
import { useFirebasePageView } from '@/composables/useFirebasePageView'
import { useSnackbar } from '@/composables/useSnackbar'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import {
  getProveOwnerApplicantsService,
  updateProveOwnerApprovalService,
} from '@/services/proveService'

useFirebasePageView('view_admin', {})

const applicants = ref([])
const isLoading = ref(false)
const updatingUserId = ref('')
const isRegisteringGroups = ref(false)

const { showSnackbar } = useSnackbar()

const formatDate = (value) => {
  if (!value) {
    return '-'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleString('ja-JP')
}

const loadApplicants = async () => {
  try {
    isLoading.value = true
    applicants.value = await getProveOwnerApplicantsService()
  } catch (error) {
    showSnackbar(error.message, 'error', { icon: 'mdi-alert-circle' })
  } finally {
    isLoading.value = false
  }
}

const registerGroups = async () => {
  try {
    isRegisteringGroups.value = true
    const { registeredCount, skippedCount } = await registerAllGroupsService()
    showSnackbar(
      `団体データを登録しました（新規: ${registeredCount}件 / 既存スキップ: ${skippedCount}件）`,
      'success',
      { icon: 'mdi-check-circle' },
    )
  } catch (error) {
    showSnackbar(error.message, 'error', { icon: 'mdi-alert-circle' })
  } finally {
    isRegisteringGroups.value = false
  }
}

const toggleApproval = async (applicationId, nextValue) => {
  const targetApplicant = applicants.value.find(
    (applicant) => applicant.applicationId === applicationId,
  )

  if (!targetApplicant) {
    return
  }

  const previousValue = targetApplicant.isOfficial
  targetApplicant.isOfficial = nextValue

  try {
    updatingUserId.value = applicationId
    await updateProveOwnerApprovalService(applicationId, nextValue)
    void logFirebaseAnalyticsEvent('admin_approval_toggle', {
      applicationId,
      approved: nextValue,
    })
    showSnackbar(nextValue ? '承認しました' : '非承認に変更しました', 'success', {
      icon: 'mdi-check-circle',
    })
  } catch (error) {
    targetApplicant.isOfficial = previousValue
    showSnackbar(error.message, 'error', { icon: 'mdi-alert-circle' })
  } finally {
    updatingUserId.value = ''
  }
}

onMounted(() => {
  loadApplicants()
})
</script>
