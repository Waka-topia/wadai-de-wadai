// src/store/index.js
import { createStore } from 'vuex';
import { login, signUp } from '../services/authService';
import { getStamps } from '../services/firestoreService';
import auth from "./modules/auth"; // authモジュールをインポート

export default createStore({
  state: {
    user: null,
    stamps: [],
  },
  modules: {
    auth, // authモジュールを登録
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
    async login({ commit }, { email, password }) {
      const user = await login(email, password);
      commit('setUser', user);
    },
    async signUp({ commit }, { email, password }) {
      const user = await signUp(email, password);
      commit('setUser', user);
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
