//src/service/eventService.js
import { db } from "../firebase/config"; // Firebaseインスタンスをインポート
import { v4 as uuidv4 } from "uuid"; // UUID生成ライブラリを利用
import bcrypt from "bcryptjs"; // bcryptをインポート
import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, getDocs } from "firebase/firestore"; // 必要なFirestoreの関数をインポート

/**
 * Firebaseのorganizersコレクションから団体情報を取得し、パスワードを検証する
 * @param {string} organizerId 団体ID
 * @param {string} inputPassword ユーザーが入力したパスワード
 * @returns {Promise<boolean>} パスワードが一致すればtrue、それ以外はfalse
 */
export const verifyOrganizerPassword = async (organizerId, inputPassword) => {
  try {
    const docRef = doc(db, "organizers", organizerId);  // コレクションを指定
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("団体が見つかりません");
    }

    const organizerData = docSnap.data();
    const passwordHash = organizerData.passwordHash;

    // bcryptで入力されたパスワードをハッシュと比較
    const isPasswordValid = await bcrypt.compare(inputPassword, passwordHash);

    return isPasswordValid;
  } catch (error) {
    console.error("Failed to verify organizer password:", error);
    throw new Error("パスワードの検証に失敗しました");
  }
};

/**
 * Firebaseに新しいイベントを登録する
 * @param {Object} eventData イベントデータ
 * @param {string} organizerId 団体ID
 * @returns {Promise<void>}
 */
export const addEvent = async (eventData, organizerId) => {
  try {
    const eventId = uuidv4(); // ユニークなイベントIDを生成

    const eventDoc = {
      ...eventData,
      eventId, // イベントIDを追加
      organizerId, // 団体IDを追加
    };

    const eventRef = doc(db, "events", eventId); // コレクション参照
    await setDoc(eventRef, eventDoc);
  } catch (error) {
    console.error("Failed to add event:", error);
    throw new Error("イベントの登録に失敗しました");
  }
};

/**
 * Firebaseから単一のイベント情報を取得する
 * @param {string} eventId イベントID
 * @returns {Promise<Object>}
 */
export const getEvent = async (eventId) => {
  try {
    const docRef = doc(db, "events", eventId); // コレクション参照
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      throw new Error("イベントが見つかりません");
    }
  } catch (error) {
    console.error("Failed to get event:", error);
    throw new Error("イベント情報の取得に失敗しました");
  }
};

/**
 * Firebaseから全てのイベント情報を取得する
 * @returns {Promise<Array>} イベント情報のリスト
 */
export const getEvents = async () => {
  try {
    const eventsSnapshot = await getDocs(collection(db, "events")); // コレクション参照
    const eventsList = eventsSnapshot.docs.map(doc => doc.data()); // ドキュメントからデータを抽出
    return eventsList;
  } catch (error) {
    console.error("Failed to get events:", error);
    throw new Error("イベント情報の取得に失敗しました");
  }
};

/**
 * イベント情報を更新する
 * @param {string} eventId イベントID
 * @param {Object} eventData 更新データ
 * @param {string} organizerId 団体ID
 * @param {string} inputPassword ユーザーが入力したパスワード
 * @returns {Promise<void>}
 */
export const updateEvent = async (eventId, eventData, organizerId, inputPassword) => {
  try {
    // イベント情報を取得して団体IDを確認
    const event = await getEvent(eventId);
    if (event.organizerId !== organizerId) {
      throw new Error("団体IDが一致しません");
    }

    // 団体IDとパスワードを検証
    const isPasswordValid = await verifyOrganizerPassword(organizerId, inputPassword);
    if (!isPasswordValid) {
      throw new Error("パスワードが正しくありません");
    }

    const eventRef = doc(db, "events", eventId); // コレクション参照
    await updateDoc(eventRef, eventData);
  } catch (error) {
    console.error("Failed to update event:", error);
    throw new Error("イベントの更新に失敗しました");
  }
};

/**
 * イベントを削除する
 * @param {string} eventId イベントID
 * @param {string} organizerId 団体ID
 * @param {string} inputPassword ユーザーが入力したパスワード
 * @returns {Promise<void>}
 */
export const deleteEvent = async (eventId, organizerId, inputPassword) => {
  try {
    // イベント情報を取得して団体IDを確認
    const event = await getEvent(eventId);
    if (event.organizerId !== organizerId) {
      throw new Error("団体IDが一致しません");
    }

    // 団体IDとパスワードを検証
    const isPasswordValid = await verifyOrganizerPassword(organizerId, inputPassword);
    if (!isPasswordValid) {
      throw new Error("パスワードが正しくありません");
    }

    const eventRef = doc(db, "events", eventId); // コレクション参照
    await deleteDoc(eventRef);
  } catch (error) {
    console.error("Failed to delete event:", error);
    throw new Error("イベントの削除に失敗しました");
  }
};
