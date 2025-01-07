//src/service/eventService.js
import { db } from "../firebase/config"; // Firebaseインスタンスをインポート
import { v4 as uuidv4 } from "uuid"; // UUID生成ライブラリを利用

/**
 * Firebaseに新しいイベントを登録する
 * @param {Object} eventData イベントデータ
 * @returns {Promise<void>}
 */
export const addEvent = async (eventData) => {
  try {
    const eventId = uuidv4(); // ユニークなイベントIDを生成

    const eventDoc = {
      ...eventData,
      eventId, // イベントIDを追加
    };

    await db.collection("events").doc(eventId).set(eventDoc);
  } catch (error) {
    console.error("Failed to add event:", error);
    throw new Error("イベントの登録に失敗しました");
  }
};

/**
 * Firebaseからイベント情報を取得する
 * @param {string} eventId イベントID
 * @returns {Promise<Object>}
 */
export const getEvent = async (eventId) => {
  try {
    const doc = await db.collection("events").doc(eventId).get();
    if (doc.exists) {
      return doc.data();
    } else {
      throw new Error("イベントが見つかりません");
    }
  } catch (error) {
    console.error("Failed to get event:", error);
    throw new Error("イベント情報の取得に失敗しました");
  }
};

/**
 * イベント情報を更新する
 * @param {string} eventId イベントID
 * @param {Object} eventData 更新データ
 * @returns {Promise<void>}
 */
export const updateEvent = async (eventId, eventData) => {
  try {
    await db.collection("events").doc(eventId).update(eventData);
  } catch (error) {
    console.error("Failed to update event:", error);
    throw new Error("イベントの更新に失敗しました");
  }
};

/**
 * イベントを削除する
 * @param {string} eventId イベントID
 * @returns {Promise<void>}
 */
export const deleteEvent = async (eventId) => {
  try {
    await db.collection("events").doc(eventId).delete();
  } catch (error) {
    console.error("Failed to delete event:", error);
    throw new Error("イベントの削除に失敗しました");
  }
};
