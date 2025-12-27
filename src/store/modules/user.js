// src/store/modules/users.js
import { getPhotoURL } from '@/services/authService'
import { getNextShinkan } from '@/services/nextShinkanService'

const state = () => ({
  userPhotoURLs: {},
  nextShinkanDetails: {},
})

const actions = {
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
  async getNextShinkanDetails({ commit }, userId) {
    try {
      const nextShinkan = await getNextShinkan(userId)
      commit('setNextShinkanDetails', { userId, nextShinkan })
      return nextShinkan
    } catch (error) {
      console.error('Error fetching next Shinkan details:', error)
      throw error
    }
  },
}

const mutations = {
  setUserPhotoURL(state, { userId, photoURL }) {
    state.userPhotoURLs[userId] = photoURL
  },
  setNextShinkanDetails(state, { userId, nextShinkan }) {
    state.nextShinkanDetails[userId] = nextShinkan
  },
}

const getters = {
  getUserPhotoURL: (state) => (userId) => state.userPhotoURLs[userId] || null,
  getNextShinkanDetails: (state) => (userId) => state.nextShinkanDetails[userId] || null,
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters,
}
