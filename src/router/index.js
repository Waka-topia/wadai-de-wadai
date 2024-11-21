import { createRouter, createWebHistory } from "vue-router";
import Home from "../pages/Home.vue";
import Login from "../pages/Login.vue";
import SignUp from "../pages/SignUp.vue";
import Dashboard from "../pages/Dashboard.vue";

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/login", name: "Login", component: Login },
  { path: "/signup", name: "SignUp", component: SignUp },
  { path: "/dashboard", name: "Dashboard", component: Dashboard }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
