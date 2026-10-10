<template>
  <v-card class="pa-4" color="orange-lighten-5" elevation="0" rounded="lg">
    <div class="d-flex align-center mb-2">
      <v-icon color="orange-darken-2" class="mr-2">mdi-shield-check</v-icon>
      <span class="text-subtitle-1 font-weight-bold text-orange-darken-4">団体の代表者の方へ</span>
    </div>
    <p class="text-body-2 text-grey-darken-2 mb-4">
      代表者証明をすると、団体のイベントに公式マークが付き、運営が代理登録したイベントも引き継げます。
    </p>
    <v-btn
      block
      color="orange-darken-2"
      variant="flat"
      rounded="pill"
      size="large"
      class="font-weight-bold"
      prepend-icon="mdi-shield-check"
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
