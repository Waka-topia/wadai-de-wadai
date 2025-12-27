<template>
  <div>
    <v-skeleton-loader v-if="isLoading" type="list-item-avatar-three-line" :elevation="0" />
    <v-skeleton-loader v-if="isLoading" type="list-item-avatar-three-line" :elevation="0" />
    <v-skeleton-loader v-if="isLoading" type="list-item-avatar-three-line" :elevation="0" />
    <v-skeleton-loader v-if="isLoading" type="list-item-avatar-three-line" :elevation="0" />
    <v-skeleton-loader v-if="isLoading" type="list-item-avatar-three-line" :elevation="0" />
    <v-skeleton-loader v-if="isLoading" type="list-item-avatar-three-line" :elevation="0" />
    <v-skeleton-loader v-if="isLoading" type="list-item-avatar-three-line" :elevation="0" />
    <v-alert v-if="error" type="error" title="エラー" :text="errorMessages"></v-alert>
    <div v-if="!isLoading && rankings.length > 0">
      <ProfileCard
        v-for="(user, index) in rankings"
        :key="user.userId"
        :count="user.count"
        :image="getImageUrl(user.photoURL)"
        :name="user.displayName"
        :rank="index + 1"
        :status="
          user.nextShinkan
            ? `${user.nextShinkan.groupName} - ${user.nextShinkan.nextDate}`
            : '情報なし'
        "
      />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import ProfileCard from '@/components/MyPage/ProfileCard.vue'

export default {
  name: 'ProfileList',
  components: {
    ProfileCard,
  },
  computed: {
    ...mapGetters('ranking', ['rankings', 'isLoading', 'error']),
  },
  methods: {
    ...mapActions('ranking', ['fetchRankings']),
    async fetchAdditionalUserData(userId) {
      try {
        const photoURL = await this.$store.dispatch('users/getPhotoURL', userId)
        const nextShinkan = await this.$store.dispatch('users/getNextShinkanDetails', userId)
        return { photoURL, nextShinkan }
      } catch (error) {
        console.error(`Error fetching data for user ${userId}:`, error)
        return { photoURL: null, nextShinkan: null }
      }
    },
    // 相対パスを画像 URL に変換するメソッド
    getImageUrl(relativePath) {
      // 相対パスが指定されていれば、それをもとに画像を取得
      if (relativePath) {
        return new URL(`../../assets/${relativePath}`, import.meta.url).href
      }
      // デフォルト画像が必要な場合
      return 'https://via.placeholder.com/120'
    },
  },
  async mounted() {
    await this.fetchRankings()
    const updatedRankings = await Promise.all(
      this.rankings.map(async (user) => {
        const additionalData = await this.fetchAdditionalUserData(user.userId)
        return { ...user, ...additionalData }
      }),
    )
    this.$store.commit('ranking/setRankings', updatedRankings)
  },
}
</script>
