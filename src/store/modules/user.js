import { getPhotoURL } from '@/services/authService'
import { fetchUserData } from '@/services/userService'

const state = () => ({
  userId: '',
  userDataCache: {},
  userPhotoURLs: {},
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
      const userData = await fetchUserData(userId)
      const userDataPayload = {
        userId,
        ...userData,
      }
      commit('setCachedUserData', userDataPayload)
      return userData
    } catch (error) {
      throw new Error(`ユーザーデータの取得に失敗しました。${error.message}`)
    }
  },
  async getPhotoURL({ commit }, userId) {
    try {
      const photoURL = await getPhotoURL(userId)
      commit('setUserPhotoURL', { userId, photoURL })
      return photoURL
    } catch (error) {
      console.error('Error fetching photo URL:', error)
      throw error
    }
  },
}

const mutations = {
  setCurrentUserId(state, userId) {
    state.userId = userId
  },
  setCachedUserData(state, { userId, userData }) {
    state.userDataCache = {
      ...state.userDataCache,
      [userId]: userData,
    }
  },
  setUserPhotoURL(state, { userId, photoURL }) {
    state.userPhotoURLs[userId] = photoURL
  },
}

const getters = {
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
  getUserPhotoURL: (state) => (userId) => state.userPhotoURLs[userId] || null,
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters,
}
