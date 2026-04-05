<template>
  <v-col cols="12">
    <v-card class="pa-3 elevation-1" outlined>
      <v-row align="center">
        <v-col cols="auto">
          <v-icon color="grey">mdi-domain</v-icon>
        </v-col>
        <v-col>
          <div class="text-subtitle-1 font-weight-medium">所属団体</div>
          <div v-if="orgNames.length === 0" class="text-body-2 text-grey">所属団体はありません</div>
          <v-chip v-for="name in orgNames" :key="name" class="mr-1 mt-1" size="small">
            {{ name }}
          </v-chip>
        </v-col>
      </v-row>
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
