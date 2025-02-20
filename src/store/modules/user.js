import { getPhotoURL } from "@/services/authService";
import { getNextShinkan } from "@/services/nextShinkanService";
import { getUserTitles } from "@/services/titleService";

const state = () => ({
  userPhotoURLs: {},
  nextShinkanDetails: {},
  userTitles: {},
});

const actions = {
  async getPhotoURL({ commit }, userId) {
    try {
      const photoURL = await getPhotoURL(userId);
      commit("setUserPhotoURL", { userId, photoURL });
      return photoURL;
    } catch (error) {
      console.error("Error fetching photo URL:", error);
      throw error;
    }
  },
  async getNextShinkanDetails({ commit }, userId) {
    try {
      const nextShinkan = await getNextShinkan(userId);
      commit("setNextShinkanDetails", { userId, nextShinkan });
      return nextShinkan;
    } catch (error) {
      console.error("Error fetching next Shinkan details:", error);
      throw error;
    }
  },
  async fetchUserTitles({ commit }, userId) {
    try {
      const titles = await getUserTitles(userId);
      commit("setUserTitles", { userId, titles });
      return titles;
    } catch (error) {
      console.error("Error fetching user titles:", error);
      throw error;
    }
  },
};

const mutations = {
  setUserPhotoURL(state, { userId, photoURL }) {
    state.userPhotoURLs[userId] = photoURL;
  },
  setNextShinkanDetails(state, { userId, nextShinkan }) {
    state.nextShinkanDetails[userId] = nextShinkan;
  },
  setUserTitles(state, { userId, titles }) {
    state.userTitles[userId] = titles;
  },
};

const getters = {
  getUserPhotoURL: (state) => (userId) => state.userPhotoURLs[userId] || null,
  getNextShinkanDetails: (state) => (userId) => state.nextShinkanDetails[userId] || null,
  getUserTitles: (state) => (userId) => state.userTitles[userId] || [],
};

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters,
};