import { createRouter, createWebHistory } from "vue-router";
import Home from "../pages/Home.vue";
import Login from "../pages/Login.vue";
import Logout from "../pages/Logout.vue";
import SignUp from "../pages/SignUp.vue";
import Dashboard from "../pages/Dashboard.vue";
// import CampusMap from "@/pages/MapPage.vue";

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/login", name: "Login", component: Login },
  { path: "/logout", name: "Logout",component: Logout},
  { path: "/signup", name: "SignUp", component: SignUp },
  { path: "/dashboard", name: "Dashboard", component: Dashboard },
  // { path: "/campus-map", name: "CampusMap", component: CampusMap }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
