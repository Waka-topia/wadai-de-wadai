import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/firebase/config'

// TODO: 将来的には課金ユーザは、さらに優先表示できるようにするために数字で優先度を管理
const officialEventPriority = 10

/**
 * Usersコレクションの情報から公式認証ステータスを解決する
 *
 * @param {string} userId Firebase AuthのユーザーID
 * @returns {Promise<object>} 公式認証フラグとロール
 */
const resolveOfficialStatus = async (userId) => {
  if (!userId) {
    throw new Error('イベントを登録するにはログインが必要です')
  }

  const userRef = doc(db, 'users', userId)
  const userSnapshot = await getDoc(userRef)

  if (!userSnapshot.exists()) {
    return {
      isOfficial: false,
      role: 'general',
    }
  }

  const userData = userSnapshot.data()
  const role = userData.role || 'general'
  const isOfficial = Boolean(userData.isOfficial) || role === 'official'

  return {
    isOfficial,
    role,
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
  try {
    const { isOfficial, role } = await resolveOfficialStatus(userId)
    const eventId = uuidv4()
    const eventRef = doc(db, 'events', eventId)
    const createdEvent = {
      ...eventData,
      eventId,
      createdBy: userId,
      authorRole: role,
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

/**
 * 代表者証明申請をusersコレクションに保存する
 *
 * @param {string} userId Firebase AuthのユーザーID
 * @param {object} proveOwnerData 申請データ
 * @returns {Promise<void>}
 */
export const proveOwnerService = async (userId, proveOwnerData) => {
  try {
    if (!userId) {
      throw new Error('代表者証明を申請するにはログインが必要です')
    }

    if (!proveOwnerData) {
      throw new Error('申請データが不足しています')
    }

    const userRef = doc(db, 'users', userId)
    await setDoc(
      userRef,
      {
        isProvePending: true,
        proveOwnerApplication: {
          ...proveOwnerData,
          requestedAt: new Date().toISOString(),
        },
      },
      { merge: true },
    )
  } catch (error) {
    console.error('Failed to request prove owner:', error)
    throw new Error(`代表者証明の申請に失敗しました。${error.message}`)
  }
}

export const createRandomId = () => {
  return uuidv4()
}

/**
 * 代表者証明を申請したユーザー一覧を取得する
 *
 * @returns {Promise<Array>} 申請者一覧
 */
export const getProveOwnerApplicantsService = async () => {
  try {
    const usersRef = collection(db, 'users')
    const applicantsQuery = query(usersRef, where('isProvePending', '==', true))
    const usersSnapshot = await getDocs(applicantsQuery)

    return usersSnapshot.docs
      .map((userDoc) => {
        const userData = userDoc.data()
        return {
          userId: userDoc.id,
          tempId: userData.proveOwnerApplication?.tempId || null,
          userName: userData.proveOwnerApplication?.userName || null,
          organizationName: userData.proveOwnerApplication?.organizationName || null,
          email: userData.proveOwnerApplication?.email || null,
          isOfficial: Boolean(userData.isOfficial),
          isProvePending: Boolean(userData.isProvePending),
          proveOwnerApplication: userData.proveOwnerApplication || null,
        }
      })
      .filter((user) => Boolean(user.proveOwnerApplication))
  } catch (error) {
    console.error('Failed to get prove owner applicants:', error)
    throw new Error(`申請者一覧の取得に失敗しました。${error.message}`)
  }
}

/**
 * 代表者証明を申請したユーザーの情報を取得する
 *
 * @param {string} userId Firebase AuthのユーザーID
 * @returns {Promise<object>} 申請者情報
 */
export const getProveOwnerApplicantService = async (userId) => {
  try {
    if (!userId) {
      throw new Error('申請者情報を取得するにはユーザーIDが必要です')
    }

    const userRef = doc(db, 'users', userId)
    const userSnapshot = await getDoc(userRef)

    if (!userSnapshot.exists()) {
      throw new Error('申請者が見つかりません')
    }

    const userData = userSnapshot.data()

    if (!userData.proveOwnerApplication) {
      throw new Error('このユーザーは代表者証明を申請していません')
    }

    return {
      userId,
      tempId: userData.proveOwnerApplication?.tempId || null,
      userName: userData.proveOwnerApplication?.userName || null,
      organizationName: userData.proveOwnerApplication?.organizationName || null,
      email: userData.proveOwnerApplication?.email || null,
      isOfficial: Boolean(userData.isOfficial),
      isProvePending: Boolean(userData.isProvePending),
      proveOwnerApplication: userData.proveOwnerApplication || null,
    }
  } catch (error) {
    throw new Error(`申請者情報の取得に失敗しました。${error.message}`)
  }
}

/**
 * 代表者証明申請の承認状態を更新する
 *
 * @param {string} userId Firebase AuthのユーザーID
 * @param {boolean} isApproved 承認状態
 * @returns {Promise<void>}
 */
export const updateProveOwnerApprovalService = async (userId, isApproved) => {
  try {
    if (!userId) {
      throw new Error('承認状態を更新するには認証が必要です')
    }

    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      isOfficial: isApproved,
      isProvePending: false,
      role: isApproved ? 'official' : 'general',
      'proveOwnerApplication.reviewedAt': new Date().toISOString(),
      'proveOwnerApplication.reviewedStatus': isApproved ? 'approved' : 'rejected',
    })
  } catch (error) {
    console.error('Failed to update prove owner approval:', error)
    throw new Error(`承認状態の更新に失敗しました。${error.message}`)
  }
}
