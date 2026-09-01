<template>
  <v-col cols="12">
    <v-card elevation="0" rounded="lg" class="overflow-hidden">
      <div class="pa-4">
        <v-row align="center" no-gutters>
          <v-col cols="auto" class="mr-4">
            <v-avatar color="blue-grey-lighten-5" rounded="lg">
              <v-icon color="blue-grey-darken-2">mdi-domain</v-icon>
            </v-avatar>
          </v-col>
          <v-col>
            <div class="text-caption text-grey-darken-1 font-weight-bold mb-1">所属団体</div>
            <div v-if="orgNames.length === 0" class="text-body-2 text-grey">
              所属団体はありません
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
          </v-col>
        </v-row>
      </div>
    </v-card>
  </v-col>
</template>

<script setup>
import { computed } from 'vue'
import { allGroups } from '@/data/groups'

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
