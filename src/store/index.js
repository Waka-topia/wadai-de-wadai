src/store/index.js
import { createStore } from 'vuex';
import authService from '../services/authService';
import { getStamps } from '../services/firestoreService';
import authModule from './modules/auth';

export default createStore({
  state: {
    user: null,
    stamps: [],
  },
  modules: {
    auth: authModule, // モジュールを名前空間付きで登録
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    setStamps(state, stamps) {
      state.stamps = stamps;
    },
  },
  actions: {
    // async login({ commit }, { email, password }) {
    //   try {
    //     await authService.login({ commit }, { email, password });
    //   } catch (error) {
    //     console.error("Login action failed:", error);
    //     throw error;
    //   }
    // },
    async signUp({ commit }, { email, password }) {
      try {
        await authService.signup({ commit }, { email, password });
      } catch (error) {
        console.error("Sign-up action failed:", error);
      }
    },
    async fetchStamps({ commit }, userId) {
      const stamps = await getStamps(userId);
      commit('setStamps', stamps);
    },
  },
  getters: {
    user: (state) => state.user,
    stamps: (state) => state.stamps,
  },
});
