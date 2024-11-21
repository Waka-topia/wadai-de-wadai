import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/config"; // Firebase Authの設定をインポート

export default {
  namespaced: true,
  state: {
    user: null,
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
  },
  actions: {
    initializeAuth({ commit }) {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
          if (user) {
            commit("setUser", user);
          } else {
            commit("setUser", null);
          }
          resolve();
        });
      });
    },
  },
  getters: {
    isAuthenticated(state) {
      return !!state.user;
    },
    getUser(state) {
      return state.user;
    },
  },
};
