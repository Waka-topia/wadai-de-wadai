import { observeAuthState } from "../services/authService";

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
          observeAuthState(async (user) => {
            if (user) {
              const idToken = await user.getIdToken();
              commit("setUser", user);  // ユーザー情報を Vuex ストアに保存
              commit("setIdToken", idToken); // トークンを Vuex ストアに保存
              console.log("User logged in:", user);  // ユーザー情報をログに表示
              resolve();  // 成功時に resolve
            } else {
              commit("clearAuthState");  // ログインしていない場合の処理
              console.log("No user logged in");  // ログインしていないことをログに表示
              resolve();  // 成功時に resolve
            }
          }, (error) => {
            console.error("Auth state error:", error);  // エラー発生時にエラーログを表示
            reject(error);  // エラー発生時に reject
          });
        });
      },
  },
  getters: {
    isAuthenticated: (state) => !!state.user,
    user: (state) => state.user,
    idToken: (state) => state.idToken,
  },
};
