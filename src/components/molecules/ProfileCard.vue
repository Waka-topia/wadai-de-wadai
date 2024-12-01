<template>
  <v-card
    @click="navigateToProfile"
    outlined
    hover
  >
    <v-row justify="space-around" class="mx-2">
      <v-col cols="6" class="my-3" align="center">
        <v-img
          src="https://via.placeholder.com/120"
          alt="Example Image"
          class="rounded-circle"
          width="120"
          height="120"
        ></v-img>
      </v-col>
      <v-col cols="6" class="d-flex flex-column justify-center align-center">
        <span class="font-weight-bold text-h5 my-2">和歌山 太郎</span>
        <v-chip prepend-icon="$vuetify" color="orange" class="my-2">
          サッカー部
        </v-chip>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
export default {
  methods: {
    navigateToProfile() {
      this.$router.push('/wakayama-taro');
    },
  },
};
</script>
