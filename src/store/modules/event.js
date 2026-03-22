import {
  addEventService,
  deleteEventService,
  getEventService,
  getEventsService,
  updateEventService,
} from '@/services/eventService'

const state = {
  event: null,
  events: [], // イベントデータを格納
  error: null, // エラー情報
  currentEvent: null, // 編集中のイベント
  isEditing: false, // 編集モード
}

const getters = {
  event: (state) => state.event,
  allEvents: (state) => state.events, // 全てのイベントを取得
  sortedEventsByDate: (state) => (selectedDate) => {
    return state.events
      .filter((event) => event.date === selectedDate)
      .sort((firstEvent, secondEvent) => {
        return (
          Number(Boolean(secondEvent.isOfficial)) - Number(Boolean(firstEvent.isOfficial)) ||
          (secondEvent.eventPriority || 0) - (firstEvent.eventPriority || 0) ||
          (firstEvent.startTime || '').localeCompare(secondEvent.startTime || '')
        )
      })
  },
  currentEvent: (state) => state.currentEvent,
  isEditing: (state) => state.isEditing,
  eventError: (state) => state.error,
}

const actions = {
  /**
   * Firebaseから全てのイベント情報を取得する
   *
   * @param {object} context Vuexのコンテキスト
   * @param {(type: string, payload?: unknown) => void} context.commit Vuexのcommit関数
   */
  async fetchEvents({ commit }) {
    try {
      commit('setError', null)
      const events = await getEventsService()
      commit('setEvents', events)
    } catch (error) {
      commit('setError', error.message)
    }
  },

  async fetchEvent({ commit }, eventId) {
    try {
      commit('setError', null)
      const event = await getEventService(eventId)
      console.log('Fetched event:', event)
      commit('setEvent', event)
    } catch (error) {
      commit('setError', error.message)
    }
  },

  /**
   * イベントを新規登録する
   *
   * @param {object} context Vuexのコンテキスト
   * @param {(type: string, payload?: unknown) => void} context.commit Vuexのcommit関数
   * @param {object} payload イベントデータと作成者情報
   * @param {object} payload.eventData イベントデータ
   * @param {string} payload.currentUserId Firebase AuthのユーザーID
   */
  async createEvent({ commit }, { eventData, currentUserId }) {
    try {
      commit('setError', null)
      const createdEvent = await addEventService(eventData, currentUserId)
      commit('addEvent', createdEvent)
    } catch (error) {
      commit('setError', error.message)
      throw error
    }
  },

  /**
   * イベント情報を更新する
   *
   * @param {object} context Vuexのコンテキスト
   * @param {(type: string, payload?: unknown) => void} context.commit Vuexのcommit関数
   * @param {object} context.state Vuexのstate
   * @param {object} payload 更新データ、団体ID、パスワード
   * @param {object} payload.eventData イベントデータ
   * @param {string} payload.organizerId 団体ID
   * @param {string} payload.inputPassword パスワード
   */
  async updateEvent({ commit, state }, { eventData, organizerId, inputPassword }) {
    try {
      commit('setError', null)
      await updateEventService(state.currentEvent.eventId, eventData, organizerId, inputPassword)
      commit('setCurrentEvent', eventData)
    } catch (error) {
      commit('setError', error.message)
    }
  },

  /**
   * イベントを削除する
   *
   * @param {object} context Vuexのコンテキスト
   * @param {(type: string, payload?: unknown) => void} context.commit Vuexのcommit関数
   * @param {object} payload イベントID、団体ID、パスワード
   * @param {string} payload.eventId イベントID
   * @param {string} payload.organizerId 団体ID
   * @param {string} payload.inputPassword パスワード
   */
  async deleteEvent({ commit }, { eventId, organizerId, inputPassword }) {
    try {
      commit('setError', null)
      await deleteEventService(eventId, organizerId, inputPassword)
      commit('removeEvent', eventId)
    } catch (error) {
      commit('setError', error.message)
    }
  },

  /**
   * 編集モードを切り替える
   *
   * @param {object} context Vuexのコンテキスト
   * @param {(type: string, payload?: unknown) => void} context.commit Vuexのcommit関数
   * @param {boolean} isEditing 編集モードの状態
   */
  toggleEditMode({ commit }, isEditing) {
    commit('setIsEditing', isEditing)
  },
}

const mutations = {
  setEvent(state, event) {
    state.event = event
  },

  setEvents(state, events) {
    state.events = events
  },

  setCurrentEvent(state, event) {
    state.currentEvent = event
  },

  setError(state, error) {
    state.error = error
  },

  removeEvent(state, eventId) {
    state.events = state.events.filter((event) => event.eventId !== eventId)
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
