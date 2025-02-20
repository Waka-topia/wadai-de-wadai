import EventCal from "@/pages/EventCal.vue";
import { default as Home, default as testpage } from "@/pages/Home.vue";
import InquiryPage from "@/pages/InquiryPage.vue";
import MyPage from "@/pages/MyPage.vue";
import Ranking from "@/pages/RankingPage.vue";
import Reader from "@/pages/Reader.vue";
import TitleShop from "@/pages/TitleShop.vue";
import { createRouter, createWebHistory } from "vue-router";
import Login from "../pages/Login.vue";
import SignUp from "../pages/SignUp.vue";
import Rule from "../pages/RulePage.vue";

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/login", name: "Login", component: Login },
  { path: "/signup", name: "SignUp", component: SignUp },
  { path: "/reader", name: "Reader", component: Reader},
  { path: "/ranking", name: "Ranking", component: Ranking },
  { path: "/mypage", name: "MyPage", component: MyPage },
  { path: "/testpage", name: "testpage", component: testpage },
  { path: "/eventcal", name: "EventCal", component: EventCal },
  { path: "/titleshop", name: "TitleShop", component: TitleShop },
  { path: "/inquiry", name: "InquiryPage", component: InquiryPage },
  {path: "/rule", name: "Rule", component: Rule}
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
