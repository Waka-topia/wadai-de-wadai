<template>
  <v-card @click="navigateToProfile" class="mt-2" outlined hover>
    <v-row justify="space-around" class="mx-2">
      <v-col cols="1">
        <span class="font-weight-bold text-h6">{{ rank }}位</span>
        <v-badge color="grey" :content="count">
          <v-icon large>
            mdi-postage-stamp
          </v-icon>
        </v-badge>
        <v-badge color="grey" :content="count">
          <v-icon large>
            mdi-crown
          </v-icon>
        </v-badge>
      </v-col>
      <v-col cols="5" class="my-3" align="center" :style="imageStyle">
        <v-img :src="image" alt="ユーザーのアイコン" class="rounded-circle" width="120" height="120"></v-img>
      </v-col>
      <v-col cols="6" class="d-flex flex-column justify-center align-center" :style="columnStyle">
        <span class="font-weight-bold text-h5 my-2">{{ name }}</span>
        <v-chip prepend-icon="$vuetify" color="orange" class="my-2">
          {{ status }}
        </v-chip>
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
  data() {
    return {
      imageStyle: {
        borderRight: '1px solid #ddd',  // Border between image and name/status
      },
      columnStyle: {
        paddingLeft: '10px',  // Padding to balance the border between the image and text
      }
    };
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
