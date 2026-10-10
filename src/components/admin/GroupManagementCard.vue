<template>
  <v-card class="pa-4">
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-2">
      <h2 class="text-h5">団体情報管理</h2>

      <div class="d-flex ga-2 flex-wrap">
        <v-btn color="orange" class="text-white" @click="openCreateDialog">
          <v-icon start>mdi-plus</v-icon>
          団体を追加
        </v-btn>

        <v-btn variant="outlined" @click="openEditDialog">
          <v-icon start>mdi-pencil</v-icon>
          団体を編集
        </v-btn>
      </div>
    </div>

    <p class="text-body-2 text-grey-darken-1">新しい団体の追加や、既存団体の情報更新ができます。</p>

    <!-- 追加ダイアログ -->
    <v-dialog v-model="createDialog" max-width="720">
      <v-card class="pa-4">
        <h2 class="text-h6 mb-4">団体を追加</h2>

        <v-text-field v-model="createForm.name" label="団体名" variant="outlined" class="mb-3" />

        <v-select
          v-model="createForm.mainCategory"
          label="区分"
          :items="mainCategoryOptions"
          item-title="label"
          item-value="value"
          variant="outlined"
          class="mb-3"
        />

        <v-select
          v-model="createForm.subCategory"
          label="分野"
          :items="subCategoryOptions"
          item-title="label"
          item-value="value"
          variant="outlined"
          class="mb-3"
        />

        <v-text-field
          v-model="createForm.detailCategory"
          label="詳細カテゴリ（例：テニス / 音楽 / アウトドア）"
          variant="outlined"
          class="mb-3"
        />

        <v-textarea
          v-model="createForm.description"
          label="団体紹介"
          variant="outlined"
          rows="4"
          class="mb-3"
        />

        <v-text-field
          v-model="createForm.instagramUrl"
          label="Instagram URL"
          variant="outlined"
          class="mb-3"
        />

        <v-text-field
          v-model="createForm.thumbnailUrl"
          label="画像URL（あとでもOK）"
          variant="outlined"
          class="mb-4"
        />

        <div class="d-flex justify-end">
          <v-btn variant="text" class="mr-2" @click="createDialog = false">キャンセル</v-btn>

          <v-btn color="orange" class="text-white" :loading="isSaving" @click="createGroup">
            保存する
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- 編集ダイアログ -->
    <v-dialog v-model="editDialog" max-width="720">
      <v-card class="pa-4">
        <h2 class="text-h6 mb-4">団体を編集</h2>

        <v-select
          v-model="selectedGroupId"
          label="団体名を選択"
          :items="groups"
          item-title="name"
          item-value="id"
          variant="outlined"
          class="mb-4"
          @update:model-value="fillEditForm"
        />

        <v-text-field v-model="editForm.name" label="団体名" variant="outlined" class="mb-3" />

        <v-select
          v-model="editForm.mainCategory"
          label="区分"
          :items="mainCategoryOptions"
          item-title="label"
          item-value="value"
          variant="outlined"
          class="mb-3"
        />

        <v-select
          v-model="editForm.subCategory"
          label="分野"
          :items="subCategoryOptions"
          item-title="label"
          item-value="value"
          variant="outlined"
          class="mb-3"
        />

        <v-text-field
          v-model="editForm.detailCategory"
          label="詳細カテゴリ"
          variant="outlined"
          class="mb-3"
        />

        <v-textarea
          v-model="editForm.description"
          label="団体紹介"
          variant="outlined"
          rows="4"
          class="mb-3"
        />

        <v-text-field
          v-model="editForm.instagramUrl"
          label="Instagram URL"
          variant="outlined"
          class="mb-3"
        />

        <v-text-field
          v-model="editForm.thumbnailUrl"
          label="画像URL"
          variant="outlined"
          class="mb-4"
        />

        <div class="d-flex justify-end">
          <v-btn variant="text" class="mr-2" @click="editDialog = false">キャンセル</v-btn>

          <v-btn color="orange" class="text-white" :loading="isUpdating" @click="updateGroup">
            保存する
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import {
  getAllGroupsService,
  createGroupService,
  getNextGroupIdService,
  updateGroupService,
} from '@/services/groupService'
import { useSnackbar } from '@/composables/useSnackbar'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'

const { showSnackbar } = useSnackbar()

const createDialog = ref(false)
const editDialog = ref(false)
const isSaving = ref(false)
const isUpdating = ref(false)

const groups = ref([])
const selectedGroupId = ref('')

const createForm = ref({
  name: '',
  mainCategory: '',
  subCategory: '',
  detailCategory: '',
  description: '',
  instagramUrl: '',
  thumbnailUrl: '',
})

const editForm = ref({
  name: '',
  mainCategory: '',
  subCategory: '',
  detailCategory: '',
  description: '',
  instagramUrl: '',
  thumbnailUrl: '',
})

const mainCategoryOptions = [
  { label: 'サークル', value: 'circle' },
  { label: '部活', value: 'club' },
  { label: '委員会', value: 'committee' },
  { label: 'プロジェクト', value: 'project' },
]

const subCategoryOptions = [
  { label: 'スポーツ', value: 'sports' },
  { label: '文化', value: 'culture' },
]

const resetCreateForm = () => {
  createForm.value = {
    name: '',
    mainCategory: '',
    subCategory: '',
    detailCategory: '',
    description: '',
    instagramUrl: '',
    thumbnailUrl: '',
  }
}

const openCreateDialog = () => {
  resetCreateForm()
  createDialog.value = true
}

const createGroup = async () => {
  if (!createForm.value.name) {
    showSnackbar('団体名を入力してください', 'error', {
      icon: 'mdi-alert-circle',
    })
    return
  }

  try {
    isSaving.value = true

    const nextId = await getNextGroupIdService()

    await createGroupService({
      id: nextId,
      ...createForm.value,
    })

    void logFirebaseAnalyticsEvent('admin_group_create', {
      groupName: createForm.value.name,
      mainCategory: createForm.value.mainCategory,
      subCategory: createForm.value.subCategory,
    })

    showSnackbar('団体を追加しました', 'success', {
      icon: 'mdi-check-circle',
    })

    createDialog.value = false
    resetCreateForm()
  } catch (error) {
    showSnackbar(error.message, 'error', {
      icon: 'mdi-alert-circle',
    })
  } finally {
    isSaving.value = false
  }
}

const openEditDialog = async () => {
  try {
    groups.value = await getAllGroupsService()
    selectedGroupId.value = ''
    editForm.value = {
      name: '',
      mainCategory: '',
      subCategory: '',
      detailCategory: '',
      description: '',
      instagramUrl: '',
      thumbnailUrl: '',
    }
    editDialog.value = true
  } catch (error) {
    showSnackbar(error.message, 'error', {
      icon: 'mdi-alert-circle',
    })
  }
}

const fillEditForm = (groupId) => {
  const target = groups.value.find((group) => String(group.id) === String(groupId))
  if (!target) return

  editForm.value = {
    name: target.name || '',
    mainCategory: target.mainCategory || '',
    subCategory: target.subCategory || '',
    detailCategory: target.detailCategory || '',
    description: target.description || '',
    instagramUrl: target.instagramUrl || '',
    thumbnailUrl: target.thumbnailUrl || '',
  }
}

const updateGroup = async () => {
  if (!selectedGroupId.value) {
    showSnackbar('編集する団体を選択してください', 'error', {
      icon: 'mdi-alert-circle',
    })
    return
  }

  try {
    isUpdating.value = true

    await updateGroupService(selectedGroupId.value, {
      ...editForm.value,
    })

    void logFirebaseAnalyticsEvent('admin_group_update', {
      groupId: selectedGroupId.value,
      groupName: editForm.value.name,
    })

    showSnackbar('団体情報を更新しました', 'success', {
      icon: 'mdi-check-circle',
    })

    editDialog.value = false
  } catch (error) {
    showSnackbar(error.message, 'error', {
      icon: 'mdi-alert-circle',
    })
  } finally {
    isUpdating.value = false
  }
}
</script>
