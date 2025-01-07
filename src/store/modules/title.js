// src/store/modules/title.js
import { getAllTitles, addTitleToUser } from "../../services/titleService";

const state = {
  titles: [], // Firestoreから取得したすべてのタイトル
  userTitles: [], // ユーザーが獲得したタイトル
};

const getters = {
  allTitles: state => state.titles,
  userTitles: state => state.userTitles,
};

const actions = {
  // Firestoreからすべてのタイトルをフェッチするアクション
  async fetchAllTitles({ commit }) {
    try {
      const titles = await getAllTitles();
      commit("setTitles", titles);
    } catch (error) {
      console.error("Error fetching titles:", error);
    }
  },

  // ユーザーにタイトルを追加するアクション
  async addTitleToUser({ commit }, { userID, titleID, titleData }) {
    try {
      await addTitleToUser(userID, titleID, titleData);
      commit("addUserTitle", titleID);
    } catch (error) {
      console.error("Error adding title:", error);
    }
  },
};

const mutations = {
  // タイトル一覧をステートに保存
  setTitles(state, titles) {
    state.titles = titles;
  },

  // ユーザーのタイトル一覧をステートに追加
  addUserTitle(state, titleID) {
    if (!state.userTitles.includes(titleID)) {
      state.userTitles.push(titleID);
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
