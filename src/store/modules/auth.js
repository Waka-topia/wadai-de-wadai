import authService from '../../services/authService'

export default {
  namespaced: true,
  state: {
    user: null,
    idToken: null,
    userId: null,
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
    clearAuthState(state) {
      state.user = null
      state.idToken = null
      state.userId = null
    },
    setPhotoURL(state, photoURL) {
      if (state.user) {
        state.user.photoURL = photoURL
      }
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
              console.log('User logged in:', user)
              resolve()
            })
          } else {
            commit('clearAuthState')
            console.log('No user logged in')
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
        console.log('User logged in:', user)
      } catch (error) {
        console.error('Login failed:', error)
        throw error
      }
    },
    async signup({ commit }, { email, password, username }) {
      try {
        const user = await authService.signup({ email, password, username })
        const idToken = await user.getIdToken()
        commit('setUser', user)
        commit('setIdToken', idToken)
        commit('setUserId', user.uid)
        console.log('User signed up:', user)
      } catch (error) {
        console.error('Sign-up failed:', error)
        throw error
      }
    },
    async logout({ commit }) {
      try {
        await authService.logout()
        commit('clearAuthState')
        console.log('User logged out')
      } catch (error) {
        console.error('Logout failed:', error)
        throw error
      }
    },
    async updatePhotoURL({ commit, state }, photoURL) {
      try {
        await authService.updatePhotoURL(state.user, photoURL)
        commit('setPhotoURL', photoURL)
        console.log('Photo URL updated to:', photoURL)
      } catch (error) {
        console.error('Error updating photo URL:', error)
        throw error
      }
    },
  },

  getters: {
    isAuthenticated: (state) => !!state.user,
    user: (state) => state.user,
    idToken: (state) => state.idToken,
    userId: (state) => state.userId,
    email: (state) => state.user.email,
    providerData: (state) => state.user.providerData,
    photoURL: (state) => state.user.photoURL,
    displayName: (state) => {
      return state.user?.displayName || 'ゲスト'
    },
  },
}
