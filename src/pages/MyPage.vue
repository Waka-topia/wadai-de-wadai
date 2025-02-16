<template>
  <div>
    <ProfileCard v-for="(user, index) in UserInfo" :key="index" :name="user.displayName"
      :image="getImageUrl(user.photoURL)" :count="user.count" />
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
import { markRaw } from 'vue';

export default {
  data() {
    return {
      tabsName: ['獲得したスタンプ', '獲得した称号'],
      tabsComponent: [markRaw(StampsList), markRaw(DegreesList)],
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
    UserInfo() {
      const user = this.$store.getters['auth/user'];
      if (!user) return [];
      return [
        {
          displayName: user.displayName,
          photoURL: user.photoURL,
          count: this.count || 0,
        },
      ];
    },
  },
  methods: {
    // 画像パスを相対パスに変換
    getImageUrl(relativePath) {
      if (relativePath) {
        return new URL(`../assets/${relativePath}`, import.meta.url).href;
      } else {
        return new URL('../assets/userIcon/defaultIcon.png', import.meta.url).href;
      }
    },
  },
};
</script>
