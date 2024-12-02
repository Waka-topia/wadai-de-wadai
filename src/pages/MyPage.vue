<template>
  <div class="dashboard">
    <AppBar :title="title" :drawer="drawer" />
    <ProfileCard v-for="(user, index) in userInfo" :key="index" :name="user.name" :status="user.status"
      :image="user.image" />
    <LogOutButton />
    <TabsBar :tabsName="tabsName" :tabsComponent="tabsComponent" />
    <BottomNavigation />
  </div>
</template>

<script>
import StampsList from '@/components/StampsList.vue';
import LogOutButton from '@/components/atoms/LogOut.vue';
import ProfileCard from '@/components/atoms/ProfileCard.vue';
import AppBar from '@/components/organisms/AppBar.vue';
import BottomNavigation from '@/components/organisms/BottomNavigation.vue';
import TabsBar from '@/components/organisms/TabsBar.vue';

export default {
  data() {
    return {
      drawer: false,
      title: 'マイページ',
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
    AppBar,
    LogOutButton,
  },
};
</script>
