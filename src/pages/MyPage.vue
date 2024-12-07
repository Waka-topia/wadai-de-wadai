<template>
  <div class="dashboard">
    <AppBar :title="title" :drawer="drawer" />
    <ProfileCard 
      v-for="(user, index) in userInfo" 
      :key="index" 
      :name="user.displayName" 
      :status="user.status" 
      :image="user.photoURL" />
    <LogOutButton />
    <TabsBar :tabsName="tabsName" :tabsComponent="tabsComponent" />
    <BottomNavigation />
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex"; // mapActionsをインポート
import StampsList from '@/components/StampsList.vue';
import LogOutButton from '@/components/atoms/LogOut.vue';
import ProfileCard from '@/components/atoms/ProfileCard.vue';
import DegreesList from '@/components/molecules/DegreesList.vue';
import AppBar from '@/components/organisms/AppBar.vue';
import BottomNavigation from '@/components/organisms/BottomNavigation.vue';
import TabsBar from '@/components/organisms/TabsBar.vue';

export default {
  data() {
    return {
      drawer: false,
      title: 'マイページ',
      tabsName: ['スタンプ', '称号'],
      userInfo: [],
      tabsComponent: [StampsList, DegreesList],
    };
  },
  name: "UserDashboard",
  components: {
    BottomNavigation,
    ProfileCard,
    TabsBar,
    AppBar,
    LogOutButton,
  },
  computed: {
    ...mapState("shinkan", ["nextShinkan"]),
    userInfo() {
      const user = this.$store.getters['auth/user'];
      const nextShinkanGroupName = this.nextShinkan.groupName || '未設定';
      const nextShinkanDate = this.nextShinkan.nextDate ? this.nextShinkan.nextDate : '未設定';
      const status = `${nextShinkanGroupName} - ${nextShinkanDate}`;

      console.log("status:",status);

      return [
        {
          displayName: user.displayName,
          status: status, // 次の新歓団体名と日付をstatusとして設定
          photoURL: user.photoURL || 'https://via.placeholder.com/120', // デフォルト画像
        },
      ];
    },
  },
  methods: {
    ...mapActions("shinkan", ["fetchNextShinkan"]), // fetchNextShinkanアクションをマッピング
  },
  watch: {
    // nextShinkan が変わるたびにデータを取得して再描画
    nextShinkan(newVal) {
      if (newVal) {
        this.fetchNextShinkan(this.$store.getters["auth/userId"]);
      }
    },
  },
  mounted() {
    const userId = this.$store.getters["auth/userId"];
    if (userId) {
      this.fetchNextShinkan(userId); // コンポーネントがマウントされたときに次の新歓情報を取得
    }
  },
};
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
