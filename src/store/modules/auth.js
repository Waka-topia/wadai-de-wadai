// store/modules/auth.js
import authService from "../../services/authService"; // authServiceをインポート
import { onAuthStateChanged } from "firebase/auth"; // authServiceからonAuthStateChangedをインポート
import { auth } from "../../firebase/config"; // Firebase Authの設定をインポート

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
    // ユーザー認証状態の初期化
    // initializeAuth({ commit }) {
    //   return new Promise((resolve, reject) => {
    //     onAuthStateChanged(auth, async (user) => {
    //       if (user) {
    //         const idToken = await user.getIdToken();
    //         commit("setUser", user); // ユーザー情報をVuexストアに保存
    //         commit("setIdToken", idToken); // トークンをVuexストアに保存
    //         console.log("User logged in:", user);
    //         resolve(); // 成功時にresolve
    //       } else {
    //         commit("clearAuthState"); // ログインしていない場合の処理
    //         console.log("No user logged in");
    //         resolve(); // 成功時にresolve
    //       }
    //     });
    //   });
    // },

    initializeAuth({ commit }) {
      return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            const idToken = await user.getIdToken();
            commit("setUser", user); // ユーザー情報を Vuex に保存
            commit("setIdToken", idToken); // トークンを Vuex に保存
            console.log("User logged in:", user);
          } else {
            commit("clearAuthState"); // ログインしていない場合はクリア
            console.log("No user logged in");
          }
          resolve(); // 成功時は resolve を呼び出す
        }, reject); // エラー時は reject を呼び出す
      });
    },

    // ログイン処理
    async login({ commit }, { email, password }) {
      try {
        const user = await authService.login({ email, password }); // authServiceのloginメソッドを呼び出す
        const idToken = await user.getIdToken();
        commit("setUser", user); // ユーザー情報をVuexストアに保存
        commit("setIdToken", idToken); // トークンをVuexストアに保存
        console.log("User logged in:", user);
      } catch (error) {
        console.error("Login failed:", error);
        throw error; // エラーを投げて、呼び出し元でハンドリング
      }
    },

    // サインアップ処理
    async signup({ commit }, { email, password }) {
      try {
        const user = await authService.signup({ email, password }); // authServiceのsignupメソッドを呼び出す
        const idToken = await user.getIdToken();
        commit("setUser", user); // ユーザー情報をVuexストアに保存
        commit("setIdToken", idToken); // トークンをVuexストアに保存
        console.log("User signed up:", user); // ユーザー情報をログに表示
      } catch (error) {
        console.error("Sign-up failed:", error); // エラーメッセージをログに表示
        throw error; // エラーを投げて、呼び出し元でハンドリング
      }
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.user,
    user: (state) => state.user,
    idToken: (state) => state.idToken,
  },
};
