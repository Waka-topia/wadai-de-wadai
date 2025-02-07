<template>
  <v-divider></v-divider>
  <v-card class="mt-2" outlined hover elevation="0">
    <v-row>
      <v-avatar size="140" class="mx-auto mt-7 mb-3">
        <v-img :src="image" alt="ユーザーのアイコン" class="rounded-circle"></v-img>
      </v-avatar>
    </v-row>
    <v-row class="mb-1">
      <span class="font-weight-bold text-h4 mx-auto">{{ name }}</span>
    </v-row>
    <v-col>
      <v-row class="mx-auto">
        <v-col cols="6">
          <v-row class="d-flex justify-end mr-1">
            <v-icon size="x-large" color="red">
              mdi-stamper
            </v-icon>
            <p class="ml-1 text-h6 text-red font-weight-bold">{{ count }}<small class="ml-1 text-red font-weight-bold"
                style="line-height: 1;">スタンプ</small></p>
          </v-row>
        </v-col>
        <v-col cols="6">
          <v-row class="d-flex justify-start ml-1">
            <v-icon size="x-large" color="orange">
              mdi-webcam
            </v-icon>
            <p class="ml-1 text-h6 text-orange font-weight-bold">0<small class="ml-1 text-orange font-weight-bold"
                style="line-height: 1;">個</small></p>
          </v-row>
        </v-col>
      </v-row>
    </v-col>
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
</script>
