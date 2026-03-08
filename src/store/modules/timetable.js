import * as lectureService from '@/services/lectureService'

export default {
  namespaced: true,
  state: () => ({
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
    /** ログイン後に呼び出してFirestoreから時間割を取得 */
    async fetchTimetable({ commit, rootGetters }) {
      const uid = rootGetters['auth/userId']
      if (!uid) return
      commit('SET_LOADING', true)
      try {
        const timetable = await lectureService.fetchTimetable(uid)
        commit('SET_TIMETABLE', timetable)
      } catch (e) {
        commit('SET_ERROR', e.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },

    /** 講義を保存（Firestore + ローカル状態を同時更新） */
    async saveLecture({ commit, rootGetters }, { day, period, lecture }) {
      const uid = rootGetters['auth/userId']
      commit('SET_LOADING', true)
      try {
        if (uid) {
          await lectureService.saveLecture(uid, day, period, lecture)
        }
        commit('SET_LECTURE', { day, period, lecture })
      } catch (e) {
        commit('SET_ERROR', e.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },

    /** 講義を削除（Firestore + ローカル状態を同時更新） */
    async removeLecture({ commit, rootGetters }, { day, period }) {
      const uid = rootGetters['auth/userId']
      try {
        if (uid) {
          await lectureService.deleteLecture(uid, day, period)
        }
        commit('REMOVE_LECTURE', { day, period })
      } catch (e) {
        commit('SET_ERROR', e.message)
      }
    },
  },
  getters: {
    getLecture: (state) => (day, period) => {
      return state.userTimetable[`${day}-${period}`] || null
    },
    fullTimetable: (state) => state.userTimetable,
    isLoading: (state) => state.isLoading,
  },
}
