<template>
  <v-card color="basil" elevation="0">
    <v-tabs v-model="tab" class="text-grey-lighten-1" bg-color="transparent" color="orange" grow>
      <v-tab v-for="(tabName, index) in props.tabsName" :key="index">{{ tabName }}</v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab">
      <v-tabs-window-item v-for="tabName in props.tabsName" :key="tabName" :value="tabName">
        <v-card color="basil" flat>
          <component :is="props.tabsComponent[props.tabsName.indexOf(tabName)]" />
        </v-card>
      </v-tabs-window-item>
    </v-tabs-window>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  tabsName: {
    type: Array,
    required: true,
  },
  tabsComponent: {
    type: Array,
    required: true,
  },
})

const tab = ref(props.tabsName[0])
</script>
