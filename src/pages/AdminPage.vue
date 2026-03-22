<template>
  <v-progress-linear v-if="isLoading" color="success" indeterminate=""></v-progress-linear>

  <v-sheet class="pa-6" rounded>
    <v-card class="pa-4">
      <h1 class="text-h5 mb-4">代表者証明 申請者一覧</h1>

      <div class="d-none d-md-block">
        <v-table>
          <thead>
            <tr>
              <th class="text-left">ユーザID</th>
              <th class="text-left">団体名</th>
              <th class="text-left">申請者名</th>
              <th class="text-left">メール</th>
              <th class="text-left">申請日時</th>
              <th class="text-left">承認</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="applicant in applicants" :key="applicant.userId">
              <td class="text-body-2 text-break">{{ applicant.userId }}</td>
              <td>{{ applicant.proveOwnerApplication.organizationName || '-' }}</td>
              <td>{{ applicant.proveOwnerApplication.userName || '-' }}</td>
              <td>{{ applicant.proveOwnerApplication.email || '-' }}</td>
              <td>{{ formatDate(applicant.proveOwnerApplication.requestedAt) }}</td>
              <td class="d-flex align-center">
                <v-switch
                  :disabled="updatingUserId === applicant.userId"
                  :model-value="applicant.isOfficial"
                  color="success"
                  hide-details
                  inset
                  @update:model-value="(value) => toggleApproval(applicant.userId, value)"
                />
                <span class="text-caption ml-2">
                  {{ applicant.isOfficial ? '承認' : '非承認' }}
                </span>
              </td>
            </tr>

            <tr v-if="!isLoading && applicants.length === 0">
              <td class="text-center py-6" colspan="6">申請データはありません</td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <div v-if="!isLoading && applicants.length === 0" class="d-md-none text-center py-6">
        申請データはありません
      </div>

      <v-row v-else class="d-md-none" dense>
        <v-col v-for="applicant in applicants" :key="applicant.userId" cols="12">
          <v-card class="pa-4" variant="outlined">
            <p class="text-subtitle-2 mb-1">ユーザID</p>
            <p class="mb-3 text-body-2 text-break">{{ applicant.userId }}</p>

            <p class="text-subtitle-2 mb-1">団体名</p>
            <p class="mb-3 text-body-2">
              {{ applicant.proveOwnerApplication.organizationName || '-' }}
            </p>

            <p class="text-subtitle-2 mb-1">申請者名</p>
            <p class="mb-3 text-body-2">{{ applicant.proveOwnerApplication.userName || '-' }}</p>

            <p class="text-subtitle-2 mb-1">メール</p>
            <p class="mb-3 text-body-2 text-break">
              {{ applicant.proveOwnerApplication.email || '-' }}
            </p>

            <p class="text-subtitle-2 mb-1">申請日時</p>
            <p class="mb-3 text-body-2">
              {{ formatDate(applicant.proveOwnerApplication.requestedAt) }}
            </p>

            <div class="d-flex align-center justify-space-between">
              <span class="text-caption">{{ applicant.isOfficial ? '承認' : '非承認' }}</span>
              <v-switch
                :disabled="updatingUserId === applicant.userId"
                :model-value="applicant.isOfficial"
                color="success"
                hide-details
                inset
                @update:model-value="(value) => toggleApproval(applicant.userId, value)"
              />
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </v-sheet>

  <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
    {{ snackbar.message }}
  </v-snackbar>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import {
  getProveOwnerApplicantsService,
  updateProveOwnerApprovalService,
} from '@/services/eventService'

const applicants = ref([])
const isLoading = ref(false)
const updatingUserId = ref('')
const snackbar = ref({
  show: false,
  color: '',
  message: '',
})

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

const showSnackbar = (color, message) => {
  snackbar.value = {
    show: true,
    color,
    message,
  }
}

const loadApplicants = async () => {
  try {
    isLoading.value = true
    applicants.value = await getProveOwnerApplicantsService()
  } catch (error) {
    showSnackbar('error', error.message)
  } finally {
    isLoading.value = false
  }
}

const toggleApproval = async (userId, nextValue) => {
  const targetApplicant = applicants.value.find((applicant) => applicant.userId === userId)

  if (!targetApplicant) {
    return
  }

  const previousValue = targetApplicant.isOfficial
  targetApplicant.isOfficial = nextValue

  try {
    updatingUserId.value = userId
    await updateProveOwnerApprovalService(userId, nextValue)
    showSnackbar('success', nextValue ? '承認しました' : '非承認に変更しました')
  } catch (error) {
    targetApplicant.isOfficial = previousValue
    showSnackbar('error', error.message)
  } finally {
    updatingUserId.value = ''
  }
}

onMounted(() => {
  loadApplicants()
})
</script>
