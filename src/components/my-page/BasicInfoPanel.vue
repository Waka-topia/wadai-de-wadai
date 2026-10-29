<template>
  <ExpandableSection
    icon="mdi-card-account-details-outline"
    title="基本情報"
    content-class="bg-grey-lighten-4 pt-4"
  >
    <v-row dense>
      <v-col cols="12" md="6">
        <InfoItem class="h-100" icon="mdi-email" label="メールアドレス" :value="user.email" />
      </v-col>
      <v-col cols="12" md="6">
        <InfoItem
          class="h-100"
          icon="mdi-account-box-outline"
          label="ユーザーID"
          :value="user.userId"
        />
      </v-col>
    </v-row>
  </ExpandableSection>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import ExpandableSection from '@/components/common/ExpandableSection.vue'
import InfoItem from '@/components/common/InfoItem.vue'

const store = useStore()
const user = computed(() => store.getters['users/currentUserData'])
</script>
