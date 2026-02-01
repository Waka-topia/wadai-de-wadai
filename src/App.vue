<template>
  <v-app>
    <v-app-bar color="orange">
      <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"> </v-app-bar-nav-icon>

      <v-app-bar-title class="font-weight-bold text-h5 text-white">
        和大DE話題-{{ title }}-
      </v-app-bar-title>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" class="bg-white">
      <v-list>
        <v-list-item class="position-relative my-1" block size="large" @click="gotoshop">
          <v-icon> mdi-download </v-icon>
          称号を受け取る
          <v-icon class="position-absolute right-0 mx-2"> mdi-chevron-right </v-icon>
        </v-list-item>
        <v-list-item class="position-relative my-1" block size="large" @click="gotoinquiry">
          <v-icon> mdi-email-outline </v-icon>
          お問い合わせ
          <v-icon class="position-absolute right-0 mx-2"> mdi-open-in-new </v-icon>
        </v-list-item>
        <v-list-item class="position-relative my-1" block size="large" @click="gotorule">
          <v-icon> mdi-information-outline </v-icon>
          利用規約
          <v-icon class="position-absolute right-0 mx-2"> mdi-chevron-right </v-icon>
        </v-list-item>
        <LogOutButton />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view></router-view>
      <div class="mb-6">
        <v-footer app>
          <span>&copy; 2025 和大DE話題</span>
        </v-footer>
      </div>
    </v-main>
  </v-app>
  <BottomNavigation v-if="showBottomNavigation" />
</template>

<script>
import BottomNavigation from '@/components/templates/BottomNavigation.vue'
import LogOutButton from '@/components/templates/LogOut.vue'

export default {
  name: 'App',
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
        this.updateTitle(route)
        this.updateBottomNavigationVisibility(route)
        this.checkEventCalPage(route)
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
        '/inquiry': 'お問い合わせ',
        '/rule': '利用規約',
        '/jobs': '求人情報',
      }
      this.title = routeTitleMap[route.path]
    },
    updateBottomNavigationVisibility(route) {
      this.showBottomNavigation = !['/login', '/signup'].includes(route.path)
    },
    checkEventCalPage(route) {
      this.isEventCalPage = '/eventcal'.includes(route.path)
    },
    gotoshop() {
      this.$router.push('/titleshop')
    },
    gotoinquiry() {
      window.open(
        'https://docs.google.com/forms/d/e/1FAIpQLScqd9venqOBZYzIWlDr6EjfHaCTizqLamkFlJUMBXCJaRmHdg/viewform?usp=header',
        '_blank',
      )
    },
    gotorule() {
      this.$router.push('/rule')
    },
  },
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Kaisei+Tokumin&display=swap');

/* .vuecal__event {
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
} */

v-app-bar-title {
  font-family: 'Kaisei Tokumin', sans-serif;
  /* Poppins フォントを指定 */
}
</style>
