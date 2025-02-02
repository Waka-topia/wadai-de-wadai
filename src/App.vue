<template>
  <v-app :class="{ 'no-scroll': isEventCalPage }">
    <v-app-bar color="orange">
      <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer">
      </v-app-bar-nav-icon>

      <v-app-bar-title>
        和大DE話題-{{ title }}-
      </v-app-bar-title>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" class="bg-white">
      <v-list>
        <v-list-item title="称号を受け取る" value="TitleShop" @click="gotoshop"></v-list-item>
        <LogOutButton />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
  <BottomNavigation v-if="showBottomNavigation" />
</template>

<script>
import LogOutButton from '@/components/templates/LogOut.vue';
import BottomNavigation from '@/components/templates/BottomNavigation.vue';

export default {
  name: "App",
  components: {
    BottomNavigation,
    LogOutButton,
  },
  data() {
    return {
      drawer: null,
      title: 'ホーム',
      showBottomNavigation: true,
      isEventCalPage: false,
    }
  },
  watch: {
    $route: {
      handler(route) {
        this.updateTitle(route);
        this.updateBottomNavigationVisibility(route);
        this.checkEventCalPage(route);
      },
      immediate: true,
    },
  },
  methods: {
    updateTitle(route) {
      const routeTitleMap = {
        '/': 'ホーム',
        '/login': 'ログイン',
        '/signup': 'サインアップ',
        '/reader': 'スキャン',
        '/ranking': 'ランキング',
        '/mypage': 'マイページ',
        '/eventcal': '新歓日程',
        '/titleshop': '称号ショップ',
      };
      this.title = routeTitleMap[route.path];
    },
    updateBottomNavigationVisibility(route) {
      this.showBottomNavigation = !['/login', '/signup'].includes(route.path);
    },
    checkEventCalPage(route) {
      this.isEventCalPage = '/eventcal'.includes(route.path);
    },
    gotoshop() {
      this.$router.push('/titleshop');
    }
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Kaisei+Tokumin&display=swap');

.vuecal__event {
  border: 1px solid #388e3c;
  color: #666;
  background-color: #f8f8f8cc;
  position: relative;
  box-sizing: border-box;
  left: 0;
  width: 100%;
  z-index: 1;
  transition: box-shadow .3s, left .3s, width .3s;
  overflow: hidden;
}

v-app-bar-title {
  font-family: 'Kaisei Tokumin', sans-serif;
  /* Poppins フォントを指定 */
  font-weight: 600;
  /* 太字 */
  font-size: 2rem;
  /* フォントサイズを調整 */
  color: #fff;
  /* テキストカラー */
}

/* App.vue またはグローバルスタイルシートに追加 */
.no-scroll {
  overflow: hidden;
  /* スクロールを無効化 */
  height: 100vh;
  /* ページ全体の高さを固定 */
  width: 100vw;
  /* ページ全体の幅を固定 */
}
</style>
