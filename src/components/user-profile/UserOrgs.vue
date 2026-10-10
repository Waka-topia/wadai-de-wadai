<template>
  <v-col cols="12">
    <v-card elevation="0" rounded="lg" class="overflow-hidden">
      <div class="pa-4">
        <ProfileInfoItem icon="mdi-domain" label="所属団体">
          <div v-if="orgNames.length === 0" class="text-body-2 text-grey">所属団体はありません</div>
          <div v-else>
            <v-chip
              v-for="name in orgNames"
              :key="name"
              class="mr-2 mb-1 font-weight-bold"
              size="small"
              color="blue-grey-darken-2"
              variant="tonal"
            >
              {{ name }}
            </v-chip>
          </div>
        </ProfileInfoItem>
      </div>

      <v-divider></v-divider>

      <div
        class="bg-orange-lighten-5 px-4 py-3 d-flex align-center justify-space-between flex-wrap gap-2"
      >
        <div class="text-caption text-orange-darken-3 font-weight-bold">
          団体代表者の方はこちらから証明手続きを行ってください
        </div>
        <v-btn
          color="orange-darken-2"
          variant="flat"
          size="small"
          prepend-icon="mdi-shield-check"
          class="font-weight-bold"
          rounded="pill"
          @click="goToProveOwner"
        >
          団体代表者証明へ進む
        </v-btn>
      </div>
    </v-card>
  </v-col>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { allGroups } from '@/data/groups'
import ProfileInfoItem from '@/components/user-profile/ProfileInfoItem.vue'

const props = defineProps({
  belongingOrgs: {
    type: Array,
    required: true,
  },
})

const router = useRouter()

const orgNames = computed(() =>
  props.belongingOrgs
    .map((orgId) => allGroups.find((g) => String(g.id) === String(orgId))?.name)
    .filter(Boolean),
)

const goToProveOwner = () => {
  router.push('/prove-owner')
}
</script>
