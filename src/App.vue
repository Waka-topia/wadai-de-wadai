<template>
  <v-app :class="{'no-scroll': isEventCalPage}">
    <v-app-bar color="orange">
      <v-app-bar-nav-icon
        variant="text"
        @click.stop="drawer = !drawer">
      </v-app-bar-nav-icon>

      <v-app-bar-title>
        和大DE話題-{{ title }}-
      </v-app-bar-title>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      class="bg-white">
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
import BottomNavigation from '@/components/organisms/BottomNavigation.vue';
import LogOutButton from '@/components/atoms/LogOut.vue';

export default {
  data: () => ({
    drawer: null,
    title: 'ホーム',
    showBottomNavigation: true,
    isEventCalPage: false, // `/eventcal` ページ判定用
  }),
  name: "App",
  components: {
    BottomNavigation,
    LogOutButton,
  },
  watch: {
    $route(to) {
      this.updateTitle(to);
      this.updateBottomNavigationVisibility(to);
      this.checkEventCalPage(to); // ページ判定を追加
    }
  },
  methods: {
    updateTitle(route) {
      const routeTitleMap = {
        '/': 'ホーム',
        '/login': 'ログイン',
        '/signup': 'サインアップ',
        '/campus-map': 'キャンパスマップ',
        '/reader': 'スキャン',
        '/ranking': 'ランキング',
        '/mypage': 'マイページ',
        '/eventcal': '新歓日程',
      };
      this.title = routeTitleMap[route.path];
    },
    updateBottomNavigationVisibility(route) {
      this.showBottomNavigation = !['/login', '/signup'].includes(route.path);
    },
    checkEventCalPage(route) {
      this.isEventCalPage = route.path === '/eventcal';
    },
    gotoshop() {
      this.$router.push('/titleshop');
    }
  },
  created() {
    this.updateBottomNavigationVisibility(this.$route);
    this.checkEventCalPage(this.$route); // 初期ロード時に判定
    console.log(`isEventCalPage: ${this.isEventCalPage}`); // 判定結果をログ出力
  }
};
</script>


<style>
@import url('https://fonts.googleapis.com/css2?family=Kaisei+Tokumin&display=swap');

#app {
  font-family: 'Arial', sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background-color: #fff3e0;
  min-height: 50vh;
}

/* デフォルトで定義されているCSSをオーバーライド */
@media (min-width: 1024px) {
  #app {
    display: block;
  }
  body {
    display: block;
    place-items: unset;
  }
}

body, main {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  background-color: white; /* 背景色を調整 */
}

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
  font-family: 'Kaisei Tokumin', sans-serif; /* Poppins フォントを指定 */
  font-weight: 600; /* 太字 */
  font-size: 2rem; /* フォントサイズを調整 */
  color: #fff; /* テキストカラー */
}

/* App.vue またはグローバルスタイルシートに追加 */
.no-scroll {
  overflow: hidden; /* スクロールを無効化 */
  height: 100vh;    /* ページ全体の高さを固定 */
  width: 100vw;     /* ページ全体の幅を固定 */
}

</style>
