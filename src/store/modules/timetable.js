export default {
  namespaced: true,
  state: () => ({
    // ユーザーの時間割データ
    // key: "day-period" (ex: "mon-1"), value: lecture object
    userTimetable: {},
    isLoading: false,
    error: null,
  }),
  mutations: {
    SET_LECTURE(state, { day, period, lecture }) {
      state.userTimetable[`${day}-${period}`] = lecture
    },
    REMOVE_LECTURE(state, { day, period }) {
      delete state.userTimetable[`${day}-${period}`]
    },
    SET_LOADING(state, loading) {
      state.isLoading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    SET_TIMETABLE(state, timetable) {
      state.userTimetable = timetable
    },
  },
  actions: {
    // 将来的に Firestore との連携ロジックをここに追加
    async saveLecture({ commit }, payload) {
      commit('SET_LOADING', true)
      try {
        // 仮の実装（現在はローカルのみ）
        commit('SET_LECTURE', payload)
      } catch (e) {
        commit('SET_ERROR', e.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
  },
  getters: {
    getLecture: (state) => (day, period) => {
      return state.userTimetable[`${day}-${period}`] || null
    },
    fullTimetable: (state) => state.userTimetable,
  },
}
