<template>
  <div>
    <!-- <TabsBar :tabsName="tabsName" :tabsComponent="tabsComponent" /> -->
    <v-skeleton-loader v-if="isLoading" :elevation="1" type="list-item-avatar" />
    <v-alert v-if="error" :text="errorMessages" title="エラー" type="error"></v-alert>
    <MonthlyRanking/>
    <!-- <div v-if="!isLoading && rankings.length > 0">
      <ProfileCard
        v-for="(user, index) in rankings"
        :key="user.userId"
        :name="user.displayName"
        :status="user.nextShinkan ? `${user.nextShinkan.groupName} - ${user.nextShinkan.nextDate}` : '情報なし'"
        :image="user.photoURL || 'https://via.placeholder.com/120'"
        :rank="index + 1" 
        :count="user.count"
      />
    </div> -->
  </div>
</template>

<script>
import DailyRanking from "@/components/molecules/DailyRanking.vue";
import MonthlyRanking from "@/components/molecules/MonthlyRanking.vue";
import WeeklyRanking from "@/components/molecules/WeeklyRanking.vue";
// import TabsBar from "@/components/organisms/TabsBar.vue";
import ProfileCard from '@/components/atoms/ProfileCard.vue';
import { mapActions, mapGetters } from "vuex";

export default {
  data() {
    return {
      tabsName: ["日", "週", "月"],
      tabsComponent: [DailyRanking, WeeklyRanking, MonthlyRanking],
    };
  },
  name: "RankingPage",
  components: {
    ProfileCard,
    MonthlyRanking
  },
  computed: {
    ...mapGetters("ranking", ["rankings", "isLoading", "error"]),
  },
  methods: {
    ...mapActions("ranking", ["fetchRankings"]),
    async fetchAdditionalUserData(userId) {
      try {
        const photoURL = await this.$store.dispatch("users/getPhotoURL", userId);
        const nextShinkan = await this.$store.dispatch("users/getNextShinkanDetails", userId);
        return { photoURL, nextShinkan };
      } catch (error) {
        console.error(`Error fetching data for user ${userId}:`, error);
        return { photoURL: null, nextShinkan: null };
      }
    },
  },
  async mounted() {
    await this.fetchRankings();
    const updatedRankings = await Promise.all(
      this.rankings.map(async (user) => {
        const additionalData = await this.fetchAdditionalUserData(user.userId);
        return { ...user, ...additionalData };
      })
    );
    this.$store.commit("ranking/setRankings", updatedRankings);
  },
};
</script>

<style scoped>
/* スタイルの調整が必要ならここに記載 */
</style>
