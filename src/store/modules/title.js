import {
  addTitleToUser,
  getUserTitles as fetchUserTitlesFromService,
  getAllTitles,
} from '@/services/titleService'

const state = () => ({
  titles: [], // Firestoreから取得したすべてのタイトル
  userTitles: {}, // 各ユーザーの称号をオブジェクトの配列で保持
})

const getters = {
  allTitles: (state) => state.titles,
  getUserTitles: (state) => (userId) => state.userTitles[userId] || [],
}

const actions = {
  async fetchAllTitles({ commit }) {
    try {
      const titles = await getAllTitles() // 既存のgetAllTitlesを使用
      commit('setTitles', titles)
    } catch (error) {
      console.error('Error fetching titles:', error)
    }
  },

  async fetchUserTitles({ commit }, userId) {
    try {
      const titles = await fetchUserTitlesFromService(userId) // fetchUserTitlesFromServiceに変更
      const formattedTitles = titles.map((title) => ({
        id: title.id,
        name: title.name,
        description: title.description,
        earnedAt: title.earnedAt,
      }))
      commit('setUserTitles', { userId, titles: formattedTitles })
      return formattedTitles
    } catch (error) {
      console.error('Error fetching user titles:', error)
      throw error
    }
  },

  async addTitleToUser({ commit }, { userID, titleID, titleData }) {
    try {
      await addTitleToUser(userID, titleID, titleData)
      commit('addUserTitle', { userID, titleID, titleData })
    } catch (error) {
      console.error('Error adding title:', error)
    }
  },
}

const mutations = {
  setTitles(state, titles) {
    state.titles = titles
  },

  setUserTitles(state, { userId, titles }) {
    state.userTitles[userId] = titles
  },

  addUserTitle(state, { userID, titleID, titleData }) {
    if (!state.userTitles[userID]) {
      state.userTitles[userID] = []
    }
    if (!state.userTitles[userID].some((title) => title.id === titleID)) {
      state.userTitles[userID].push({
        id: titleID,
        ...titleData,
      })
    }
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
}
