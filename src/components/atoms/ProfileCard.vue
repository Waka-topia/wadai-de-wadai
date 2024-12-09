<template>
  <v-card @click="navigateToProfile" outlined hover>
    <v-row justify="space-around" class="mx-2">
      <v-col cols="6" class="my-3" align="center" :style="imageStyle">
        <v-img :src="image" alt="ユーザーのアイコン" class="rounded-circle" width="120" height="120"></v-img>
      </v-col>
      <v-col cols="6" class="d-flex flex-column justify-center align-center" :style="columnStyle">
        <span class="font-weight-bold text-h5 my-2">{{ name }}</span>
        <v-chip prepend-icon="$vuetify" color="orange" class="my-2">
          {{ status }}
        </v-chip>
        <div class="ranking-info">
          <span class="font-weight-bold text-h6">{{ rank }}位</span>
          <span class="font-weight-bold text-h6">{{ count }} スタンプ</span>
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
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
};
</script>

<style scoped>
.ranking-info {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 8px;
  border-top: 1px solid #ddd; /* Border between the status and ranking info */
  padding-top: 8px;
}

.ranking-info span {
  font-size: 1rem;
}

.v-chip {
  border: 1px solid #ddd; /* Border around the status chip */
}
</style>
