import { fetchRatings, fetchUserRatings, submitRating } from '@/services/ratingService'

/** Rating Store Module 評価データの状態管理 */

const state = {
  ratings: {}, // locationId別の評価配列 { locationId: [ratings] }
  userRatings: [], // ユーザーの評価履歴
  loading: false,
  error: null,
}

const getters = {
  /**
   * 特定場所の評価を取得
   *
   * @param state
   */
  getRatingsByLocation: (state) => (locationId) => {
    return state.ratings[locationId] || []
  },

  /**
   * 特定場所の平均評価を計算
   *
   * @param state
   */
  getAverageRating: (state) => (locationId) => {
    const locationRatings = state.ratings[locationId]
    if (!locationRatings || locationRatings.length === 0) {
      return null
    }

    // 全評価項目の平均を計算
    const allScores = []
    locationRatings.forEach((rating) => {
      if (rating.scores) {
        Object.values(rating.scores).forEach((score) => {
          if (typeof score === 'number') {
            allScores.push(score)
          }
        })
      }
    })

    if (allScores.length === 0) return null

    const sum = allScores.reduce((acc, score) => acc + score, 0)
    return (sum / allScores.length).toFixed(1)
  },

  /**
   * 特定場所のカテゴリー別平均評価を計算
   *
   * @param state
   */
  getCategoryAverages: (state) => (locationId) => {
    const locationRatings = state.ratings[locationId]
    if (!locationRatings || locationRatings.length === 0) {
      return {}
    }

    const categoryScores = {}
    const categoryCounts = {}

    locationRatings.forEach((rating) => {
      if (rating.scores) {
        Object.entries(rating.scores).forEach(([category, score]) => {
          if (typeof score === 'number') {
            categoryScores[category] = (categoryScores[category] || 0) + score
            categoryCounts[category] = (categoryCounts[category] || 0) + 1
          }
        })
      }
    })

    const averages = {}
    Object.keys(categoryScores).forEach((category) => {
      averages[category] = (categoryScores[category] / categoryCounts[category]).toFixed(1)
    })

    return averages
  },

  /**
   * 特定場所の評価数を取得
   *
   * @param state
   */
  getRatingCount: (state) => (locationId) => {
    const locationRatings = state.ratings[locationId]
    return locationRatings ? locationRatings.length : 0
  },

  /**
   * ユーザーの評価履歴を取得
   *
   * @param state
   */
  userRatings: (state) => state.userRatings,

  /**
   * ローディング状態を取得
   *
   * @param state
   */
  isLoading: (state) => state.loading,
}

const mutations = {
  /**
   * 特定場所の評価をセット
   *
   * @param state
   * @param root0
   * @param root0.locationId
   * @param root0.ratings
   */
  SET_RATINGS(state, { locationId, ratings }) {
    state.ratings = {
      ...state.ratings,
      [locationId]: ratings,
    }
  },

  /**
   * 評価を追加
   *
   * @param state
   * @param root0
   * @param root0.locationId
   * @param root0.rating
   */
  ADD_RATING(state, { locationId, rating }) {
    if (!state.ratings[locationId]) {
      state.ratings[locationId] = []
    }
    state.ratings[locationId].unshift(rating) // 最新の評価を先頭に追加
  },

  /**
   * ユーザーの評価履歴をセット
   *
   * @param state
   * @param ratings
   */
  SET_USER_RATINGS(state, ratings) {
    state.userRatings = ratings
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
    state.ratings = {}
    state.userRatings = []
    state.loading = false
    state.error = null
  },
}

const actions = {
  /**
   * 特定場所の評価を取得
   *
   * @param root0
   * @param root0.commit
   * @param locationId
   */
  async fetchRatings({ commit }, locationId) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)

    try {
      const ratings = await fetchRatings(locationId)
      commit('SET_RATINGS', { locationId, ratings })
    } catch (error) {
      console.error('評価データの取得に失敗しました:', error)
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },

  /**
   * 評価を送信
   *
   * @param root0
   * @param root0.commit
   * @param root0.rootState
   * @param root1
   * @param root1.locationId
   * @param root1.ratingData
   */
  async submitRating({ commit, rootState }, { locationId, ratingData }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)

    try {
      // ユーザーIDを取得(authストアから)
      const userId = rootState.auth?.user?.uid
      if (!userId) {
        throw new Error('ログインが必要です')
      }

      const rating = {
        ...ratingData,
        locationId,
        userId,
        createdAt: new Date(),
      }

      const newRating = await submitRating(rating)
      commit('ADD_RATING', { locationId, rating: newRating })
      return newRating
    } catch (error) {
      console.error('評価の送信に失敗しました:', error)
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  /**
   * ユーザーの評価履歴を取得
   *
   * @param root0
   * @param root0.commit
   * @param root0.rootState
   */
  async fetchUserRatings({ commit, rootState }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)

    try {
      const userId = rootState.auth?.user?.uid
      if (!userId) {
        throw new Error('ログインが必要です')
      }

      const ratings = await fetchUserRatings(userId)
      commit('SET_USER_RATINGS', ratings)
    } catch (error) {
      console.error('ユーザー評価履歴の取得に失敗しました:', error)
      commit('SET_ERROR', error.message)
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
