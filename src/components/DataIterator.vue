<template>
  <v-data-iterator :items="items" :page="page">
    <template v-slot:default="{ items }">
      <template
        v-for="(item, i) in items"
        :key="i"
      >
        <v-card v-bind="item.raw">
        <AvatorsLists></AvatorsLists>
        </v-card>

        <br>
      </template>
    </template>
  </v-data-iterator>
</template>

<script setup>
import { ref, defineComponent } from 'vue'
import AvatorsLists from './AvatorsLists.vue';

const page = ref(1)
const items = Array.from({ length: 15 }, (k, v) => ({
  title: v + 1 + '位',
}))

defineComponent({
  name: 'DataIterator',
  components: {
    AvatorsLists
  },
})
</script>
