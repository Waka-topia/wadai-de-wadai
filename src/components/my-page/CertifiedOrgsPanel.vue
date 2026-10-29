<template>
  <!-- 代表者として証明（承認）された団体。承認時に users の belongingOrgs に追加される -->
  <ExpandableSection
    icon="mdi-domain"
    title="団体の代表者証明"
    content-class="bg-grey-lighten-4 pt-4"
  >
    <InfoItem icon="mdi-check-decagram" label="証明済みの団体">
      <div v-if="orgNames.length === 0" class="text-body-2 text-grey">
        証明済みの団体はありません
      </div>
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
    </InfoItem>

    <ProveOwnerCard class="mt-2" />
  </ExpandableSection>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { allGroups } from '@/data/groups'
import ExpandableSection from '@/components/common/ExpandableSection.vue'
import InfoItem from '@/components/common/InfoItem.vue'
import ProveOwnerCard from '@/components/my-page/ProveOwnerCard.vue'

const store = useStore()
const user = computed(() => store.getters['users/currentUserData'])

const orgNames = computed(() =>
  (user.value?.belongingOrgs ?? [])
    .map((orgId) => allGroups.find((g) => String(g.id) === String(orgId))?.name)
    .filter(Boolean),
)
</script>
