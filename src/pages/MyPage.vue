<template>
  <div class="dashboard">
    <ProfileCard v-for="(user, index) in userInfo" :key="index" :name="user.name" :status="user.status"
      :image="user.image" />
    <TabsBar :tabsName="tabsName" :tabsComponent="tabsComponent" />
    <BottomNavigation />
  </div>
</template>

<script>
import StampsList from '@/components/StampsList.vue';
import ProfileCard from '@/components/atoms/ProfileCard.vue';
import BottomNavigation from '@/components/organisms/BottomNavigation.vue';
import TabsBar from '@/components/organisms/TabsBar.vue';

export default {
  data() {
    return {
      tabsName: ['スタンプ', '称号'],
      // ログインユーザの情報をfirebaseから動的に取得
      userInfo: [
        {
          name: '和歌山 太郎',
          status: 'サッカー部',
          image: 'https://via.placeholder.com/120',
        },
      ],
      tabsComponent: [StampsList, StampsList],
    };
  },
  name: "UserDashboard",
  components: {
    BottomNavigation,
    ProfileCard,
    TabsBar,
  },
};
</script>
