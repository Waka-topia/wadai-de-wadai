import { fetchOrganizationData } from '@/services/proveService'

const state = {
  organizationId: '',
  proveOwnerStatusCache: {},
}

const getCurrentStatus = (state) => {
  return state.proveOwnerStatusCache[state.organizationId] || null
}

const mutations = {
  setCurrentOrganizationId(state, organizationId) {
    state.organizationId = organizationId
  },
  setCachedProveOwnerStatus(state, { organizationId, isProvePending, isProved, provedPassword }) {
    state.proveOwnerStatusCache = {
      ...state.proveOwnerStatusCache,
      [organizationId]: {
        isProvePending,
        isProved,
        provedPassword,
      },
    }
  },
}

const actions = {
  async fetchProveOwnerStatus({ commit, state }, organizationId) {
    try {
      if (!organizationId) return

      commit('setCurrentOrganizationId', organizationId)

      const cachedStatus = state.proveOwnerStatusCache[organizationId]

      // キャッシュが存在する場合はそれを使用して状態を更新
      if (cachedStatus) {
        return
      }

      // 未取得の場合はデータを取得して状態を更新
      const groupData = await fetchOrganizationData(organizationId)
      const statusPayload = {
        organizationId: organizationId,
        isProvePending: Boolean(groupData.isProvePending),
        isProved: Boolean(groupData.isProved),
        provedPassword: groupData.provedPassword || null,
      }

      commit('setCachedProveOwnerStatus', statusPayload)
    } catch (error) {
      throw new Error(`代表者証明の状態の取得に失敗しました。${error.message}`)
    }
  },
}

const getters = {
  isProvePending: (state) => {
    const currentStatus = getCurrentStatus(state)
    return Boolean(currentStatus?.isProvePending)
  },
  isProved: (state) => {
    const currentStatus = getCurrentStatus(state)
    return Boolean(currentStatus?.isProved)
  },
  isVerifiedPassword: (state) => (password) => {
    const currentStatus = getCurrentStatus(state)
    return currentStatus?.provedPassword === password
  },
  provedPassword: (state) => {
    const currentStatus = getCurrentStatus(state)
    return currentStatus?.provedPassword || null
  },
  isFetched: (state) => Boolean(getCurrentStatus(state)),
  organizationId: (state) => state.organizationId,
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
}
