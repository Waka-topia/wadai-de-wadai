import { fetchTimetable } from '@/services/lectureService'

// localStorage のキー
const SEMESTER_KEY = 'timetable_semester'
const GRADE_KEY = 'timetable_grade'
const DISPLAY_QUARTER_KEY = 'timetable_display_quarter'

const makeSemesterKey = (grade, semester) => `${grade}-${semester}`

export default {
  namespaced: true,
  state: () => ({
    // すべての学期の時間割データを保持する
    timetables: {},
    semester: localStorage.getItem(SEMESTER_KEY) || 'first',
    grade: Number(localStorage.getItem(GRADE_KEY)) || 1,
    displayQuarter: localStorage.getItem(DISPLAY_QUARTER_KEY) || 'all',
    isLoading: false,
    error: null,
    fetchedKeys: new Set(),
    currentUid: null,
  }),
  mutations: {
    /**
     * 指定されたセルの講義配列を更新する
     *
     * @param {object} state - Vuex state
     * @param {object} payload - ペイロード
     * @param {string} payload.key - 学期キー (例: "1-first")
     * @param {string} payload.cellKey - マスキー (例: "mon-1")
     * @param {Array} payload.array - 講義データの配列
     */
    SET_LECTURE_ARRAY(state, { key, cellKey, array }) {
      if (!state.timetables[key]) {
        state.timetables[key] = {}
      }
      state.timetables[key][cellKey] = array
    },
    /**
     * ローディング状態を更新する
     *
     * @param {object} state - Vuex state
     * @param {boolean} loading - ローディング中かどうか
     */
    SET_LOADING(state, loading) {
      state.isLoading = loading
    },
    /**
     * エラーメッセージを更新する
     *
     * @param {object} state - Vuex state
     * @param {string | null} error - エラーメッセージ
     */
    SET_ERROR(state, error) {
      state.error = error
    },
    /**
     * 指定された学期の全時間割データを取得する
     *
     * @param {object} state - Vuex state
     * @param {object} payload - ペイロード
     * @param {string} payload.key - 学期キー
     * @param {object} payload.timetable - 時間割データ
     */
    SET_TIMETABLE(state, { key, timetable }) {
      state.timetables[key] = { ...timetable }
    },
    /**
     * 学期を更新し、localStorageに保存する
     *
     * @param {object} state - Vuex state
     * @param {string} semester - 学期 ("first" | "second")
     */
    SET_SEMESTER(state, semester) {
      state.semester = semester
      localStorage.setItem(SEMESTER_KEY, semester)
      state.displayQuarter = 'all'
      localStorage.setItem(DISPLAY_QUARTER_KEY, 'all')
    },
    /**
     * 学年を更新し、localStorageに保存する
     *
     * @param {object} state - Vuex state
     * @param {number} grade - 学年 (1-4)
     */
    SET_GRADE(state, grade) {
      state.grade = grade
      localStorage.setItem(GRADE_KEY, String(grade))
    },
    /**
     * 表示対象のクォーターを更新し、localStorageに保存する
     *
     * @param {object} state - Vuex state
     * @param {string} quarter - クォーター ("all" | "1Q" | "2Q" | "3Q" | "4Q")
     */
    SET_DISPLAY_QUARTER(state, quarter) {
      state.displayQuarter = quarter
      localStorage.setItem(DISPLAY_QUARTER_KEY, quarter)
    },
    /**
     * 取得済みフラグをセットする
     *
     * @param {object} state - Vuex state
     * @param {string} key - 学期キー
     */
    MARK_FETCHED(state, key) {
      state.fetchedKeys = new Set(state.fetchedKeys).add(key)
    },
    /**
     * 取得済み情報のキャッシュをリセットする
     *
     * @param {object} state - Vuex state
     */
    RESET_FETCH_CACHE(state) {
      state.fetchedKeys = new Set()
      state.timetables = {}
      state.currentUid = null
    },
    /**
     * 現在ログイン中のユーザーIDをセットする
     *
     * @param {object} state - Vuex state
     * @param {string | null} uid - ユーザーID
     */
    SET_CURRENT_UID(state, uid) {
      state.currentUid = uid
    },
  },
  actions: {
    /**
     * 時間割データを取得する
     *
     * @param {object} root0 - Vuex context
     * @param {function(string, unknown=): void} root0.commit - Vuex commit
     * @param {object} root0.state - Vuex state
     * @param {object} root0.rootGetters - Vuex root getters
     * @returns {Promise<void>} 処理完了時に解決されるPromise
     */
    async fetchTimetable({ commit, state, rootGetters }) {
      const uid = rootGetters['auth/userId']
      if (!uid) return

      if (state.currentUid !== uid) {
        commit('RESET_FETCH_CACHE')
        commit('SET_CURRENT_UID', uid)
      }

      const key = makeSemesterKey(state.grade, state.semester)
      if (state.fetchedKeys.has(key)) return

      commit('SET_LOADING', true)

      try {
        const timetable = await fetchTimetable(uid, key)

        // 【修正版：あらゆるDB構造に対応する最強のマイグレーション】
        const normalized = {}
        for (const [cellKey, value] of Object.entries(timetable || {})) {
          if (!value) continue

          let arr = []
          if (Array.isArray(value)) {
            // パターンA: すでにきれいな配列 (array) として保存されている場合
            arr = value
          } else if (value.name) {
            // パターンB: 古い単一オブジェクト (mon-1のような形) の場合
            arr = [value]
          } else {
            // パターンC: Firebase特有の (map) 0: {}, 1: {} として保存されている場合 (mon-3のような形)
            arr = Object.keys(value)
              .filter((k) => !isNaN(k)) // "0", "1" などのキーを抽出
              .map((k) => value[k])
          }

          // IDが付与されていないデータにはIDを付与
          normalized[cellKey] = arr.map((lec) => ({
            ...lec,
            id: lec.id || Math.random().toString(36).substr(2, 9),
          }))
        }

        commit('SET_TIMETABLE', { key, timetable: normalized })
        commit('MARK_FETCHED', key)
      } catch (e) {
        console.error('[Timetable Fetch Error]:', e)
        commit('SET_ERROR', e.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },

    /**
     * キャッシュをリセットする
     *
     * @param {object} root0 - Vuex context
     * @param {function(string, unknown=): void} root0.commit - Vuex commit
     */
    resetCache({ commit }) {
      commit('RESET_FETCH_CACHE')
    },

    /**
     * 学期を切り替えてデータを再取得する
     *
     * @param {object} root0 - Vuex context
     * @param {function(string, unknown=): void} root0.commit - Vuex commit
     * @param {function(string, unknown=): Promise<unknown>} root0.dispatch - Vuex dispatch
     * @param {string} semester - 学期
     */
    async switchSemester({ commit, dispatch }, semester) {
      commit('SET_SEMESTER', semester)
      await dispatch('fetchTimetable')
    },

    /**
     * 学年を切り替えてデータを再取得する
     *
     * @param {object} root0 - Vuex context
     * @param {function(string, unknown=): void} root0.commit - Vuex commit
     * @param {function(string, unknown=): Promise<unknown>} root0.dispatch - Vuex dispatch
     * @param {number} grade - 学年
     */
    async switchGrade({ commit, dispatch }, grade) {
      commit('SET_GRADE', grade)
      await dispatch('fetchTimetable')
    },

    /**
     * 講義データを保存する
     *
     * @param {object} root0 - Vuex context
     * @param {function(string, unknown=): void} root0.commit - Vuex commit
     * @param {object} root0.state - Vuex state
     * @param {object} root0.rootGetters - Vuex root getters
     * @param {object} payload - ペイロード
     * @param {string} payload.day - 曜日
     * @param {number[]} [payload.periods] - 時限の配列
     * @param {number} [payload.period] - 時限 (単一の場合)
     * @param {object} payload.lecture - 講義データ
     */
    async saveLecture({ commit, state, rootGetters }, payload) {
      const uid = rootGetters['auth/userId']
      const key = makeSemesterKey(state.grade, state.semester)
      const { day, periods, period, lecture } = payload

      // 保存する講義データにIDが付与されていなければ生成
      const lecToSave = { ...lecture, id: lecture.id || Math.random().toString(36).substr(2, 9) }
      const targetPeriods = periods && periods.length > 0 ? periods : [period]

      // 更新するマスの配列を用意して楽観的UI更新
      const arraysToSave = targetPeriods.map((p) => {
        const cellKey = `${day}-${p}`
        const existingArray = state.timetables[key]?.[cellKey] || []
        const newArray = [...existingArray]
        const idx = newArray.findIndex((l) => l.id === lecToSave.id)

        // 既存のIDがあれば上書き、なければ追加
        if (idx >= 0) newArray[idx] = lecToSave
        else newArray.push(lecToSave)

        commit('SET_LECTURE_ARRAY', { key, cellKey, array: newArray })
        return { p, newArray }
      })

      try {
        if (uid) {
          const { saveLecture: save } = await import('@/services/lectureService')
          await Promise.all(
            arraysToSave.map(({ p, newArray }) => {
              // ★最重要修正: VueのProxyオブジェクトをディープコピーして純粋なJSの配列に戻す
              const cleanArray = JSON.parse(JSON.stringify(newArray))
              return save(uid, key, day, p, cleanArray)
            }),
          )
        }
      } catch (e) {
        console.error('[Timetable Save Error]:', e)
        commit('SET_ERROR', e.message)
      }
    },

    /**
     * 講義データを削除する
     *
     * @param {object} root0 - Vuex context
     * @param {function(string, unknown=): void} root0.commit - Vuex commit
     * @param {object} root0.state - Vuex state
     * @param {object} root0.rootGetters - Vuex root getters
     * @param {object} payload - ペイロード
     * @param {string} payload.day - 曜日
     * @param {number[]} [payload.periods] - 時限の配列
     * @param {number} [payload.period] - 時限 (単一の場合)
     * @param {string} payload.lectureId - 削除対象の講義ID
     */
    async removeLecture({ commit, state, rootGetters }, payload) {
      const uid = rootGetters['auth/userId']
      const key = makeSemesterKey(state.grade, state.semester)
      const { day, periods, period, lectureId } = payload
      const targetPeriods = periods && periods.length > 0 ? periods : [period]

      const updates = targetPeriods.map((p) => {
        const cellKey = `${day}-${p}`
        const existingArray = state.timetables[key]?.[cellKey] || []
        // 指定されたIDを除外した新しい配列を作成
        const newArray = existingArray.filter((l) => l.id !== lectureId)

        commit('SET_LECTURE_ARRAY', { key, cellKey, array: newArray })
        return { p, newArray }
      })

      try {
        if (uid) {
          const { saveLecture: save, deleteLecture } = await import('@/services/lectureService')
          await Promise.all(
            updates.map(({ p, newArray }) => {
              // 配列が空になった場合はドキュメント自体を削除する
              if (newArray.length === 0) return deleteLecture(uid, key, day, p)
              else {
                // ★最重要修正: 削除時も同様にProxyを解除
                const cleanArray = JSON.parse(JSON.stringify(newArray))
                return save(uid, key, day, p, cleanArray)
              }
            }),
          )
        }
      } catch (e) {
        console.error('[Timetable Remove Error]:', e)
        commit('SET_ERROR', e.message)
      }
    },
  },
  getters: {
    /**
     * 現在の学期の全時間割データを取得する
     *
     * @param {object} state - Vuex state
     * @returns {object} 時間割データ
     */
    fullTimetable: (state) => state.timetables[`${state.grade}-${state.semester}`] || {},

    /**
     * 表示対象のクォーターでフィルタリングされた時間割データを取得する
     *
     * @param {object} state - Vuex state
     * @param {object} getters - Vuex getters
     * @returns {object} フィルタリングされた時間割データ
     */
    currentTimetable: (state, getters) => {
      const full = getters.fullTimetable
      const displayQuarter = state.displayQuarter || 'all'
      const filtered = {}

      for (const [cellKey, lectureArray] of Object.entries(full)) {
        let validLectures = lectureArray || []
        if (displayQuarter !== 'all') {
          validLectures = validLectures.filter((lec) => {
            return (
              !lec.quarters || lec.quarters.length === 0 || lec.quarters.includes(displayQuarter)
            )
          })
        }
        if (validLectures.length > 0) filtered[cellKey] = validLectures
      }
      return filtered
    },

    /**
     * 1コマの講義データを取得する (クォーター順にソートして返す)
     *
     * @param {object} state - Vuex state
     * @param {object} getters - Vuex getters
     * @returns {function(string, number): (object)[]} 指定された曜日・時限の講義を取得する関数
     */
    getLectures: (state, getters) => (day, period) => {
      const lectures = getters.currentTimetable[`${day}-${period}`] || []

      // 元の配列を汚さずにソート（1Qが一番上に来るようにする）
      return [...lectures].sort((a, b) => {
        const getMinQuarterNum = (quarters) => {
          if (!Array.isArray(quarters) || quarters.length === 0) return 99
          const nums = quarters
            .map((q) => parseInt(q.replace(/\D/g, ''), 10))
            .filter((n) => !isNaN(n))
          return nums.length > 0 ? Math.min(...nums) : 99
        }
        return getMinQuarterNum(a.quarters) - getMinQuarterNum(b.quarters)
      })
    },

    /**
     * ローディング中かどうかを取得する
     *
     * @param {object} state - Vuex state
     * @returns {boolean} ローディング中かどうか
     */
    isLoading: (state) => state.isLoading,
    /**
     * 表示対象の学期を取得する
     *
     * @param {object} state - Vuex state
     * @returns {string} 学期
     */
    semester: (state) => state.semester,
    /**
     * 表示対象の学年を取得する
     *
     * @param {object} state - Vuex state
     * @returns {number} 学年
     */
    grade: (state) => state.grade,

    /**
     * 今日の講義一覧を取得する
     *
     * @param {object} state - Vuex state
     * @param {object} getters - Vuex getters
     * @returns {object[]} 今日の講義データの配列
     */
    todayLectures: (state, getters) => {
      const dayMap = { 0: null, 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: null }
      const todayCode = dayMap[new Date().getDay()]
      if (!todayCode) return []

      return [1, 2, 3, 4, 5, 6]
        .flatMap((period) => {
          const arr = getters.currentTimetable[`${todayCode}-${period}`] || []
          return arr.map((lecture) => ({ ...lecture, period }))
        })
        .filter(Boolean)
    },

    /**
     * 合計単位数を計算する
     *
     * @param {object} state - Vuex state
     * @param {object} getters - Vuex getters
     * @returns {number} 合計単位数
     */
    totalCredits: (state, getters) => {
      // 同じIDの講義（連続コマ等）が複数あっても1つとしてカウントする
      const uniqueLectures = new Map()
      Object.values(getters.fullTimetable).forEach((arr) => {
        arr.forEach((l) => uniqueLectures.set(l.id, l))
      })
      return Array.from(uniqueLectures.values()).reduce(
        (sum, l) => sum + (Number(l.credits) || 0),
        0,
      )
    },
  },
}
