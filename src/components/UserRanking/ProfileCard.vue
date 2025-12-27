<template>
  <v-divider></v-divider>
  <v-card class="my-2 pb-3" outlined hover elevation="0">
    <div v-if="rank == 1" class="position-absolute top-0 left-0 w-25 h-auto ml-3 z-10">
      <v-img
        :src="getImageUrl('rankings/ribbon1.png')"
        alt="ランキングのアイコン"
        class="w-33 h-33"
      >
        <div
          class="font-weight-bold text-white text-xs-subtitle-1 text-sm-h4 text-md-h3 text-center text-no-wrap"
        >
          {{ rank }}
        </div>
      </v-img>
    </div>
    <div v-else-if="rank == 2" class="position-absolute top-0 left-0 w-25 h-auto ml-3 z-10">
      <v-img
        :src="getImageUrl('rankings/ribbon2.png')"
        alt="ランキングのアイコン"
        class="w-33 h-100"
      >
        <div
          class="font-weight-bold text-white text-xs-subtitle-1 text-sm-h4 text-md-h3 text-center text-no-wrap"
        >
          {{ rank }}
        </div>
      </v-img>
    </div>
    <div v-else-if="rank == 3" class="position-absolute top-0 left-0 w-25 h-auto ml-3 z-10">
      <v-img
        :src="getImageUrl('rankings/ribbon3.png')"
        alt="ランキングのアイコン"
        class="w-33 h-100"
      >
        <div
          class="font-weight-bold text-white text-xs-subtitle-1 text-sm-h4 text-md-h3 text-center text-no-wrap"
        >
          {{ rank }}
        </div>
      </v-img>
    </div>
    <div v-else class="position-absolute top-0 left-0 w-25 h-auto ml-3 z-10">
      <v-img
        :src="getImageUrl('rankings/ribbon4.png')"
        alt="ランキングのアイコン"
        class="w-33 h-100"
      >
        <div
          class="font-weight-bold text-white text-xs-subtitle-1 text-sm-h4 text-md-h3 text-center text-no-wrap"
        >
          {{ rank }}
        </div>
      </v-img>
    </div>
    <v-row class="mt-4 mb-2">
      <v-col cols="5" md="4" lg="4" class="align-self-center pl-5 mt-3 d-flex justify-center">
        <v-avatar size="140">
          <v-img :src="image" alt="ユーザーのアイコン" class="rounded-circle"></v-img>
        </v-avatar>
      </v-col>
      <v-col cols="7" md="8" lg="8">
        <v-row class="mb-1">
          <span class="font-weight-bold text-h5">{{ name }}</span>
        </v-row>
        <v-row class="mb-1">
          <v-icon size="x-large" color="red"> mdi-stamper </v-icon>
          <p class="ml-1 text-h6 text-red font-weight-bold">
            {{ count
            }}<small class="ml-1 text-red font-weight-bold" style="line-height: 1">スタンプ</small>
          </p>
        </v-row>
        <v-row class="pb-1">
          <v-icon size="x-small" color="orange ml-2"> mdi-triangle-down </v-icon>
          <small class="text-orange ml-1 font-weight-bold"> 次回参加予定の団体 </small>
        </v-row>
        <v-row>
          <v-chip
            color="orange"
            class="font-weight-bold"
            style="
              max-width: 100%;
              height: 50px;
              white-space: normal;
              word-wrap: break-word;
              word-break: break-word;
              line-height: 1.5;
              padding: 6px 12px;
            "
          >
            {{ status }}
          </v-chip>
        </v-row>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
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
})

const navigateToProfile = () => {
  router.push(`/${props.name}`)
}

const getImageUrl = (relativePath) => {
  if (relativePath) {
    return new URL(`../../assets/${relativePath}`, import.meta.url).href
  }
  return 'https://via.placeholder.com/120'
}
</script>
