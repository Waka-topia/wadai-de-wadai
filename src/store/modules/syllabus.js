import {
  fetchMasterIndex as fetchMasterIndexService,
  saveSyllabusWithIndex,
} from '@/services/lectureIndexService'
import { normalizeLectureName } from '@/utils/lectureNormalizer'

const state = {
  masterIndex: { l: [], updatedAt: null },
  searchResults: [],
  isLoading: false, // fetchMasterIndex のローディング
  isSearching: false, // searchLectures のローディング
  error: null, // エラーメッセージ（null = エラーなし）
  isFetched: false, // 一度取得済みかを管理するフラグ（重複取得防止）
}

const mutations = {
  SET_MASTER_INDEX: (state, index) => {
    state.masterIndex = index
  },
  SET_SEARCH_RESULTS: (state, results) => {
    state.searchResults = results
  },
  SET_IS_LOADING: (state, bool) => {
    state.isLoading = bool
  },
  SET_IS_SEARCHING: (state, bool) => {
    state.isSearching = bool
  },
  SET_ERROR: (state, message) => {
    state.error = message
  },
  SET_IS_FETCHED: (state, bool) => {
    state.isFetched = bool
  },
}

const actions = {
  // マスターインデックスを取得する。すでに取得済み（isFetched === true）の場合は何もしない
  fetchMasterIndex: async ({ commit, state }) => {
    if (state.isFetched) return
    commit('SET_ERROR', null)
    commit('SET_IS_LOADING', true)
    try {
      const data = await fetchMasterIndexService()
      commit('SET_MASTER_INDEX', data)
      commit('SET_IS_FETCHED', true)
    } catch (error) {
      console.error('Failed to fetch master index:', error)
      commit('SET_ERROR', 'データの読み込みに失敗しました。再度お試しください。')
    } finally {
      commit('SET_IS_LOADING', false)
    }
  },

  // クエリでマスターインデックスをフィルタリングし、検索結果をストアに保存する
  // インデックスの形式 { id, n, t, b, c, g } -> 表示形式 { name, teacher, room, credits, categories }
  searchLectures: ({ commit, state }, query) => {
    commit('SET_ERROR', null)
    commit('SET_IS_SEARCHING', true)
    try {
      const normalizedQuery = normalizeLectureName(query)
      const results = state.masterIndex.l
        .filter((item) => item.id.includes(query) || item.n.includes(normalizedQuery))
        .map((item) => ({
          name: item.id,
          teacher: item.t,
          room: item.b,
          credits: item.c,
          categories: item.g || [],
          count: 0, // 今後必要ならインデックスに含める
        }))
      commit('SET_SEARCH_RESULTS', results)
    } catch (error) {
      console.error('Failed to search lectures:', error)
      commit('SET_ERROR', '検索中にエラーが発生しました。再度お試しください。')
    } finally {
      commit('SET_IS_SEARCHING', false)
    }
  },

  // シラバスをマスターデータに登録し、インデックスを再取得する
  registerSyllabus: async ({ commit, dispatch, rootGetters }, { lectureName, syllabusData }) => {
    const uid = rootGetters['auth/userId']
    const displayName = rootGetters['auth/displayName'] || '匿名ユーザー'
    commit('SET_ERROR', null)
    try {
      await saveSyllabusWithIndex(lectureName, syllabusData, uid, displayName)
      // 登録後はキャッシュを無効化して最新インデックスを再取得
      commit('SET_IS_FETCHED', false)
      await dispatch('fetchMasterIndex')
    } catch (error) {
      console.error('Failed to register syllabus:', error)
      commit('SET_ERROR', 'シラバスの登録に失敗しました。再度お試しください。')
      throw error
    }
  },
}

const getters = {
  masterIndexList: (state) => state.masterIndex.l,
  searchResults: (state) => state.searchResults,
  isLoading: (state) => state.isLoading,
  isSearching: (state) => state.isSearching,
  error: (state) => state.error,
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
}
