import { createStore } from 'vuex'
import authModule from './modules/auth'
import eventModule from './modules/event'
import jobsModule from './modules/jobs'
import locationModule from './modules/location'
import ratingModule from './modules/rating'
import scrollModule from './modules/scroll'
import timetableModule from './modules/timetable'
import userModule from './modules/user'

export default createStore({
  state: {},
  modules: {
    auth: authModule,
    timetable: {
      namespaced: true,
      ...timetableModule,
    },
    users: {
      namespaced: true,
      ...userModule,
    },
    event: {
      namespaced: true,
      ...eventModule,
    },
    jobs: jobsModule,
    location: locationModule,
    rating: ratingModule,
    scroll: scrollModule,
  },
})
