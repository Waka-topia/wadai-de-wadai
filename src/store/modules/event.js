// src/store/modules/event.js
import { addEvent, deleteEvent, getEvents, updateEvent } from '../../services/eventService'

const state = {
  events: [], // イベントデータを格納
  error: null, // エラー情報
  currentEvent: null, // 編集中のイベント
  isEditing: false, // 編集モード
}

const getters = {
  allEvents: (state) => state.events, // 全てのイベントを取得
  currentEvent: (state) => state.currentEvent,
  isEditing: (state) => state.isEditing,
  eventError: (state) => state.error,
}

const actions = {
  /**
   * Firebaseから全てのイベント情報を取得する
   *
   * @param {object} context Vuexのコンテキスト
   * @param context.commit
   */
  async fetchEvents({ commit }) {
    try {
      commit('setError', null) // エラー情報をクリア
      const events = await getEvents() // getEventsで全てのイベントを取得
      commit('setEvents', events) // イベントリストを設定
    } catch (error) {
      commit('setError', error.message)
    }
  },

  /**
   * イベントを新規登録する
   *
   * @param {object} context Vuexのコンテキスト
   * @param {object} payload イベントデータと団体ID
   * @param context.commit
   * @param payload.eventData
   * @param payload.organizerId
   */
  async createEvent({ commit }, { eventData, organizerId }) {
    try {
      commit('setError', null) // エラー情報をクリア
      await addEvent(eventData, organizerId)
    } catch (error) {
      commit('setError', error.message)
    }
  },

  /**
   * イベント情報を更新する
   *
   * @param {object} context Vuexのコンテキスト
   * @param {object} payload 更新データ、団体ID、パスワード
   * @param context.commit
   * @param context.state
   * @param payload.eventData
   * @param payload.organizerId
   * @param payload.inputPassword
   */
  async updateEvent({ commit, state }, { eventData, organizerId, inputPassword }) {
    try {
      commit('setError', null)
      await updateEvent(state.currentEvent.eventId, eventData, organizerId, inputPassword)
      commit('setCurrentEvent', eventData) // 編集内容を反映
    } catch (error) {
      commit('setError', error.message)
    }
  },

  /**
   * イベントを削除する
   *
   * @param {object} context Vuexのコンテキスト
   * @param {object} payload イベントID、団体ID、パスワード
   * @param context.commit
   * @param payload.eventId
   * @param payload.organizerId
   * @param payload.inputPassword
   */
  async deleteEvent({ commit }, { eventId, organizerId, inputPassword }) {
    try {
      commit('setError', null)
      await deleteEvent(eventId, organizerId, inputPassword)
      commit('removeEvent', eventId) // ローカルストアから削除
    } catch (error) {
      commit('setError', error.message)
    }
  },

  /**
   * 編集モードを切り替える
   *
   * @param {object} context Vuexのコンテキスト
   * @param context.commit
   * @param {boolean} isEditing 編集モードの状態
   */
  toggleEditMode({ commit }, isEditing) {
    commit('setIsEditing', isEditing)
  },
}

const mutations = {
  setEvents(state, events) {
    state.events = events // イベントリストを更新
  },

  setCurrentEvent(state, event) {
    state.currentEvent = event // 現在編集しているイベントを更新
  },

  setError(state, error) {
    state.error = error // エラー情報を設定
  },

  removeEvent(state, eventId) {
    state.events = state.events.filter((event) => event.eventId !== eventId) // イベントIDで削除
  },

  setIsEditing(state, isEditing) {
    state.isEditing = isEditing // 編集モードの切り替え
  },
}

export default {
  state,
  getters,
  actions,
  mutations,
}
