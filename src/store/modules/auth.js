import authService from "../../services/authService";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/config";

export default {
  namespaced: true,
  state: {
    user: null,
    idToken: null,
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    setIdToken(state, token) {
      state.idToken = token;
    },
    clearAuthState(state) {
      state.user = null;
      state.idToken = null;
    },
  },
  actions: {
    initializeAuth({ commit }) {
      return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            const idToken = await user.getIdToken();
            commit("setUser", user);
            commit("setIdToken", idToken);
            console.log("User logged in:", user);
          } else {
            commit("clearAuthState");
            console.log("No user logged in");
          }
          resolve();
        }, reject);
      });
    },

    async login({ commit }, { email, password }) {
      try {
        const user = await authService.login({ email, password });
        const idToken = await user.getIdToken();
        commit("setUser", user);
        commit("setIdToken", idToken);
        console.log("User logged in:", user);
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      }
    },

    async signup({ commit }, { email, password }) {
      try {
        const user = await authService.signup({ email, password });
        const idToken = await user.getIdToken();
        commit("setUser", user);
        commit("setIdToken", idToken);
        console.log("User signed up:", user);
      } catch (error) {
        console.error("Sign-up failed:", error);
        throw error;
      }
    },

    // ログアウト処理
    async logout({ commit }) {
      try {
        await authService.logout();
        commit("clearAuthState"); // ストアの状態をクリア
        console.log("User logged out");
      } catch (error) {
        console.error("Logout failed:", error);
        throw error;
      }
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.user,
    user: (state) => state.user,
    idToken: (state) => state.idToken,
  },
};
