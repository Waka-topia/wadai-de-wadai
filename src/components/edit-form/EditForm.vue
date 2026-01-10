<template>
  <div class="pa-4 text-center">
    <v-dialog v-model:model-value="dialog" max-width="700">
      <template #activator="{ props: activatorProps }">
        <v-btn
          class="text-white font-weight-bold"
          v-bind="activatorProps"
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
            <UserIcon :photo-url-resolved="photoURLResolved" />
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
            <UserName :display-name="displayName" />
            <UserAddress :email="email" />
            <UserId :user-id="userId" />
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
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import NextShinkan from './NextShinkan.vue'
import NextShinkanView from './NextShinkanView.vue'
import ProfileImage from './ProfileImage.vue'
import UserAddress from './UserAddress.vue'
import UserIcon from './UserIcon.vue'
import UserId from './UserId.vue'
import UserName from './UserName.vue'

const dialog = ref(false)

const store = useStore()
const photoURLResolved = computed(() => store.getters['auth/photoURLResolved'])
const displayName = computed(() => store.getters['auth/displayName'] || 'Unknown')
const email = computed(() => store.getters['auth/email'] || 'Unknown')
const userId = computed(() => store.getters['auth/userId'] || 'Unknown')
</script>
