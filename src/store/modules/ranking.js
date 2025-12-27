import rankingService from '../../services/rankingService' // rankingServiceをインポート

export default {
  namespaced: true,
  state: {
    rankings: [], // ランキングデータ
    myRanking: null, // 自分のランキング
    loading: false, // ローディング状態
    error: null, // エラー状態
  },
  mutations: {
    setRankings(state, rankings) {
      state.rankings = rankings // ランキングデータをセット
    },
    setMyRanking(state, ranking) {
      state.myRanking = ranking // 自分のランキングをセット
    },
    setLoading(state, isLoading) {
      state.loading = isLoading // ローディング状態をセット
    },
    setError(state, error) {
      state.error = error // エラー状態をセット
    },
  },
  actions: {
    async fetchRankings({ commit }) {
      commit('setLoading', true) // ローディング開始
      commit('setError', null) // エラーをリセット

      try {
        const rankings = await rankingService.getUserRanking()
        commit('setRankings', rankings) // 取得したランキングをセット
      } catch (error) {
        commit('setError', error) // エラーが発生した場合はエラーハンドリング
        console.error('Failed to fetch rankings:', error)
      } finally {
        commit('setLoading', false) // ローディング終了
      }
    },
    async getMyRanking({ commit, rootState }) {
      commit('setLoading', true) // ローディング開始
      commit('setError', null) // エラーをリセット

      try {
        const userId = rootState.auth.userId // 現在のユーザーIDを取得
        const myRanking = await rankingService.getMyRanking(userId) // サービスからデータ取得
        commit('setMyRanking', myRanking) // 自分のランキングをセット
      } catch (error) {
        commit('setError', error) // エラーが発生した場合はエラーハンドリング
        console.error('Error fetching my ranking:', error)
      } finally {
        commit('setLoading', false) // ローディング終了
      }
    },
  },
  getters: {
    rankings: (state) => state.rankings, // ランキングデータのゲッター
    myRanking: (state) => state.myRanking, // 自分のランキングのゲッター
    isLoading: (state) => state.loading, // ローディング状態のゲッター
    error: (state) => state.error, // エラー状態のゲッター
  },
}
