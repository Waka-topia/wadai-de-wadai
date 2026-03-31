import { createStore } from 'vuex'
import authModule from './modules/auth'
import eventModule from './modules/event'
import jobsModule from './modules/jobs'
import locationModule from './modules/location'
import proveModule from './modules/prove'
import rankingModule from './modules/ranking'
import ratingModule from './modules/rating'
import scrollModule from './modules/scroll'
import shinkanModule from './modules/shinkan'
import stampModule from './modules/stamp'
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
    stamps: {
      namespaced: true,
      ...stampModule,
    },
    users: {
      namespaced: true,
      ...userModule,
    },
    ranking: rankingModule,
    shinkan: shinkanModule,
    title: titleModule,
    event: {
      namespaced: true,
      ...eventModule,
    },
    jobs: jobsModule,
    location: locationModule,
    rating: ratingModule,
    scroll: scrollModule,
    prove: proveModule,
  },
})
