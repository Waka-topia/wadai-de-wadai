<template>
  <v-expansion-panels>
    <v-expansion-panel elevation="1" rounded="lg">
      <v-expansion-panel-title class="font-weight-bold text-subtitle-1">
        <v-icon class="mr-3" color="grey-darken-1">mdi-card-account-details-outline</v-icon>
        基本情報・所属団体（証明等）
      </v-expansion-panel-title>

      <v-expansion-panel-text class="bg-grey-lighten-4 pt-4">
        <v-row dense>
          <v-col cols="12" md="6">
            <v-card class="pa-4 h-100" elevation="0" rounded="lg">
              <ProfileInfoItem icon="mdi-email" label="メールアドレス" :value="user.email" />
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card class="pa-4 h-100" elevation="0" rounded="lg">
              <ProfileInfoItem
                icon="mdi-account-box-outline"
                label="ユーザーID"
                :value="user.userId"
              />
            </v-card>
          </v-col>
          <UserOrgs :belonging-orgs="user.belongingOrgs ?? []" />
        </v-row>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import ProfileInfoItem from '@/components/my-page/ProfileInfoItem.vue'
import UserOrgs from '@/components/my-page/UserOrgs.vue'

const store = useStore()
const user = computed(() => store.getters['users/currentUserData'])
</script>
