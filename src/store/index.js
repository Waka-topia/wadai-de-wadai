import { createStore } from 'vuex'
import authModule from './modules/auth'
import eventModule from './modules/event'
import scrollModule from './modules/scroll'
import userModule from './modules/user'

export default createStore({
  state: {},
  modules: {
    auth: authModule,
    users: {
      namespaced: true,
      ...userModule,
    },
    event: {
      namespaced: true,
      ...eventModule,
    },
    scroll: scrollModule,
  },
})
