import { getJobs } from '@/services/jobsService'

const state = () => ({
  jobs: [],
  currentJob: null,
  sortKey: 'recommended',
  error: null,
})

const mutations = {
  setJobs(state, jobs) {
    state.jobs = jobs
  },
  setCurrentJob(state, job) {
    state.currentJob = job
  },
  setSortKey(state, sortKey) {
    state.sortKey = sortKey
  },
  setError(state, error) {
    state.error = error
  },
}

const getters = {
  /**
   * ソートキーに応じてソートされた求人リストを返す
   *
   * @param {object} state Vuexのstate
   * @returns {Array} ソートされた求人リスト
   */
  sortedJobs(state) {
    const jobs = [...state.jobs]
    if (state.sortKey === 'newest') {
      return jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
    if (state.sortKey === 'highSalary') {
      return jobs.sort((a, b) => b.salaryMax - a.salaryMax)
    }
    // おすすめ順: デフォルトの並び順
    return jobs
  },
}

const actions = {
  /**
   * 求人情報を取得する
   *
   * @param {object} context Vuexのコンテキスト
   * @param {Function} context.commit Vuexのcommit関数
   */
  async fetchJobs({ commit }) {
    try {
      commit('setError', null)
      const jobs = await getJobs()
      commit('setJobs', jobs)
    } catch (error) {
      commit('setError', error.message)
    }
  },
}

export default {
  state,
  getters,
  mutations,
  actions,
}
