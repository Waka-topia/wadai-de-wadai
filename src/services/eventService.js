import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/firebase/config'

/**
 * Firebaseのorganizersコレクションから団体情報を取得し、パスワードを検証する
 *
 * @param {string} organizerId 団体ID
 * @param {string} inputPassword ユーザーが入力したパスワード
 * @returns {Promise<boolean>} パスワードが一致すればtrue、それ以外はfalse
 */
export const verifyOrganizerPassword = async (organizerId, inputPassword) => {
  try {
    const docRef = doc(db, 'organizers', organizerId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      throw new Error('団体が見つかりません')
    }

    const { passwordHash } = docSnap.data()
    return await bcrypt.compare(inputPassword, passwordHash)
  } catch (error) {
    console.error('Failed to verify organizer password:', error)
    throw new Error('パスワードの検証に失敗しました')
  }
}

/**
 * Firebaseに新しいイベントを登録する
 *
 * @param {object} eventData イベントデータ
 * @param {string} organizerId 団体ID
 * @param {string} inputPassword ユーザーが入力したパスワード
 * @returns {Promise<void>}
 */
export const addEventService = async (eventData, organizerId, inputPassword) => {
  try {
    // await verifyOrganizerPassword(organizerId, inputPassword)
    console.log(inputPassword)
    const eventId = uuidv4()
    const eventRef = doc(db, 'events', eventId)
    await setDoc(eventRef, { ...eventData, eventId, organizerId })
  } catch (error) {
    console.error('Failed to add event:', error)
    throw new Error('イベントの登録に失敗しました')
  }
}

/**
 * Firebaseから単一のイベント情報を取得する
 *
 * @param {string} eventId イベントID
 * @returns {Promise<object>} イベントデータ
 */
export const getEventService = async (eventId) => {
  try {
    const docRef = doc(db, 'events', eventId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      throw new Error('イベントが見つかりません')
    }

    return docSnap.data()
  } catch (error) {
    console.error('Failed to get event:', error)
    throw new Error('イベント情報の取得に失敗しました')
  }
}

/**
 * Firebaseから全てのイベント情報を取得する
 *
 * @returns {Promise<Array>} イベント情報のリスト
 */
export const getEventsService = async () => {
  try {
    const eventsSnapshot = await getDocs(collection(db, 'events'))
    return eventsSnapshot.docs.map((eventDoc) => eventDoc.data())
  } catch (error) {
    console.error('Failed to get events:', error)
    throw new Error('イベント情報の取得に失敗しました')
  }
}

/**
 * イベントの所有者を検証する（団体IDの一致確認 + パスワード検証）
 *
 * @param {string} eventId イベントID
 * @param {string} organizerId 団体ID
 * @param {string} inputPassword ユーザーが入力したパスワード
 * @returns {Promise<void>}
 * @throws {Error} 団体IDが一致しない、またはパスワードが正しくない場合
 */
const verifyEventOwnership = async (eventId, organizerId, inputPassword) => {
  const event = await getEventService(eventId)
  if (event.organizerId !== organizerId) {
    throw new Error('団体IDが一致しません')
  }

  const isPasswordValid = await verifyOrganizerPassword(organizerId, inputPassword)
  if (!isPasswordValid) {
    throw new Error('パスワードが正しくありません')
  }
}

/**
 * イベント情報を更新する
 *
 * @param {string} eventId イベントID
 * @param {object} eventData 更新データ
 * @param {string} organizerId 団体ID
 * @param {string} inputPassword ユーザーが入力したパスワード
 * @returns {Promise<void>}
 */
export const updateEventService = async (eventId, eventData, organizerId, inputPassword) => {
  try {
    await verifyEventOwnership(eventId, organizerId, inputPassword)
    const eventRef = doc(db, 'events', eventId)
    await updateDoc(eventRef, eventData)
  } catch (error) {
    console.error('Failed to update event:', error)
    throw new Error('イベントの更新に失敗しました')
  }
}

/**
 * イベントを削除する
 *
 * @param {string} eventId イベントID
 * @param {string} organizerId 団体ID
 * @param {string} inputPassword ユーザーが入力したパスワード
 * @returns {Promise<void>}
 */
export const deleteEventService = async (eventId, organizerId, inputPassword) => {
  try {
    await verifyEventOwnership(eventId, organizerId, inputPassword)
    const eventRef = doc(db, 'events', eventId)
    await deleteDoc(eventRef)
  } catch (error) {
    console.error('Failed to delete event:', error)
    throw new Error('イベントの削除に失敗しました')
  }
}
