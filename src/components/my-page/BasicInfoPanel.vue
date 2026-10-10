<template>
  <ExpandableSection
    icon="mdi-card-account-details-outline"
    title="基本情報・証明済みの団体"
    content-class="bg-grey-lighten-4 pt-4"
  >
    <v-row dense>
      <v-col cols="12" md="6">
        <ProfileInfoItem icon="mdi-email" label="メールアドレス" :value="user.email" />
      </v-col>
      <v-col cols="12" md="6">
        <ProfileInfoItem icon="mdi-account-box-outline" label="ユーザーID" :value="user.userId" />
      </v-col>
      <v-col cols="12">
        <UserOrgs :belonging-orgs="user.belongingOrgs ?? []" />
      </v-col>
    </v-row>
  </ExpandableSection>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import ExpandableSection from '@/components/common/ExpandableSection.vue'
import ProfileInfoItem from '@/components/my-page/ProfileInfoItem.vue'
import UserOrgs from '@/components/my-page/UserOrgs.vue'

const store = useStore()
const user = computed(() => store.getters['users/currentUserData'])
</script>
