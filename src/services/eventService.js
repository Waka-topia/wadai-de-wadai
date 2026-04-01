import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/firebase/config'

// Note: 将来的には課金ユーザをさらに優先表示できるよう、数字で優先度を管理する
const officialEventPriority = 10

/**
 * GroupRepresentativesコレクションから公式認証ステータスを解決する
 *
 * @param {string} userId Firebase AuthのユーザーID
 * @param {string} organizationId 団体ID
 * @returns {Promise<object>} 公式認証フラグとロール
 */
const resolveOfficialStatus = async (userId, organizationId) => {
  if (!userId) throw new Error('イベントを登録するにはログインが必要です')
  if (!organizationId) throw new Error('イベントを登録するには団体IDが必要です')

  // 他ユーザのデータにアクセスしないよう、ユーザIDと団体IDの組み合わせの粒度でデータを取得する
  const representativeRef = doc(db, 'groupRepresentatives', `${organizationId}_${userId}`)
  const representativeSnapshot = await getDoc(representativeRef)
  const data = representativeSnapshot.data()

  const isOfficial = !!(representativeSnapshot.exists() && data?.isActive === true)

  return {
    isOfficial,
    role: isOfficial ? 'official' : 'general',
  }
}

/**
 * Firebaseに新しいイベントを登録する
 *
 * @param {object} eventData イベントデータ
 * @param {string} userId Firebase AuthのユーザーID
 * @returns {Promise<object>} 作成されたイベントデータ
 */
export const addEventService = async (eventData, userId) => {
  if (!eventData) throw new Error('イベントデータが提供されていません')
  if (!userId) throw new Error('イベントを登録するにはログインが必要です')

  try {
    const { isOfficial, role } = await resolveOfficialStatus(userId, eventData.organizationId)

    // FireBaseに保存するイベントデータに必要なフィールドを追加
    const eventId = uuidv4()
    const eventRef = doc(db, 'events', eventId)
    const createdEvent = {
      ...eventData,
      eventId,
      createdBy: userId,
      role,
      isOfficial,
      eventPriority: isOfficial ? officialEventPriority : 0,
    }

    await setDoc(eventRef, createdEvent)
    return createdEvent
  } catch (error) {
    console.error('Failed to add event:', error)
    throw new Error(`イベントの登録に失敗しました。${error.message}`)
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
    throw new Error(`イベント情報の取得に失敗しました。${error.message}`)
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
    throw new Error(`イベント情報の取得に失敗しました。${error.message}`)
  }
}

/**
 * イベントの所有者を検証する（createdByと認証ユーザーの一致確認）
 *
 * @param {string} eventId イベントID
 * @param {string} userId Firebase AuthのユーザーID
 * @returns {Promise<void>}
 * @throws {Error} 所有者情報がない、または作成者本人でない場合
 */
const verifyEventOwnership = async (eventId, userId) => {
  if (!userId) {
    throw new Error('イベントを操作するにはログインが必要です')
  }

  const event = await getEventService(eventId)

  if (!event.createdBy) {
    throw new Error('このイベントは旧方式データのため編集・削除できません')
  }

  if (event.createdBy !== userId) {
    throw new Error('このイベントを操作する権限がありません')
  }
}

/**
 * イベント情報を更新する
 *
 * @param {string} eventId イベントID
 * @param {object} eventData 更新データ
 * @param {string} userId Firebase AuthのユーザーID
 * @returns {Promise<void>}
 */
export const updateEventService = async (eventId, eventData, userId) => {
  try {
    await verifyEventOwnership(eventId, userId)
    const eventRef = doc(db, 'events', eventId)
    await updateDoc(eventRef, eventData)
  } catch (error) {
    console.error('Failed to update event:', error)
    throw new Error(`イベントの更新に失敗しました。${error.message}`)
  }
}

/**
 * イベントを削除する
 *
 * @param {string} eventId イベントID
 * @param {string} userId Firebase AuthのユーザーID
 * @returns {Promise<void>}
 */
export const deleteEventService = async (eventId, userId) => {
  try {
    await verifyEventOwnership(eventId, userId)
    const eventRef = doc(db, 'events', eventId)
    await deleteDoc(eventRef)
  } catch (error) {
    console.error('Failed to delete event:', error)
    throw new Error(`イベントの削除に失敗しました。${error.message}`)
  }
}
