import {
  getBookmarkedJobIds,
  getJobById,
  getJobs,
  updateBookmarkedJobIds,
} from '@/services/jobsService'

const state = () => ({
  jobs: [],
  currentJob: null,
  sortKey: 'newest',
  showBookmarkedOnly: false,
  bookmarkedIds: [], // ブックマークされた求人のIDを格納した配列
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
  setShowBookmarkedOnly(state, value) {
    state.showBookmarkedOnly = value
  },
  setBookmarkedIds(state, ids) {
    // ★追加: 配列をセットする
    state.bookmarkedIds = ids
  },
  setError(state, error) {
    state.error = error
  },
}

const getters = {
  jobsWithBookmarks(state) {
    return state.jobs.map((job) => ({
      ...job,
      isBookmarked: state.bookmarkedIds.includes(job.id),
    }))
  },
  sortedJobs(state, getters) {
    let jobs = [...getters.jobsWithBookmarks]

    if (state.showBookmarkedOnly) {
      jobs = jobs.filter((job) => job.isBookmarked)
    }

    // 時給順でソート（最大給与の高い順）
    if (state.sortKey === 'highSalary') {
      return jobs.sort((a, b) => b.salaryMax - a.salaryMax)
    }
    // デフォルト時，新着順（作成日時の若い順）でソートする
    return jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },
  currentJobWithBookmark(state) {
    if (!state.currentJob) return null
    return {
      ...state.currentJob,
      isBookmarked: state.bookmarkedIds.includes(state.currentJob.id),
    }
  },
}

const actions = {
  async fetchJobs({ commit, rootState }) {
    try {
      commit('setError', null)
      const jobs = await getJobs()
      commit('setJobs', jobs)

      // ブックマークID配列も取得してセットする
      const userId = rootState.auth?.userId
      if (userId) {
        const ids = await getBookmarkedJobIds(userId)
        commit('setBookmarkedIds', ids)
      }
    } catch (error) {
      commit('setError', error.message)
    }
  },

  async fetchJobById({ commit, rootState }, jobId) {
    try {
      commit('setError', null)
      const job = await getJobById(jobId)
      commit('setCurrentJob', job)

      const userId = rootState.auth?.userId
      if (userId && rootState.jobs.bookmarkedIds.length === 0) {
        const ids = await getBookmarkedJobIds(userId)
        commit('setBookmarkedIds', ids)
      }
    } catch (error) {
      commit('setError', error.message)
    }
  },

  async toggleJobBookmark({ commit, state, rootState }, jobId) {
    const userId = rootState.auth?.userId

    // 未ログイン時は何もさせないようにする
    if (!userId) {
      return
    }

    const originalIds = [...state.bookmarkedIds]
    let newIds = [...originalIds]
    const index = newIds.indexOf(jobId)

    if (index === -1) {
      newIds.push(jobId)
    } else {
      newIds.splice(index, 1)
    }

    commit('setBookmarkedIds', newIds)

    try {
      await updateBookmarkedJobIds(userId, newIds)
    } catch (error) {
      console.error('Error updating bookmark:', error)
      commit('setBookmarkedIds', originalIds)
    }
  },
}

export default {
  state,
  getters,
  mutations,
  actions,
}
