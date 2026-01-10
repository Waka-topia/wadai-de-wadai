import { addStampToUser, getUserStampImages, getUserStamps } from '@/services/stampService'

const state = {
  stamps: [], // ユーザーが受け取ったスタンプ一覧
  stampImages: [], // 表示用のスタンプ画像データ
}

const mutations = {
  ADD_STAMP(state, stamp) {
    state.stamps.push(stamp) // 新しいスタンプを状態に追加
  },
  SET_USER_STAMPS(state, stamps) {
    state.stamps = stamps // ユーザーのスタンプ情報をセット
  },
  SET_USER_STAMP_IMAGES(state, stampImages) {
    state.stampImages = stampImages // 表示用のスタンプ画像データをセット
  },
}

const actions = {
  async addStamp({ commit, rootState }, { groupId, stampId }) {
    const userId = rootState.auth.userId // ログイン中のユーザーID
    const displayName = rootState.auth.user?.displayName // ログイン中のユーザー名

    if (!userId || !displayName) {
      throw new Error('User ID or displayName is missing.')
    }

    try {
      // Firestoreにスタンプを登録
      const result = await addStampToUser(userId, displayName, groupId, stampId)

      if (result.exists) {
        // すでに存在する場合
        console.warn('スタンプはすでに存在します:', stampId)
        return { message: 'このスタンプは既に取得済みです。' }
      }

      // スタンプ情報をVuexストアに追加
      const newStamp = { stampId, groupId, timestamp: new Date().toISOString() }
      commit('ADD_STAMP', newStamp)

      return { message: 'スタンプが正常に追加されました。' }
    } catch (error) {
      console.error('Failed to add stamp: ', error)
      throw new Error('スタンプの追加中にエラーが発生しました。')
    }
  },

  // Firestoreからユーザーのスタンプを取得してVuexに保存
  async fetchUserStamps({ commit, rootState }) {
    const userId = rootState.auth.userId
    if (!userId) throw new Error('User is not logged in.')
    try {
      const stamps = await getUserStamps(userId)
      commit('SET_USER_STAMPS', stamps) // Vuexにスタンプ情報をセット
    } catch (error) {
      console.error('Failed to fetch user stamps: ', error)
    }
  },
  async fetchUserStampImages({ commit, rootState }) {
    const userId = rootState.auth.userId // ログイン中のユーザーID
    if (!userId) throw new Error('User is not logged in.')
    try {
      const stampImages = await getUserStampImages(userId)
      commit('SET_USER_STAMP_IMAGES', stampImages) // Vuex に画像データをセット
    } catch (error) {
      console.error('Failed to fetch user stamp images: ', error)
    }
  },
}

const getters = {
  userStamps: (state) => state.stamps, // 現在のスタンプ一覧を返す
  userStampImages: (state) => state.stampImages, // スタンプ画像データを返す
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
}
