<template>
  <div class="pa-4 text-center">
    <v-dialog v-model:model-value="dialog" max-width="700">
      <template #activator="{ props: activatorProps }">
        <v-btn
          class="text-white font-weight-bold"
          color="orange"
          v-bind="activatorProps"
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
          <v-row align="center" justify="center" class="mb-4">
            <UserIcon />
            <ProfileImage />
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
            <UserName />
            <UserAdress />
            <UserId />
          </v-row>

          <div class="py-4 mt-5">
            <v-row align="center">
              <v-col cols="auto">
                <v-icon color="orange" large>mdi-map-marker</v-icon>
              </v-col>
              <v-col>
                <h3 class="text-h5 font-weight-bold">次に行く新歓設定</h3>
              </v-col>
            </v-row>
          </div>

          <v-card class="elevation-2 pa-4" outlined>
            <NextShinkan />
            <NextShinkanView />
          </v-card>
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
import NextShinkan from '@/components/EditForm/NextShinkan.vue'
import NextShinkanView from '@/components/EditForm/NextShinkanView.vue'
import ProfileImage from '@/components/EditForm/ProfileImage.vue'
import { ref } from 'vue'
import UserAdress from './UserAdress.vue'
import UserIcon from './UserIcon.vue'
import UserId from './UserId.vue'
import UserName from './UserName.vue'

const dialog = ref(false)
</script>
