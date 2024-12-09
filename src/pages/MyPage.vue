<template>
  <div>
    <ProfileCard v-for="(user, index) in userInfo" :key="index" :name="user.displayName" :status="user.status"
      :image="user.photoURL" :rank="user.rank" :count="user.count" />
    <TabsBar :tabsName="tabsName" :tabsComponent="tabsComponent" />
  </div>
</template>

<script>
import StampsList from '@/components/StampsList.vue';
import ProfileCard from '@/components/atoms/ProfileCard.vue';
import DegreesList from '@/components/molecules/DegreesList.vue';
import TabsBar from '@/components/organisms/TabsBar.vue';
import { mapActions, mapState } from "vuex"; // mapActionsをインポート

export default {
  data() {
    return {
      tabsName: ['スタンプ', '称号'],
      userInfo: [],
      tabsComponent: [StampsList, DegreesList],
      rank: 0, // ランキング
      count: 0, // スタンプ数
    };
  },
  name: "UserDashboard",
  components: {
    ProfileCard,
    TabsBar,
  },
  computed: {
    ...mapState("shinkan", ["nextShinkan"]),
    userInfo() {
      const user = this.$store.getters['auth/user'];
      const nextShinkanGroupName = this.nextShinkan.groupName || '未設定';
      const nextShinkanDate = this.nextShinkan.nextDate ? this.nextShinkan.nextDate : '未設定';
      const status = `${nextShinkanGroupName} - ${nextShinkanDate}`;

      console.log("status:", status);

      // ユーザー情報にランキング情報も追加
      return [
        {
          displayName: user.displayName,
          status: status, // 次の新歓団体名と日付をstatusとして設定
          photoURL: user.photoURL || 'https://via.placeholder.com/120', // デフォルト画像
          rank: this.rank || 0, // ランキング
          count: this.count || 0, // スタンプ数
        },
      ];
    },
  },
  methods: {
    ...mapActions("shinkan", ["fetchNextShinkan"]),
    ...mapActions("ranking", ["getMyRanking"]), // rankingモジュールからgetMyRankingをインポート
    async fetchMyRanking() {
      try {
        await this.getMyRanking(); // 自分のランキング情報を取得
        const myRanking = this.$store.state.ranking.myRanking; // 自分のランキング情報を取得

        if (myRanking) {
          this.rank = myRanking.rank || 0; // ランキング
          this.count = myRanking.count || 0; // スタンプ数
        } else {
          this.rank = 0;
          this.count = 0;
        }
      } catch (error) {
        console.error("Failed to fetch my ranking:", error);
      }
    },
  },
  watch: {
    // nextShinkan が変わるたびにデータを取得して再描画
    nextShinkan(newVal) {
      if (newVal) {
        this.fetchNextShinkan(this.$store.getters["auth/userId"]);
      }
    },
    // ランキングが変わったときに自分のランキング情報を再取得
    "ranking.myRanking": {
      handler() {
        this.fetchMyRanking(); // ランキングが変わったら再取得
      },
      immediate: true, // コンポーネントがマウントされた時にも呼び出す
    },
  },
  async mounted() {
    const userId = this.$store.getters["auth/userId"];
    if (userId) {
      this.fetchNextShinkan(userId); // コンポーネントがマウントされたときに次の新歓情報を取得
      await this.fetchMyRanking(); // 自分のランキング情報を取得
    }
  },
};
</script>
