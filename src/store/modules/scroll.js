/**
 * Scroll Position Store Module
 * ページ遷移時のスクロール位置を保存・復元
 */

const state = {
  scrollPositions: {}, // { path: scrollTop }
}

const getters = {
  /**
   * 特定のパスのスクロール位置を取得
   *
   * @param {object} state - Vuexステート
   * @returns {Function} パスを受け取りスクロール位置を返す関数
   */
  getScrollPosition: (state) => (path) => {
    return state.scrollPositions[path] || 0
  },
}

const mutations = {
  /**
   * スクロール位置を保存
   *
   * @param {object} state - Vuexステート
   * @param {object} payload - ペイロード
   * @param {string} payload.path - パス
   * @param {number} payload.scrollTop - スクロール位置
   */
  SET_SCROLL_POSITION(state, { path, scrollTop }) {
    state.scrollPositions[path] = scrollTop
  },

  /**
   * スクロール位置をクリア
   *
   * @param {object} state - Vuexステート
   * @param {string} path - パス
   */
  CLEAR_SCROLL_POSITION(state, path) {
    delete state.scrollPositions[path]
  },

  /**
   * 全てのスクロール位置をクリア
   *
   * @param {object} state - Vuexステート
   */
  CLEAR_ALL_SCROLL_POSITIONS(state) {
    state.scrollPositions = {}
  },
}

const actions = {
  /**
   * スクロール位置を保存
   *
   * @param {object} context - Vuexコンテキスト
   * @param {object} context.commit - コミット関数
   * @param {object} payload - ペイロード
   */
  saveScrollPosition({ commit }, payload) {
    commit('SET_SCROLL_POSITION', payload)
  },

  /**
   * スクロール位置を復元
   *
   * @param {object} context - Vuexコンテキスト
   * @param {object} context.getters - ゲッター
   * @param {string} path - パス
   * @returns {number} スクロール位置
   */
  restoreScrollPosition({ getters }, path) {
    return getters.getScrollPosition(path)
  },

  /**
   * スクロール位置をクリア
   *
   * @param {object} context - Vuexコンテキスト
   * @param {object} context.commit - コミット関数
   * @param {string} path - パス
   */
  clearScrollPosition({ commit }, path) {
    commit('CLEAR_SCROLL_POSITION', path)
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}
