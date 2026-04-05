import {
  addEventService,
  deleteEventService,
  getEventsByMonthService, // getEventsServiceから変更
  getEventService,
  updateEventService,
} from '@/services/eventService'

const state = {
  event: null,
  events: [], // 全イベントデータを格納
  fetchedMonths: [], // 取得済みの月キー（例: ["2026-03", "2026-04"]）を記録
  error: null, // エラーメッセージ
  currentEvent: null, // 編集・表示中の詳細イベント
  isEditing: false, // 編集モードのフラグ
}

const getters = {
  event: (state) => state.event,
  allEvents: (state) => state.events,

  /**
   * 指定された日付のイベントをフィルタリングし、優先度と開始時間でソートして返す
   *
   * @param {object} state - Vuexのステートオブジェクト
   * @returns {(selectedDate: string) => object[]} 日付文字列を受け取り、ソート済みのイベント配列を返す関数
   */
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
   * Firebaseから指定された月のイベント情報を取得する メモリキャッシュ（state.fetchedMonths）が存在する場合は、forceフラグがtrueでない限り再取得をスキップする
   *
   * @param {object} context - Vuexのコンテキストオブジェクト
   * @param {(type: string, payload?: unknown) => void} context.commit - Mutationをコミットするための関数
   * @param {object} context.state - 現在のステート
   * @param {object} [payload] - オプション設定
   * @param {string} payload.monthKey - 取得対象の月キー (例: "2026-04")
   * @param {boolean} [payload.force] - Trueを指定するとキャッシュを無視してサーバーから最新データを取得する
   * @returns {Promise<void>}
   */
  async fetchEvents({ commit, state }, { monthKey, force = false } = {}) {
    if (!monthKey) {
      return
    }

    // キャッシュチェック: データが既に存在し、かつ強制リロードでない場合は通信をスキップ
    if (!force && state.fetchedMonths.includes(monthKey)) {
      return
    }

    try {
      commit('setError', null)
      const events = await getEventsByMonthService(monthKey)
      commit('addMonthlyEvents', { monthKey, events })
    } catch (error) {
      commit('setError', error.message)
      throw error
    }
  },

  /**
   * Firebaseから単一のイベント情報を取得し、ステートに保存する
   *
   * @param {object} context - Vuexのコンテキストオブジェクト
   * @param {(type: string, payload?: unknown) => void} context.commit - Mutationをコミットするための関数
   * @param {string} eventId - 取得対象のイベントID
   * @returns {Promise<void>}
   */
  async fetchEvent({ commit }, eventId) {
    try {
      commit('setError', null)
      const event = await getEventService(eventId)
      commit('setEvent', event)
    } catch (error) {
      commit('setError', error.message)
      throw error
    }
  },

  /**
   * イベントを新規登録し、ローカルのステートにも追加する
   *
   * @param {object} context - Vuexのコンテキストオブジェクト
   * @param {(type: string, payload?: unknown) => void} context.commit - Mutationをコミットするための関数
   * @param {object} payload - イベントデータと作成者情報
   * @param {object} payload.eventData - フォームから入力されたイベントデータ
   * @param {string} payload.currentUserId - 操作ユーザーのID
   * @param {string} payload.currentUserName - 操作ユーザーの名前
   * @returns {Promise<void>}
   */
  async createEvent({ commit }, { eventData, currentUserId, currentUserName }) {
    try {
      commit('setError', null)
      const createdEvent = await addEventService(eventData, currentUserId, currentUserName)
      commit('addEvent', createdEvent)
    } catch (error) {
      commit('setError', error.message)
      throw error
    }
  },

  /**
   * イベント情報を更新し、現在の詳細表示ステートを同期する
   *
   * @param {object} context - Vuexのコンテキストオブジェクト
   * @param {(type: string, payload?: unknown) => void} context.commit - Mutationをコミットするための関数
   * @param {object} context.state - 現在のステート
   * @param {object} payload - 更新データ
   * @param {object} payload.eventData - 更新後のイベントフィールド
   * @param {string} payload.currentUserId - 操作ユーザーのID
   * @returns {Promise<void>}
   */
  async updateEvent({ commit, state }, { eventData, currentUserId }) {
    try {
      commit('setError', null)
      await updateEventService(state.currentEvent.eventId, eventData, currentUserId)
      commit('setCurrentEvent', { ...state.currentEvent, ...eventData })
    } catch (error) {
      commit('setError', error.message)
      throw error
    }
  },

  /**
   * イベントを削除し、ローカルのリストからも取り除く
   *
   * @param {object} context - Vuexのコンテキストオブジェクト
   * @param {(type: string, payload?: unknown) => void} context.commit - Mutationをコミットするための関数
   * @param {object} payload - 削除対象情報
   * @param {string} payload.eventId - 削除対象のイベントID
   * @param {string} payload.currentUserId - 操作ユーザーのID
   * @returns {Promise<void>}
   */
  async deleteEvent({ commit }, { eventId, currentUserId }) {
    try {
      commit('setError', null)
      await deleteEventService(eventId, currentUserId)
      commit('removeEvent', eventId)
    } catch (error) {
      commit('setError', error.message)
      throw error
    }
  },

  /**
   * 編集モードの状態を切り替える
   *
   * @param {object} context - Vuexのコンテキストオブジェクト
   * @param {(type: string, payload?: unknown) => void} context.commit - Mutationをコミットするための関数
   * @param {boolean} isEditing - 設定する編集モードの状態
   */
  toggleEditMode({ commit }, isEditing) {
    commit('setIsEditing', isEditing)
  },
}

const mutations = {
  addMonthlyEvents(state, { monthKey, events }) {
    const otherMonthEvents = state.events.filter(
      (e) => (e.date && e.date.substring(0, 7)) !== monthKey,
    )

    state.events = [...otherMonthEvents, ...events]

    if (!state.fetchedMonths.includes(monthKey)) {
      state.fetchedMonths.push(monthKey)
    }
  },
  setEvent(state, event) {
    state.event = event
  },
  setEvents(state, events) {
    state.events = events
  },
  addEvent(state, event) {
    state.events = [...state.events, event]
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
    state.isEditing = isEditing
  },
}

export default {
  namespaced: true, // モジュール化を明示
  state,
  getters,
  actions,
  mutations,
}
