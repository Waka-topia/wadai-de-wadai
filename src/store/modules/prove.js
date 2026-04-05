import { addRepresentativeByPassword, hasExistingRepresentatives } from '@/services/groupService'
import { submitOwnership } from '@/services/proveService'

const state = {
  organizationId: '',
  applicants: [],
}

const mutations = {
  setCurrentOrganizationId(state, organizationId) {
    state.organizationId = organizationId
  },
  setApplicants(state, applicants) {
    state.applicants = applicants
  },
}

const actions = {
  /**
   * 初回申請（運営承認が必要なフロー）を提出する
   *
   * @param {object} context - Vuexのコンテキストオブジェクト
   * @param {(type: string, payload?: unknown) => void} context.commit - Mutationをコミットするための関数
   * @param {object} applicationData - 申請データ
   * @returns {Promise<object>} 申請結果
   */
  async submitInitialApplication({ commit }, applicationData) {
    try {
      commit('setCurrentOrganizationId', applicationData.organizationId)
      const result = await submitOwnership(applicationData)
      return result
    } catch (error) {
      throw new Error(`代表者証明の申請に失敗しました。${error.message}`)
    }
  },

  /**
   * 後続登録（パスワード認証で即座に登録）を実行する
   *
   * @param {object} _context - Vuexのコンテキストオブジェクト（未使用）
   * @param {object} payload - 登録データ
   * @param {string} payload.groupId - 団体ID
   * @param {string} payload.userId - ユーザーID
   * @param {string} payload.userName - ユーザー名
   * @param {string} payload.password - パスワード
   * @returns {Promise<object>} 登録結果
   */
  async submitPasswordRegistration(_context, { groupId, userId, userName, password }) {
    try {
      const result = await addRepresentativeByPassword(groupId, userId, userName, password)
      return result
    } catch (error) {
      throw new Error(`代表者登録に失敗しました。${error.message}`)
    }
  },

  /**
   * 指定された団体にすでに代表者がいるかを確認する
   *
   * @param {object} _context - Vuexのコンテキストオブジェクト（未使用）
   * @param {string} groupId - 団体ID
   * @returns {Promise<boolean>} 代表者がいる場合true
   */
  async checkExistingRepresentatives(_context, groupId) {
    try {
      return await hasExistingRepresentatives(groupId)
    } catch (error) {
      throw new Error(`代表者情報の取得に失敗しました。${error.message}`)
    }
  },
}

const getters = {
  organizationId: (state) => state.organizationId,
  applicants: (state) => state.applicants,
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
}
