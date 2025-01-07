//src/store/modules/event.js
import { addEvent, getEvent, updateEvent, deleteEvent } from "../../services/eventService";

const state = {
  events: [], // イベントデータを格納
  error: null, // エラー情報
  currentEvent: null, // 編集中のイベント
  isEditing: false, // 編集モード
};

const getters = {
  allEvents: (state) => state.events, // 全てのイベントを取得
  currentEvent: (state) => state.currentEvent, // 編集中のイベント
  isEditing: (state) => state.isEditing, // 編集モードかどうか
  eventError: (state) => state.error, // エラー情報を取得
};

const actions = {
  /**
   * Firebaseから指定したイベントの情報を取得する
   * @param {Object} context Vuexのコンテキスト
   * @param {string} eventId イベントID
   */
  async fetchEvent({ commit }, eventId) {
    try {
      commit("setError", null); // エラー情報をクリア
      const event = await getEvent(eventId);
      commit("setCurrentEvent", event);
    } catch (error) {
      commit("setError", error.message);
    }
  },

  /**
   * イベントを新規登録する
   * @param {Object} context Vuexのコンテキスト
   * @param {Object} eventData イベントデータ
   */
  async createEvent({ commit }, eventData) {
    try {
      commit("setError", null); // エラー情報をクリア
      await addEvent(eventData);
    } catch (error) {
      commit("setError", error.message);
    }
  },

  /**
   * イベント情報を更新する
   * @param {Object} context Vuexのコンテキスト
   * @param {Object} eventData 更新データ
   */
  async updateEvent({ commit, state }, eventData) {
    try {
      commit("setError", null);
      await updateEvent(state.currentEvent.eventId, eventData);
      commit("setCurrentEvent", eventData); // 編集内容を反映
    } catch (error) {
      commit("setError", error.message);
    }
  },

  /**
   * イベントを削除する
   * @param {Object} context Vuexのコンテキスト
   * @param {string} eventId イベントID
   */
  async deleteEvent({ commit }, eventId) {
    try {
      commit("setError", null);
      await deleteEvent(eventId);
      commit("removeEvent", eventId); // ローカルストアから削除
    } catch (error) {
      commit("setError", error.message);
    }
  },

  /**
   * 編集モードを切り替える
   * @param {Object} context Vuexのコンテキスト
   * @param {boolean} isEditing 編集モードの状態
   */
  toggleEditing({ commit }, isEditing) {
    commit("setEditing", isEditing);
  },
};

const mutations = {
  /**
   * イベント情報を設定
   * @param {Object} state Vuexの状態
   * @param {Object} eventData イベントデータ
   */
  setCurrentEvent(state, eventData) {
    state.currentEvent = eventData;
  },

  /**
   * イベントのエラー情報を設定
   * @param {Object} state Vuexの状態
   * @param {String|null} error エラー情報
   */
  setError(state, error) {
    state.error = error;
  },

  /**
   * 編集モードの状態を設定
   * @param {Object} state Vuexの状態
   * @param {Boolean} isEditing 編集モードの状態
   */
  setEditing(state, isEditing) {
    state.isEditing = isEditing;
  },

  /**
   * イベントをローカルストアから削除
   * @param {Object} state Vuexの状態
   * @param {String} eventId イベントID
   */
  removeEvent(state, eventId) {
    state.events = state.events.filter((event) => event.eventId !== eventId);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
