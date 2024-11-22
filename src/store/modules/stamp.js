import { addStamp, getUserStamps } from "../../services/firestoreService";

const state = {
  stamps: [], // ユーザーが所持しているスタンプ
};

const mutations = {
  ADD_STAMP(state, stamp) {
    state.stamps.push(stamp); // 新しいスタンプを追加
  },
  SET_USER_STAMPS(state, stamps) {
    state.stamps = stamps; // ユーザーのスタンプ情報をセット
  },
};

const actions = {
  // ユーザーがQRコードをスキャンしてスタンプを獲得するアクション
  async addStamp({ commit, rootState }, groupId) {
    const userId = rootState.auth.userId; // ログイン中のユーザーID
    if (!userId) throw new Error("User is not logged in.");
    try {
      // スタンプを追加し、スタンプIDを取得
      const stampId = await addStamp(userId, groupId);
      commit("ADD_STAMP", { stampId, userId, groupId });
    } catch (error) {
      console.error("Failed to add stamp: ", error);
    }
  },

  // ユーザーが持っているスタンプをFirestoreから取得
  async fetchUserStamps({ commit, rootState }) {
    const userId = rootState.auth.userId;
    if (!userId) throw new Error("User is not logged in.");
    try {
      const stamps = await getUserStamps(userId);
      commit("SET_USER_STAMPS", stamps); // ユーザーのスタンプ情報をセット
    } catch (error) {
      console.error("Failed to fetch user stamps: ", error);
    }
  },
};

const getters = {
  userStamps: (state) => state.stamps, // ユーザーが所持しているスタンプ情報を取得
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
