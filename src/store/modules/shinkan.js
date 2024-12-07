import { saveNextShinkan } from "../../services/nextShinkanService";

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
        await saveNextShinkan(userId, groupName, nextDate);
        commit("setNextShinkan", { groupName, nextDate });
      } catch (error) {
        console.error("Error in saveNextShinkan action: ", error);
        throw error;
      }
    },
  },
  getters: {
    nextShinkan: (state) => state.nextShinkan,
  },
};
