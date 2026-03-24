import { fetchTimetable } from '@/services/lectureService'

// localStorage のキー
const SEMESTER_KEY = 'timetable_semester'
const GRADE_KEY = 'timetable_grade'

/**
 * 学年と学期からFirestoreキーを生成する
 *
 * @param {number} grade - 学年 (1〜4)
 * @param {string} semester - 学期コード ('first' | 'second')
 * @returns {string} Firestoreコレクションキー 例: '1-first'
 */
const makeSemesterKey = (grade, semester) => `${grade}-${semester}`

export default {
  namespaced: true,
  state: () => ({
    userTimetable: {},
    semester: localStorage.getItem(SEMESTER_KEY) || 'first',
    grade: Number(localStorage.getItem(GRADE_KEY)) || 1,
    isLoading: false,
    error: null,
    /**
     * フェッチ済みキーのセット。keep-alive でキャッシュが生きている間は
     * 同じキーの再フェッチをスキップする。
     * Set<string>  例: Set{'1-first', '2-second'}
     */
    fetchedKeys: new Set(),
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
      state.userTimetable = { ...timetable }
    },
    SET_SEMESTER(state, semester) {
      state.semester = semester
      localStorage.setItem(SEMESTER_KEY, semester)
    },
    SET_GRADE(state, grade) {
      state.grade = grade
      localStorage.setItem(GRADE_KEY, String(grade))
    },
    MARK_FETCHED(state, key) {
      state.fetchedKeys = new Set(state.fetchedKeys).add(key)
    },
    RESET_FETCH_CACHE(state) {
      state.fetchedKeys = new Set()
    },
  },
  actions: {
    /**
     * 時間割を取得する（getDocs ベース）
     * keep-alive キャッシュが有効な場合はスキップする。
     *
     * @param {object} root0 - Vuexコンテキスト
     * @param {import('vuex').Commit} root0.commit - ミューテーション
     * @param {import('vuex').State} root0.state - ストアのstate
     * @param {object} root0.rootGetters - ルートゲッター
     */
    async fetchTimetable({ commit, state, rootGetters }) {
      const uid = rootGetters['auth/userId']
      if (!uid) return

      const key = makeSemesterKey(state.grade, state.semester)

      // keep-alive キャッシュが有効ならスキップ
      if (state.fetchedKeys.has(key)) return

      commit('SET_LOADING', true)
      commit('SET_TIMETABLE', {})

      try {
        const timetable = await fetchTimetable(uid, key)
        commit('SET_TIMETABLE', timetable)
        commit('MARK_FETCHED', key)
      } catch (e) {
        commit('SET_ERROR', e.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },

    /**
     * ログアウト時やユーザー切り替え時にキャッシュを全削除する
     *
     * @param {object} root0 - Vuexコンテキスト
     * @param {import('vuex').Commit} root0.commit - ミューテーション
     */
    resetCache({ commit }) {
      commit('RESET_FETCH_CACHE')
      commit('SET_TIMETABLE', {})
    },

    /**
     * 学期を切り替える
     *
     * @param {object} root0 - Vuexコンテキスト
     * @param {import('vuex').Commit} root0.commit - ミューテーション
     * @param {import('vuex').Dispatch} root0.dispatch - ディスパッチ
     * @param {string} semester - 学期コード ('first' | 'second')
     */
    async switchSemester({ commit, dispatch }, semester) {
      commit('SET_SEMESTER', semester)
      await dispatch('fetchTimetable')
    },

    /**
     * 学年を切り替える
     *
     * @param {object} root0 - Vuexコンテキスト
     * @param {import('vuex').Commit} root0.commit - ミューテーション
     * @param {import('vuex').Dispatch} root0.dispatch - ディスパッチ
     * @param {number} grade - 学年 (1〜4)
     */
    async switchGrade({ commit, dispatch }, grade) {
      commit('SET_GRADE', grade)
      await dispatch('fetchTimetable')
    },

    /**
     * 講義を保存（Firestore + ローカル状態を楽観的更新）
     *
     * @param {object} root0 - Vuexコンテキスト
     * @param {import('vuex').Commit} root0.commit - ミューテーション
     * @param {import('vuex').State} root0.state - ストアのstate
     * @param {object} root0.rootGetters - ルートゲッター
     * @param {object} root1 - ペイロード
     * @param {string} root1.day - 曜日コード
     * @param {number} root1.period - 時限
     * @param {object} root1.lecture - 保存する講義データ
     */
    async saveLecture({ commit, state, rootGetters }, { day, period, lecture }) {
      const uid = rootGetters['auth/userId']
      // 楽観的UI更新：Firestore完了前にローカル反映
      commit('SET_LECTURE', { day, period, lecture })
      try {
        if (uid) {
          const { saveLecture: save } = await import('@/services/lectureService')
          const key = makeSemesterKey(state.grade, state.semester)
          await save(uid, key, day, period, lecture)
        }
      } catch (e) {
        commit('SET_ERROR', e.message)
      }
    },

    /**
     * 講義を削除（楽観的更新）
     *
     * @param {object} root0 - Vuexコンテキスト
     * @param {import('vuex').Commit} root0.commit - ミューテーション
     * @param {import('vuex').State} root0.state - ストアのstate
     * @param {object} root0.rootGetters - ルートゲッター
     * @param {object} root1 - ペイロード
     * @param {string} root1.day - 曜日コード
     * @param {number} root1.period - 時限
     */
    async removeLecture({ commit, state, rootGetters }, { day, period }) {
      const uid = rootGetters['auth/userId']
      // 楽観的UI更新
      commit('REMOVE_LECTURE', { day, period })
      try {
        if (uid) {
          const { deleteLecture } = await import('@/services/lectureService')
          const key = makeSemesterKey(state.grade, state.semester)
          await deleteLecture(uid, key, day, period)
        }
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
    semester: (state) => state.semester,
    grade: (state) => state.grade,
    /**
     * 今日の授業リスト
     *
     * @param {object} state - ストアのstate
     * @returns {Array} 今日の講義の配列
     */
    todayLectures: (state) => {
      const dayMap = { 0: null, 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: null }
      const todayCode = dayMap[new Date().getDay()]
      if (!todayCode) return []
      return [1, 2, 3, 4, 5]
        .map((period) => {
          const lecture = state.userTimetable[`${todayCode}-${period}`]
          return lecture ? { ...lecture, period } : null
        })
        .filter(Boolean)
    },
    /**
     * 合計単位数
     *
     * @param {object} state - ストアのstate
     * @returns {number} 取得単位の合計
     */
    totalCredits: (state) => {
      return Object.values(state.userTimetable).reduce((sum, l) => sum + (Number(l.credits) || 0), 0)
    },
  },
}
