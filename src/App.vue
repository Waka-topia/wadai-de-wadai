<template>
  <v-app>
    <v-app-bar color="orange">

      <v-app-bar-nav-icon
        variant="text"
        @click.stop="drawer = !drawer">
      </v-app-bar-nav-icon>

      <v-app-bar-title>
        {{ title }}
      </v-app-bar-title>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      class="bg-orange"
      >
      <v-list>
        <v-list-item title="Home" value="home"></v-list-item>
        <v-list-item title="About" value="about"></v-list-item>
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
      this.showBottomNavigation = !['/login', '/signup'].includes(route.path)
    }
  },
  created() {
    this.updateBottomNavigationVisibility(this.$route);
  }
};
</script>

<style>
#app {
  font-family: 'Arial', sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background-color: #fff3e0;
  min-height: 100vh;
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

</style>
