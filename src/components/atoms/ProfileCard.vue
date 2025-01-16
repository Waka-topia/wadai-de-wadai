<template>
  <v-divider></v-divider>
  <v-card @click="navigateToProfile" class="my-2 pb-3" outlined hover elevation="0">
    <v-row class="mx-1">
      <v-col cols="1" class="align-self-center pb-1">
        <span class="font-weight-bold text-h5">{{ rank }}</span>
      </v-col>
      <v-col cols="2" class="align-self-center pb-1">
        <v-img :src="image" alt="ユーザーのアイコン" class="rounded-circle"></v-img>
      </v-col>
      <v-col cols="9" class="align-self-center pb-1">
        <span class="font-weight-bold text-h5">{{ name }}</span>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="3">
      </v-col>
      <v-col cols="9" class="py-1">
        <v-chip prepend-icon="$vuetify" color="orange"
          style="max-width: 100%; height: 50px; white-space: normal; word-wrap: break-word; word-break: break-word; line-height: 1.5; padding: 6px 12px;">
          {{ status }}
        </v-chip>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="3">
      </v-col>
      <v-col cols="9" class="pt-5">
        <v-row>
          <v-icon large class="ml-4" style="line-height: 1; vertical-align: middle;">
            mdi-postage-stamp
          </v-icon>
          <p class="ml-1 text-h6">{{ count }}<small class=" ml-1 text-disabled font-weight-thin" style="line-height: 1;">スタンプ</small></p>
        </v-row>
      </v-col>
    </v-row>
  </v-card>
  <!-- <EditForm /> -->
</template>

<script>
// import EditForm from './EditForm.vue';

export default {
  props: {
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    rank: {
      type: Number,
      required: true,
    },
    count: {
      type: Number,
      required: true,
    },
  },
  methods: {
    navigateToProfile() {
      this.$router.push('/' + this.name);
    },
  },
  // components: {
  //   EditForm,
  // }
};
</script>
