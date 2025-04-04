import { getNextShinkan, saveNextShinkan } from "../../services/nextShinkanService";

export default {
  namespaced: true,
  state: {
    nextShinkan: {
      groupName: "",
      nextDate: null,
    },
  },
  mutations: {
    setNextShinkan(state, { groupName, nextDate }) {
      state.nextShinkan.groupName = groupName;
      state.nextShinkan.nextDate = nextDate;
    },
    clearNextShinkan(state) {
      state.nextShinkan = { groupName: "", nextDate: null };
    },
  },
  actions: {
    async saveNextShinkan({ commit }, { userId, groupName, nextDate }) {
      try {
        await saveNextShinkan(userId, groupName, nextDate); // Firestoreにデータ保存
        commit("setNextShinkan", { groupName, nextDate }); // Vuexのstateにセット
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async fetchNextShinkan({ commit }, userId) {
      try {
        const data = await getNextShinkan(userId); // Firestoreからデータ取得
        commit("setNextShinkan", data); // Vuexのstateにセット
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
  getters: {
    nextShinkan: (state) => state.nextShinkan,
  },
};
