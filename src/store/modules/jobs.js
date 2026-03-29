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
    // デフォルト時，新着順でソート（作成日時の若い順）
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

const createToggledBookmarkIds = (bookmarkedIds, jobId) => {
  const hasBookmark = bookmarkedIds.includes(jobId)

  if (hasBookmark) {
    return bookmarkedIds.filter((id) => id !== jobId)
  }

  return [...bookmarkedIds, jobId]
}

const actions = {
  async fetchJobs({ commit }) {
    try {
      commit('setError', null)
      const jobs = await getJobs()
      commit('setJobs', jobs)
    } catch (error) {
      commit('setError', error.message)
    }
  },

  async fetchJobById({ commit }, jobId) {
    try {
      commit('setError', null)
      const job = await getJobById(jobId)
      commit('setCurrentJob', job)
    } catch (error) {
      commit('setError', error.message)
    }
  },

  async applyUserBookmarks({ commit, rootState }) {
    const userId = rootState.auth?.userId
    if (userId) {
      try {
        const ids = await getBookmarkedJobIds(userId)
        commit('setBookmarkedIds', ids)
      } catch (error) {
        console.error('Error fetching bookmarked jobs:', error)
      }
    }
  },

  async toggleJobBookmark({ commit, state, rootState }, jobId) {
    const userId = rootState.auth?.userId
    if (!userId) return

    const previousBookmarkIds = [...state.bookmarkedIds]
    const nextBookmarkIds = createToggledBookmarkIds(previousBookmarkIds, jobId)

    commit('setBookmarkedIds', nextBookmarkIds)

    try {
      await updateBookmarkedJobIds(userId, nextBookmarkIds)
    } catch (error) {
      console.error('Error updating bookmark:', error)
      commit('setBookmarkedIds', previousBookmarkIds)
    }
  },
}

export default {
  state,
  getters,
  mutations,
  actions,
}
