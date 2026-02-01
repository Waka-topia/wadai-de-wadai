import { calculateAverageRating } from '@/utils/ratingCalculator'

/**
 * Rating Store Module
 * 評価データの管理を行う
 */

// 初期状態
const state = () => ({
  ratings: {}, // locationIdをキーとした評価リスト { locationId: [rating1, rating2] }
  userRatings: [], // ユーザー自身の評価履歴
  loading: false,
  error: null,
})

// ゲッター
const getters = {
  /**
   * 特定の場所の評価リストを取得
   *
   * @param {object} state - Vuex state
   * @returns {(locationId: string) => Array<object>} locationIdを受け取り評価リストを返す関数
   */
  getRatingsByLocationID: (state) => (locationId) => {
    return state.ratings[locationId] || []
  },

  /**
   * 特定の場所の平均評価を取得
   *
   * @param {object} state - Vuex state
   * @returns {(locationId: string) => number} locationIdを受け取り平均評価（数値）を返す関数
   */
  getAverageRating: (state) => (locationId) => {
    const ratings = state.ratings[locationId] || []
    return calculateAverageRating(ratings)
  },

  /**
   * 特定の場所の評価数を取得
   *
   * @param {object} state - Vuex state
   * @returns {(locationId: string) => number} locationIdを受け取り評価数を返す関数
   */
  getRatingCount: (state) => (locationId) => {
    return (state.ratings[locationId] || []).length
  },

  /**
   * ユーザーの評価履歴を取得
   *
   * @param {object} state - Vuex state
   * @returns {Array} ユーザーの評価リスト
   */
  userRatings: (state) => state.userRatings,

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

  /**
   * 特定の場所の各カテゴリごとの平均スコアを取得
   * (トイレ: 清潔さなど、勉強: 静かさなど)
   *
   * @param {object} state - Vuex state
   * @returns {(locationId: string) => object|null} locationIdを受け取り項目の平均スコアオブジェクトを返す関数
   */
  getCategoryScores: (state) => (locationId) => {
    const ratings = state.ratings[locationId] || []
    if (ratings.length === 0) return null

    // カテゴリごとの合計を計算
    const totals = {}
    const count = ratings.length

    ratings.forEach((rating) => {
      if (rating.scores) {
        Object.keys(rating.scores).forEach((key) => {
          totals[key] = (totals[key] || 0) + rating.scores[key]
        })
      }
    })

    // 平均を計算
    const averages = {}
    Object.keys(totals).forEach((key) => {
      averages[key] = Math.round((totals[key] / count) * 10) / 10 // 小数点第1位まで
    })

    return averages
  },
}

// ミューテーション
const mutations = {
  /**
   * 特定の場所の評価リストを設定
   *
   * @param {object} state - Vuex state
   * @param {object} payload - ペイロード
   * @param {string} payload.locationId - 場所ID
   * @param {Array} payload.ratings - 評価リスト
   */
  SET_RATINGS(state, { locationId, ratings }) {
    // リアクティブ性を保つために新しいオブジェクトを作成
    state.ratings = {
      ...state.ratings,
      [locationId]: ratings,
    }
  },

  /**
   * 特定の場所に新しい評価を追加
   *
   * @param {object} state - Vuex state
   * @param {object} payload - ペイロード
   * @param {string} payload.locationId - 場所ID
   * @param {object} payload.rating - 追加する評価データ
   */
  ADD_RATING(state, { locationId, rating }) {
    const currentRatings = state.ratings[locationId] || []
    state.ratings = {
      ...state.ratings,
      [locationId]: [rating, ...currentRatings], // 新しい評価を先頭に
    }
  },

  /**
   * ユーザーの評価履歴を設定
   *
   * @param {object} state - Vuex state
   * @param {Array} ratings - 評価リスト
   */
  SET_USER_RATINGS(state, ratings) {
    state.userRatings = ratings
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
    state.ratings = {}
    state.userRatings = []
    state.loading = false
    state.error = null
  },
}

// アクション
const actions = {
  /**
   * 特定の場所の評価を取得
   *
   * @param {object} context - Vuex context
   * @param {(type: string, payload?: unknown) => void} context.commit - commit function
   * @param {string} locationId - 場所ID
   */
  async fetchRatingsByLocation({ commit }, locationId) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      // 実際の実装: ratingServiceを使用
      // const ratings = await fetchRatings(locationId)

      // 仮実装: ダミーデータ
      const { fetchRatings } = await import('@/services/ratingService')
      const ratings = await fetchRatings(locationId)

      commit('SET_RATINGS', { locationId, ratings })
    } catch (error) {
      console.error('Error fetching ratings:', error)
      commit('SET_ERROR', '評価データの取得に失敗しました。')
    } finally {
      commit('SET_LOADING', false)
    }
  },

  /**
   * 新しい評価を投稿
   *
   * @param {object} context - Vuex context
   * @param {(type: string, payload?: unknown) => void} context.commit - commit function
   * @param {object} context.rootState - root state
   * @param {object} payload - ペイロード
   * @param {string} payload.locationId - 場所ID
   * @param {object} payload.ratingData - 評価データ(スコア, コメント等)
   */
  async submitRating({ commit, rootState }, { locationId, ratingData }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)
    try {
      const { submitRating } = await import('@/services/ratingService')

      // ユーザーIDなどを付与
      const userId = rootState.auth?.user?.uid || 'anonymous'
      const ratingWithMeta = {
        ...ratingData,
        locationId,
        userId,
        createdAt: new Date(),
      }

      const newRating = await submitRating(ratingWithMeta)
      commit('ADD_RATING', { locationId, rating: newRating })
      return newRating
    } catch (error) {
      console.error('Error submitting rating:', error)
      commit('SET_ERROR', '評価の投稿に失敗しました。')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  /**
   * ユーザー自身の評価履歴を取得
   *
   * @param {object} context - Vuex context
   * @param {(type: string, payload?: unknown) => void} context.commit - commit function
   * @param {object} context.rootState - root state
   */
  async fetchUserRatings({ commit, rootState }) {
    const userId = rootState.auth?.user?.uid
    if (!userId) return

    commit('SET_LOADING', true)
    try {
      const { fetchUserRatings } = await import('@/services/ratingService')
      const ratings = await fetchUserRatings(userId)
      commit('SET_USER_RATINGS', ratings)
    } catch (error) {
      console.error('Error fetching user ratings:', error)
      commit('SET_ERROR', '評価履歴の取得に失敗しました。')
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
