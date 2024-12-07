import { createRouter, createWebHistory } from "vue-router";
import Login from "../pages/Login.vue";
import SignUp from "../pages/SignUp.vue";
// import CampusMap from "@/pages/MapPage.vue";
import MyPage from "@/pages/MyPage.vue";
import Ranking from "@/pages/Ranking.vue";
import Reader from "@/pages/Reader.vue";
//import Dashboard from "../pages/Dashboard.vue";
import { default as Home, default as testpage } from "@/pages/Home.vue";
import CampusMap from "@/pages/MapPage.vue";

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/login", name: "Login", component: Login },
  { path: "/signup", name: "SignUp", component: SignUp },
  { path: "/reader", name: "Reader", component: Reader},
  { path: "/ranking", name: "Ranking", component: Ranking },
  { path: "/mypage", name: "MyPage", component: MyPage },
  //{ path: "/dashboard", name: "Dashboard", component: Dashboard },
  { path: "/campus-map", name: "CampusMap", component: CampusMap },
  { path: "/testpage", name: "testpage", component: testpage },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
