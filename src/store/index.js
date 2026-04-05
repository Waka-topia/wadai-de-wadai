import { createStore } from 'vuex'
import authModule from './modules/auth'
import eventModule from './modules/event'
import jobsModule from './modules/jobs'
import locationModule from './modules/location'
import ratingModule from './modules/rating'
import scrollModule from './modules/scroll'
import shinkanModule from './modules/shinkan'
import timetableModule from './modules/timetable'
import titleModule from './modules/title'
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
    shinkan: shinkanModule,
    title: titleModule,
    event: {
      namespaced: true,
      ...eventModule,
    },
    jobs: {
      namespaced: true,
      ...jobsModule,
    },
    location: locationModule,
    rating: ratingModule,
    scroll: scrollModule,
  },
})
