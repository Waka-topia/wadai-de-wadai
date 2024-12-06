<template>
  <v-container>
    <v-row class="mt-2" justify="space-between">
      <v-col align="center" cols="4" v-for="degreeImage in degreeImages" :key="degreeImage">
        <v-img :src=degreeImage alt="Example Image" class="rounded-circle" width="100" height="100"></v-img>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      // firebaseから称号情報を取得
      degreeImages: [
        'https://via.placeholder.com/100',
        'https://via.placeholder.com/120',
        'https://via.placeholder.com/140',
        'https://via.placeholder.com/160',
        'https://via.placeholder.com/190',
        'https://via.placeholder.com/120',
        'https://via.placeholder.com/100',
        'https://via.placeholder.com/160',
      ]
    }
  },
  name: 'DegreesList',
};
</script>
