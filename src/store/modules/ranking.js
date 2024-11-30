import rankingService from "../../services/rankingService";

export default {
  namespaced: true,
  state: {
    rankings: [], // ランキングデータ
    loading: false, // ローディング状態
    error: null, // エラー状態
  },
  mutations: {
    setRankings(state, rankings) {
      state.rankings = rankings; // ランキングデータをセット
    },
    setLoading(state, isLoading) {
      state.loading = isLoading; // ローディング状態をセット
    },
    setError(state, error) {
      state.error = error; // エラー状態をセット
    },
  },
  actions: {
    async fetchRankings({ commit }) {
      commit("setLoading", true); // ローディング開始
      commit("setError", null); // エラーをリセット

      try {
        // ランキングデータを取得
        const rankings = await rankingService.getUserRanking();
        commit("setRankings", rankings); // 取得したランキングをセット
      } catch (error) {
        commit("setError", error); // エラーが発生した場合はエラーハンドリング
        console.error("Failed to fetch rankings:", error);
      } finally {
        commit("setLoading", false); // ローディング終了
      }
    },
  },
  getters: {
    rankings: (state) => state.rankings, // ランキングデータのゲッター
    isLoading: (state) => state.loading, // ローディング状態のゲッター
    error: (state) => state.error, // エラー状態のゲッター
  },
};
