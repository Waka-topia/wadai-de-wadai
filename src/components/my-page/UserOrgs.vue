<template>
  <!-- 代表者として証明（承認）された団体。承認時に users の belongingOrgs に追加される -->
  <ProfileInfoItem icon="mdi-domain" label="代表者として証明済みの団体">
    <div v-if="orgNames.length === 0" class="text-body-2 text-grey">証明済みの団体はありません</div>
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
</template>

<script setup>
import { computed } from 'vue'
import { allGroups } from '@/data/groups'
import ProfileInfoItem from '@/components/my-page/ProfileInfoItem.vue'

const props = defineProps({
  belongingOrgs: {
    type: Array,
    required: true,
  },
})

const orgNames = computed(() =>
  props.belongingOrgs
    .map((orgId) => allGroups.find((g) => String(g.id) === String(orgId))?.name)
    .filter(Boolean),
)
</script>
