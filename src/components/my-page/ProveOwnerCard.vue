<template>
  <v-card class="pa-4" elevation="0" rounded="lg">
    <div class="d-flex align-center mb-2">
      <v-avatar color="blue-grey-lighten-5" rounded="lg" class="mr-4">
        <v-icon color="blue-grey-darken-2">mdi-shield-check</v-icon>
      </v-avatar>
      <span class="text-caption text-grey-darken-1 font-weight-bold">団体の代表者の方へ</span>
    </div>
    <p class="text-body-2 text-grey-darken-2 mb-4">
      代表者証明をすると、団体のイベントに公式マークが付き、運営が代理登録したイベントも引き継げます。
    </p>
    <v-btn
      block
      color="orange-darken-2"
      variant="outlined"
      rounded="pill"
      class="font-weight-bold"
      @click="goToProveOwner"
    >
      団体代表者証明へ進む
    </v-btn>
  </v-card>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToProveOwner = () => {
  router.push('/prove-owner')
}
</script>
