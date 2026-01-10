<template>
  <div>
    <v-skeleton-loader type="image" v-if="isLoading" :elevation="1" />
    <v-alert
      type="warning"
      title="warning"
      v-else-if="!isAuthenticated"
      text="ログインして下さい"
    ></v-alert>
    <v-alert
      type="info"
      title="info"
      v-else-if="stampImages.length === 0"
      text="スタンプをまだ持っていません。"
    ></v-alert>
    <v-alert type="error" title="エラー" v-else-if="isErrored" :text="errorMessages"></v-alert>
    <v-row class="mt-1 mx-1" v-else>
      <v-col v-for="stamp in stampImages" :key="stamp.stampId" cols="6" md="3" sm="4">
        <v-card class="border-md" aspect-ratio="1" elevation="0">
          <v-img :alt="stamp.name" :src="`/src/assets/${stamp.imageUrl}`" aspect-ratio="1"></v-img>
          <v-card-title class="font-weight-bold text-body-2 text-center"
            ><small>{{ stamp.name }}</small></v-card-title
          >
          <!-- <v-card-text>{{ stamp.description }}</v-card-text> -->
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  data() {
    return {
      isLoading: true, // 初期は読み込み中
      isErrored: false,
      errorMessages: '画像の取得に失敗しました',
    }
  },
  computed: {
    ...mapGetters('stamps', ['userStampImages']),
    ...mapGetters('auth', ['isAuthenticated']),
    stampImages() {
      return this.userStampImages || []
    },
  },
  methods: {
    ...mapActions('stamps', ['fetchUserStampImages']),
    async loadStampImages() {
      try {
        await this.fetchUserStampImages()
      } catch (error) {
        this.isErrored = true
        this.errorMessages = error.message || error
      } finally {
        this.isLoading = false
      }
    },
  },
  watch: {
    isAuthenticated: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.loadStampImages()
        }
      },
    },
  },
  async created() {
    if (this.isAuthenticated) {
      await this.loadStampImages()
    } else {
      this.isLoading = false // 認証が必要な場合も読み込み終了
    }
  },
}
</script>
