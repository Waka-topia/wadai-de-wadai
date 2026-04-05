<template>
  <div class="pa-4 text-center">
    <v-dialog v-model:model-value="dialog" max-width="700">
      <template #activator="{ props: activatorProps }">
        <v-btn
          v-bind="activatorProps"
          class="text-white font-weight-bold"
          color="orange"
          elevation="3"
          rounded
        >
          プロフィール編集
        </v-btn>
      </template>

      <v-card>
        <v-card-title class="text-h5 font-weight-bold">
          <v-icon class="mr-2" color="orange">mdi-account</v-icon>
          ユーザープロフィール
        </v-card-title>

        <v-card-text>
          <v-row class="mb-4" align="center" justify="center">
            <UserIcon :user-icon-url="user.userIconUrl" />
          </v-row>

          <v-divider class="my-4" />

          <div class="py-4">
            <v-row align="center">
              <v-col cols="auto">
                <v-icon color="orange" large>mdi-information</v-icon>
              </v-col>
              <v-col>
                <h3 class="text-h5 font-weight-bold">基本情報</h3>
              </v-col>
            </v-row>
          </div>

          <v-row dense>
            <UserName :user-name="user.userName" />
            <UserAddress :email="user.email" />
            <UserId :user-id="user.userId" />
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">キャンセル</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import UserAddress from './UserAddress.vue'
import UserIcon from './UserIcon.vue'
import UserId from './UserId.vue'
import UserName from './UserName.vue'

const dialog = ref(false)

watch(dialog, (open) => {
  if (open) {
    void logFirebaseAnalyticsEvent('profile_edit_dialog_open', {})
  }
})

const store = useStore()

const user = computed(() => store.getters['users/currentUserData'])
</script>
