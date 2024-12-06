<template>
  <v-card color="basil">
    <v-tabs v-model="tab" bg-color="transparent" color="orange" class="text-grey-lighten-1" grow>
      <v-tab v-for="(tabName, index) in tabsName" :key="index">{{ tabName }}</v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab">
      <v-tabs-window-item v-for="tabName in tabsName" :key="tabName" :value="tabName">
        <v-card color="basil" flat>
          <component :is="tabsComponent[tabsName.indexOf(tabName)]" />
        </v-card>
      </v-tabs-window-item>
    </v-tabs-window>
  </v-card>
</template>

<script>
export default {
  props: {
    tabsName: {
      type: Array,
      required: true,
    },
    tabsComponent: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      tab: this.tabsName[0],
    }
  },
}
</script>
