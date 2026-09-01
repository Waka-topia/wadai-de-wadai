import authService from '@/services/authService'

export default {
  namespaced: true,
  state: {
    user: null,
    idToken: null,
    userId: null,
    belongingOrgs: [],
  },
  mutations: {
    setUser(state, user) {
      state.user = user
    },
    setIdToken(state, token) {
      state.idToken = token
    },
    setUserId(state, uid) {
      state.userId = uid
    },
    setUserOrgs(state, orgs) {
      state.belongingOrgs = orgs
    },
    clearAuthState(state) {
      state.user = null
      state.idToken = null
      state.userId = null
    },
  },
  actions: {
    initializeAuth({ commit }) {
      return new Promise((resolve) => {
        authService.onAuthStateChanged((user) => {
          if (user) {
            user.getIdToken().then((idToken) => {
              commit('setUser', user)
              commit('setIdToken', idToken)
              commit('setUserId', user.uid)
              resolve()
            })
          } else {
            commit('clearAuthState')
            resolve()
          }
        })
      })
    },
    async login({ commit }, { email, password }) {
      try {
        const user = await authService.login({ email, password })
        const idToken = await user.getIdToken()
        commit('setUser', user)
        commit('setIdToken', idToken)
        commit('setUserId', user.uid)
      } catch (error) {
        throw new Error(error.message)
      }
    },
    async signup({ commit }, { email, password, userName }) {
      try {
        const user = await authService.signup({ email, password, userName })
        const idToken = await user.getIdToken()
        commit('setUser', user)
        commit('setIdToken', idToken)
        commit('setUserId', user.uid)
        commit('setUserOrgs', user.belongingOrgs || [])
      } catch (error) {
        throw new Error(error.message)
      }
    },
    async logout({ commit }) {
      try {
        await authService.logout()
        commit('clearAuthState')
      } catch (error) {
        throw new Error(error.message)
      }
    },
    async deleteAccount({ commit }) {
      try {
        await authService.deleteAccount()
        commit('clearAuthState')
      } catch (error) {
        throw new Error(error.message)
      }
    },
    async saveUserOrgs({ commit, state }, orgs) {
      try {
        await authService.saveUserOrgs(state.userId, orgs)
        commit('setUserOrgs', orgs)
      } catch (error) {
        throw new Error(`所属団体の保存に失敗しました。${error.message}`)
      }
    },
    async fetchUserOrgs({ commit, state }) {
      const orgs = await authService.fetchUserOrgs(state.userId)
      commit('setUserOrgs', orgs)
    },
  },

  getters: {
    isAuthenticated: (state) => !!state.user,
    user: (state) => state.user,
    idToken: (state) => state.idToken,
    userId: (state) => state.userId,
    email: (state) => state.user?.email || '',
    providerData: (state) => state.user?.providerData || [],
    displayName: (state) => {
      return state.user?.displayName || 'ゲスト'
    },
    belongingOrgs: (state) => state.belongingOrgs,
  },
}
