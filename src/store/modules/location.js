import { fetchLocations, fetchLocationById, addLocation } from '@/services/locationService'

/**
 * Location Store Module
 * 場所データ(トイレ、勉強スポット等)の状態管理
 */

const state = {
  locations: [], // 全場所データ
  selectedLocation: null, // 選択中の場所
  activeCategories: ['all'], // アクティブなカテゴリーフィルター
  loading: false,
  error: null,
}

const getters = {
  /**
   * フィルター適用後の場所リストを取得
   *
   * @param state
   */
  filteredLocations: (state) => {
    if (state.activeCategories.includes('all')) {
      return state.locations
    }
    return state.locations.filter((loc) => state.activeCategories.includes(loc.category))
  },

  /**
   * カテゴリー別の場所数を取得
   *
   * @param state
   */
  locationCountByCategory: (state) => {
    const counts = {}
    state.locations.forEach((loc) => {
      counts[loc.category] = (counts[loc.category] || 0) + 1
    })
    return counts
  },

  /**
   * 選択中の場所を取得
   *
   * @param state
   */
  selectedLocation: (state) => state.selectedLocation,

  /**
   * ローディング状態を取得
   *
   * @param state
   */
  isLoading: (state) => state.loading,
}

const mutations = {
  /**
   * 場所リストをセット
   *
   * @param state
   * @param locations
   */
  SET_LOCATIONS(state, locations) {
    state.locations = locations
  },

  /**
   * 選択中の場所をセット
   *
   * @param state
   * @param location
   */
  SET_SELECTED_LOCATION(state, location) {
    state.selectedLocation = location
  },

  /**
   * アクティブなカテゴリーをセット
   *
   * @param state
   * @param categories
   */
  SET_ACTIVE_CATEGORIES(state, categories) {
    state.activeCategories = categories
  },

  /**
   * 場所を追加
   *
   * @param state
   * @param location
   */
  ADD_LOCATION(state, location) {
    state.locations.push(location)
  },

  /**
   * ローディング状態をセット
   *
   * @param state
   * @param loading
   */
  SET_LOADING(state, loading) {
    state.loading = loading
  },

  /**
   * エラーをセット
   *
   * @param state
   * @param error
   */
  SET_ERROR(state, error) {
    state.error = error
  },

  /**
   * 状態をリセット
   *
   * @param state
   */
  RESET_STATE(state) {
    state.locations = []
    state.selectedLocation = null
    state.activeCategories = ['all']
    state.loading = false
    state.error = null
  },
}

const actions = {
  /**
   * 場所データを取得
   *
   * @param root0
   * @param root0.commit
   * @param root0.state
   */
  async fetchLocations({ commit, state }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)

    try {
      const categories = state.activeCategories.includes('all') ? [] : state.activeCategories
      const locations = await fetchLocations(categories)
      commit('SET_LOCATIONS', locations)
    } catch (error) {
      console.error('場所データの取得に失敗しました:', error)
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },

  /**
   * 特定の場所を選択
   *
   * @param root0
   * @param root0.commit
   * @param locationId
   */
  async selectLocation({ commit }, locationId) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)

    try {
      const location = await fetchLocationById(locationId)
      commit('SET_SELECTED_LOCATION', location)
    } catch (error) {
      console.error('場所の取得に失敗しました:', error)
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },

  /**
   * 場所の選択を解除
   *
   * @param root0
   * @param root0.commit
   */
  clearSelectedLocation({ commit }) {
    commit('SET_SELECTED_LOCATION', null)
  },

  /**
   * カテゴリーフィルターを設定
   *
   * @param root0
   * @param root0.commit
   * @param root0.dispatch
   * @param categories
   */
  setActiveCategories({ commit, dispatch }, categories) {
    commit('SET_ACTIVE_CATEGORIES', categories)
    // フィルター変更後、場所データを再取得
    dispatch('fetchLocations')
  },

  /**
   * 新規場所を追加(管理者用)
   *
   * @param root0
   * @param root0.commit
   * @param location
   */
  async addLocation({ commit }, location) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)

    try {
      const newLocation = await addLocation(location)
      commit('ADD_LOCATION', newLocation)
      return newLocation
    } catch (error) {
      console.error('場所の追加に失敗しました:', error)
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}
