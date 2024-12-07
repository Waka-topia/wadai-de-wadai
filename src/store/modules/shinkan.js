import { saveNextShinkan } from "../../services/nextShinkanService";
import { getNextShinkan } from "../../services/nextShinkanService"; // インポート追加


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
    // 次の新歓情報を取得
    async fetchNextShinkan({ commit }, userId) {
        try {
          const data = await getNextShinkan(userId); // Firestoreからデータ取得
          if (data) {
            commit("setNextShinkan", data);
          }
        } catch (error) {
          console.error("Error in fetchNextShinkan action: ", error);
          throw error;
        }
    },
  },
  getters: {
    nextShinkan: (state) => state.nextShinkan,
  },
};
