import { createStore } from "vuex";
import authModule from "./modules/auth";

export default createStore({
  state: {
    stamps: [],
  },
  modules: {
    auth: authModule,
  },
  mutations: {
    setStamps(state, stamps) {
      state.stamps = stamps;
    },
  },
  actions: {
    async fetchStamps({ commit }, userId) {
      const stamps = await getStamps(userId);
      commit("setStamps", stamps);
    },
  },
  getters: {
    stamps: (state) => state.stamps,
  },
});
