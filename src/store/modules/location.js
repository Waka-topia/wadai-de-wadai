/**
 * Locations Store Module
 * 場所データの管理を行う
 */

// 初期状態
const state = () => ({
  locations: [], // 場所リスト
  selectedLocation: null, // 選択された場所
  activeCategories: [], // フィルタリング用のアクティブなカテゴリIDリスト
  loading: false, // 読み込み中フラグ
  error: null, // エラーメッセージ
})

// ゲッター
const getters = {
  /**
   * 全ての場所データを取得
   *
   * @param {object} state - Vuex state
   * @returns {Array} 場所リスト
   */
  allLocations: (state) => state.locations,

  /**
   * フィルタリング適用済みの場所データを取得
   * activeCategoriesが空の場合は全て表示
   *
   * @param {object} state - Vuex state
   * @returns {Array} フィルタリングされた場所リスト
   */
  filteredLocations: (state) => {
    if (state.activeCategories.length === 0) {
      return state.locations
    }
    return state.locations.filter((location) =>
      state.activeCategories.includes(location.category),
    )
  },

  /**
   * 選択された場所を取得
   *
   * @param {object} state - Vuex state
   * @returns {object|null} 選択された場所
   */
  selectedLocation: (state) => state.selectedLocation,

  /**
   * アクティブなカテゴリリストを取得
   *
   * @param {object} state - Vuex state
   * @returns {Array} アクティブなカテゴリIDリスト
   */
  activeCategories: (state) => state.activeCategories,

  /**
   * カテゴリごとの場所数を取得
   *
   * @param {object} state - Vuex state
   * @returns {object} カテゴリIDをキー、場所数を値とするオブジェクト
   */
  locationCountByCategory: (state) => {
    const counts = {}
    state.locations.forEach((location) => {
      counts[location.category] = (counts[location.category] || 0) + 1
    })
    return counts
  },

  /**
   * 特定の場所IDに対応する場所データを取得
   *
   * @param {object} state - Vuex state
   * @returns {(id: string|number) => object|undefined} 場所IDを受け取り場所データを返す関数
   */
  getLocationById: (state) => (id) => {
    return state.locations.find((l) => l.id === id)
  },

  /**
   * 読み込み中かどうか
   *
   * @param {object} state - Vuex state
   * @returns {boolean} 読み込み中フラグ
   */
  isLoading: (state) => state.loading,

  /**
   * エラーメッセージを取得
   *
   * @param {object} state - Vuex state
   * @returns {string|null} エラーメッセージ
   */
  error: (state) => state.error,
}

// ミューテーション
const mutations = {
  /**
   * 場所リストを設定
   *
   * @param {object} state - Vuex state
   * @param {Array} locations - 場所リスト
   */
  SET_LOCATIONS(state, locations) {
    state.locations = locations
  },

  /**
   * 選択された場所を設定
   *
   * @param {object} state - Vuex state
   * @param {object|null} location - 選択された場所
   */
  SET_SELECTED_LOCATION(state, location) {
    state.selectedLocation = location
  },

  /**
   * アクティブなカテゴリを設定
   *
   * @param {object} state - Vuex state
   * @param {Array} categories - カテゴリIDリスト
   */
  SET_ACTIVE_CATEGORIES(state, categories) {
    state.activeCategories = categories
  },

  /**
   * 場所を追加
   *
   * @param {object} state - Vuex state
   * @param {object} location - 追加する場所データ
   */
  ADD_LOCATION(state, location) {
    state.locations.push(location)
  },

  /**
   * 読み込み中フラグを設定
   *
   * @param {object} state - Vuex state
   * @param {boolean} loading - 読み込み中フラグ
   */
  SET_LOADING(state, loading) {
    state.loading = loading
  },

  /**
   * エラーメッセージを設定
   *
   * @param {object} state - Vuex state
   * @param {string|null} error - エラーメッセージ
   */
  SET_ERROR(state, error) {
    state.error = error
  },

  /**
   * 状態をリセット
   *
   * @param {object} state - Vuex state
   */
  RESET_STATE(state) {
    state.locations = []
    state.selectedLocation = null
    state.activeCategories = []
    state.loading = false
    state.error = null
  },
}

// アクション
const actions = {
  /**
   * 場所データを取得する
   *
   * @param {object} context - Vuex context
   * @param {(type: string, payload?: unknown) => void} context.commit - commit function
   * @param {object} context.state - state object
   */
  // eslint-disable-next-line no-unused-vars
  async fetchLocations({ commit, state }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      // 実際の実装では locationService.fetchLocations() を呼び出す
      // 今回はダミーデータを使用するため、servicesの変更を待つか、ここで直接ダミーをセットする
      // import { fetchLocations } from '@/services/locationService'
      // const locations = await fetchLocations()

      // 仮実装: locationServiceがダミーを返す前提
      const { fetchLocations } = await import('@/services/locationService')
      const locations = await fetchLocations()

      commit('SET_LOCATIONS', locations)
    } catch (error) {
      console.error('Error fetching locations:', error)
      commit('SET_ERROR', '場所データの取得に失敗しました。')
    } finally {
      commit('SET_LOADING', false)
    }
  },

  /**
   * 場所を選択する
   *
   * @param {object} context - Vuex context
   * @param {(type: string, payload?: unknown) => void} context.commit - commit function
   * @param {object} context.getters - getters object
   * @param {string|number} locationId - 場所ID
   */
  selectLocation({ commit, getters }, locationId) {
    const location = getters.getLocationById(locationId)
    if (location) {
      commit('SET_SELECTED_LOCATION', location)
    } else {
      commit('SET_ERROR', '指定された場所が見つかりません。')
    }
  },

  /**
   * 場所の選択を解除する
   *
   * @param {object} context - Vuex context
   * @param {(type: string, payload?: unknown) => void} context.commit - commit function
   */
  clearSelection({ commit }) {
    commit('SET_SELECTED_LOCATION', null)
  },

  /**
   * アクティブなカテゴリを設定する
   * カテゴリ変更時にフィルタリングや再取得が必要な場合はここで制御
   *
   * @param {object} context - Vuex context
   * @param {(type: string, payload?: unknown) => void} context.commit - commit function
   * @param {(type: string, payload?: unknown) => Promise<unknown>} context.dispatch - dispatch function
   * @param {Array} categories - カテゴリIDリスト
   */
  // eslint-disable-next-line no-unused-vars
  setActiveCategories({ commit, dispatch }, categories) {
    commit('SET_ACTIVE_CATEGORIES', categories)
    // 必要であれば再取得などを行う
    // dispatch('fetchLocations')
  },

  /**
   * 新しい場所を追加する（管理機能用想定）
   *
   * @param {object} context - Vuex context
   * @param {(type: string, payload?: unknown) => void} context.commit - commit function
   * @param {object} location - 場所データ
   */
  async addNewLocation({ commit }, location) {
    commit('SET_LOADING', true)
    try {
      const { addLocation } = await import('@/services/locationService')
      const newLoc = await addLocation(location)
      commit('ADD_LOCATION', newLoc)
    } catch (error) {
      console.error('Error adding location:', error)
      commit('SET_ERROR', '場所の追加に失敗しました。')
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
