<template>
  <v-divider></v-divider>
  <v-card @click="navigateToProfile" class="my-2 pb-3" outlined hover elevation="0">
    <v-row>
      <v-col cols="3" class="align-self-center  mx-3">
        <v-icon size="x-large" class="position-absolute top-0 left-1" color="orange" style="left: 4.5px;">
          mdi-shield
        </v-icon>
        <span class="font-weight-bold text-h5 text-white position-absolute top-0 left-1">{{ rank }}</span>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="5" class="align-self-center pl-5">
        <v-avatar size="140">
          <v-img :src="image" alt="ユーザーのアイコン" class="rounded-circle"></v-img>
        </v-avatar>
      </v-col>
      <v-col cols="7">
        <v-row class="mb-1">
          <span class="font-weight-bold text-h5">{{ name }}</span>
        </v-row>
        <v-row class="mb-1">
          <v-icon size="x-large" color="red">
            mdi-stamper
          </v-icon>
          <p class="ml-1 text-h6 text-red font-weight-bold">{{ count }}<small class="ml-1 text-red font-weight-bold"
              style="line-height: 1;">スタンプ</small></p>
        </v-row>
        <v-row class="pb-1">
          <v-icon size="x-small" color="orange ml-2">
            mdi-triangle-down
          </v-icon>
          <small class="text-orange ml-1 font-weight-bold">
            次回参加予定の団体
          </small>
        </v-row>
        <v-row>
          <v-chip color="orange" class="font-weight-bold"
            style="max-width: 100%; height: 50px; white-space: normal; word-wrap: break-word; word-break: break-word; line-height: 1.5; padding: 6px 12px;">
            {{ status }}
          </v-chip>
        </v-row>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { defineProps } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  rank: {
    type: Number,
    required: true
  },
  count: {
    type: Number,
    required: true
  }
})

const navigateToProfile = () => {
  router.push(`/${props.name}`)
}
</script>
