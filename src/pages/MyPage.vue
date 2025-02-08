<template>
  <div>
    <ProfileCard v-for="(user, index) in userInfo" :key="index" :name="user.displayName" :status="user.status"
      :image="getImageUrl(user.photoURL)" :rank="user.rank" :count="user.count" />
    <EditForm />
    <TabsBar :tabsName="tabsName" :tabsComponent="tabsComponent" />
  </div>
</template>

<script>
import DegreesList from '@/components/MyPage/DegreesList.vue';
import EditForm from '@/components/EditForm/EditForm.vue';
import ProfileCard from '@/components/MyPage/ProfileCard.vue';
import StampsList from '@/components/MyPage/StampsList.vue';
import TabsBar from '@/components/MyPage/TabsBar.vue';
import { mapActions, mapState } from "vuex";

export default {
  data() {
    return {
      tabsName: ['スタンプ', '称号'],
      userInfo: [],
      tabsComponent: [StampsList, DegreesList],
      rank: 0,
      count: 0,
    };
  },
  name: "UserDashboard",
  components: {
    ProfileCard,
    TabsBar,
    EditForm
  },
  computed: {
    ...mapState("shinkan", ["nextShinkan"]),
    userInfo() {
      const user = this.$store.getters['auth/user'];
      const nextShinkanGroupName = this.nextShinkan.groupName || '未設定';
      const nextShinkanDate = this.nextShinkan.nextDate ? this.nextShinkan.nextDate : '未設定';
      const status = `${nextShinkanGroupName} - ${nextShinkanDate}`;

      return [
        {
          displayName: user.displayName,
          status: status,
          photoURL: user.photoURL,
          rank: this.rank || 0,
          count: this.count || 0,
        },
      ];
    },
  },
  methods: {
    ...mapActions("shinkan", ["fetchNextShinkan"]),
    ...mapActions("ranking", ["getMyRanking"]),
    async fetchMyRanking() {
      try {
        await this.getMyRanking();
        const myRanking = this.$store.state.ranking.myRanking;
        if (myRanking) {
          this.rank = myRanking.rank || 0;
          this.count = myRanking.count || 0;
        } else {
          this.rank = 0;
          this.count = 0;
        }
      } catch (error) {
        console.error("Failed to fetch my ranking:", error);
      }
    },
    // 画像パスを相対パスに変換
    getImageUrl(relativePath) {
      if (relativePath) {
        return new URL(`../assets/${relativePath}`, import.meta.url).href;
      } else {
        return new URL('../assets/userIcon/defaultIcon.png', import.meta.url).href;
      }
    },
  },
  watch: {
    nextShinkan(newVal) {
      if (newVal) {
        this.fetchNextShinkan(this.$store.getters["auth/userId"]);
      }
    },
    "ranking.myRanking": {
      handler() {
        this.fetchMyRanking();
      },
      immediate: true,
    },
  },
  async mounted() {
    const userId = this.$store.getters["auth/userId"];
    if (userId) {
      this.fetchNextShinkan(userId);
      await this.fetchMyRanking();
    }
  },
};
</script>
