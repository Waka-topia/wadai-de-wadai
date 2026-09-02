import { defaultUserIcon } from '@/data/userIcons'
import { fetchUserData } from '@/services/userService'

const state = () => ({
  currentUserData: {
    userName: 'Unknown',
    email: 'メールアドレスが設定されていません',
    userId: 'ユーザーIDが設定されていません',
    userIconUrl: defaultUserIcon,
    belongingOrgs: [],
  },
  isFetchedCurrentUserData: false,
  userId: '',
  userDataCache: {},
})

const getCurrentStatus = (state) => {
  return state.userDataCache[state.userId] || null
}

const actions = {
  async getUserData({ commit }, userId) {
    try {
      if (!userId) return

      commit('setCurrentUserId', userId)

      const cachedStatus = state.userDataCache[userId]

      // キャッシュが存在する場合はそれを使用して状態を更新
      if (cachedStatus) {
        return cachedStatus
      }

      // 未取得の場合はデータを取得して状態を更新
      const user = await fetchUserData(userId)
      const userData = {
        userId,
        ...user,
      }
      commit('setCachedUserData', userData)
      return user
    } catch (error) {
      throw new Error(`ユーザーデータの取得に失敗しました。${error.message}`)
    }
  },
  async getCurrentUserData({ commit, state }, userId) {
    try {
      if (!userId) throw new Error('ユーザーIDが不足しています')

      // キャッシュが存在する場合はそれを返す
      if (state.isFetchedCurrentUserData) return state.currentUserData

      // キャッシュが存在しない場合はFireStoreからフェッチ
      const user = await fetchUserData(userId)

      // storeの状態を更新
      commit('setCurrentUserData', user)
      commit('setIsFetchedCurrentUserData', true)
      return user
    } catch (error) {
      throw new Error(error.message)
    }
  },
  /**
   * キャッシュを無視して現在のユーザー情報を取り直す（プロフィール更新後に使う）
   *
   * @param {object} context - Vuexのコンテキスト
   * @param {(type: string, payload?: unknown) => void} context.commit - Mutationをコミットする関数
   * @param {string} userId - Firebase Auth の UID
   */
  async refreshCurrentUserData({ commit }, userId) {
    if (!userId) return

    const user = await fetchUserData(userId)
    commit('setCurrentUserData', user)
    commit('setIsFetchedCurrentUserData', true)
  },
}

const mutations = {
  setCurrentUserData(state, userData) {
    state.currentUserData = userData
  },
  setIsFetchedCurrentUserData(state, isFetched) {
    state.isFetchedCurrentUserData = isFetched
  },
  setCurrentUserId(state, userId) {
    state.userId = userId
  },
  setCachedUserData(state, { userId, userData }) {
    state.userDataCache = {
      ...state.userDataCache,
      [userId]: userData,
    }
  },
}

const getters = {
  currentUserData: (state) => state.currentUserData,
  isProved: (state) => {
    const currentStatus = getCurrentStatus(state)
    return Boolean(currentStatus?.isProved)
  },
  isProvePending: (state) => {
    const currentStatus = getCurrentStatus(state)
    return Boolean(currentStatus?.isProvePending)
  },
  isFetched: (state) => Boolean(getCurrentStatus(state)),
  userId: (state) => state.userId,
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters,
}
