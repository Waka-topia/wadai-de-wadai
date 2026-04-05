import { arrayUnion, collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
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
 * Firebaseに新しいイベントを登録する（月別コレクションの配列に追加）
 *
 * @param {object} eventData イベントデータ
 * @param {string} userId Firebase AuthのユーザーID
 * @param {string} userName Firebase Authのユーザー名
 * @returns {Promise<object>} 作成されたイベントデータ
 */
export const addEventService = async (eventData, userId, userName) => {
  if (!eventData) throw new Error('イベントデータが提供されていません')
  if (!userId) throw new Error('イベントを登録するにはログインが必要です')
  if (!userName) throw new Error('イベントを登録するにはユーザー名が必要です')

  try {
    const { isOfficial, role } = await resolveOfficialStatus(userId, eventData.organizationId)

    // FireBaseに保存するイベントデータに必要なフィールドを追加
    const eventId = uuidv4()
    const createdEvent = {
      ...eventData,
      eventId,
      createdBy: userId,
      createdByName: userName || '匿名ユーザー',
      role,
      isOfficial,
      eventPriority: isOfficial ? officialEventPriority : 0,
    }

    // 日付(YYYY-MM-DD)から「YYYY-MM」の部分を抽出して月キーを作成
    const dateStr = eventData.date || ''
    const monthKey = dateStr.length >= 7 ? dateStr.substring(0, 7) : 'unknown_month'

    // 該当月のドキュメントへの参照
    const monthDocRef = doc(db, 'events_monthly', monthKey)

    // merge: true を指定することで、ドキュメントが存在しない場合は新規作成し、
    // 存在する場合は既存データを上書きせずに events 配列にだけ追加 (arrayUnion) します。
    await setDoc(
      monthDocRef,
      {
        events: arrayUnion(createdEvent),
      },
      { merge: true },
    )

    return createdEvent
  } catch (error) {
    console.error('Failed to add event:', error)
    throw new Error(`イベントの登録に失敗しました。${error.message}`)
  }
}

/**
 * Firebaseから全てのイベント情報を取得する（月別コレクションから取得して平坦化）
 *
 * @returns {Promise<Array>} イベント情報のリスト
 */
export const getEventsService = async () => {
  try {
    const eventsSnapshot = await getDocs(collection(db, 'events_monthly'))
    let allEvents = []

    eventsSnapshot.docs.forEach((docSnap) => {
      const data = docSnap.data()
      // events配列が存在すれば、全体リストに結合する
      if (data.events && Array.isArray(data.events)) {
        allEvents = allEvents.concat(data.events)
      }
    })

    return allEvents
  } catch (error) {
    console.error('Failed to get events:', error)
    throw new Error(`イベント情報の取得に失敗しました。${error.message}`)
  }
}

/**
 * Firebaseから単一のイベント情報を取得する（月別コレクションから検索）
 *
 * @param {string} eventId イベントID
 * @returns {Promise<object>} イベントデータ
 */
export const getEventService = async (eventId) => {
  try {
    const eventsSnapshot = await getDocs(collection(db, 'events_monthly'))

    // 全ての月別ドキュメントの中から、該当のイベントIDを持つデータを探す
    for (const docSnap of eventsSnapshot.docs) {
      const data = docSnap.data()
      if (data.events && Array.isArray(data.events)) {
        // コンバート時に 'original_doc_id' としてもIDを保持したため、両方で判定
        const foundEvent = data.events.find(
          (e) => e.eventId === eventId || e.original_doc_id === eventId,
        )
        if (foundEvent) {
          return foundEvent
        }
      }
    }

    throw new Error('イベントが見つかりません')
  } catch (error) {
    console.error('Failed to get event:', error)
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

export const updateEventService = async (eventId, eventData, userId) => {
  try {
    await verifyEventOwnership(eventId, userId)
    const oldEvent = await getEventService(eventId)

    const oldMonthKey =
      oldEvent.date && oldEvent.date.length >= 7 ? oldEvent.date.substring(0, 7) : 'unknown_month'
    const newMonthKey =
      eventData.date && eventData.date.length >= 7
        ? eventData.date.substring(0, 7)
        : 'unknown_month'

    if (oldMonthKey === newMonthKey) {
      const monthDocRef = doc(db, 'events_monthly', oldMonthKey)
      const monthSnap = await getDoc(monthDocRef)
      if (monthSnap.exists()) {
        let eventsList = monthSnap.data().events || []
        const index = eventsList.findIndex(
          (e) => e.eventId === eventId || e.original_doc_id === eventId,
        )
        if (index !== -1) {
          eventsList[index] = { ...eventsList[index], ...eventData }
          await updateDoc(monthDocRef, { events: eventsList })
        }
      }
    } else {
      const oldMonthDocRef = doc(db, 'events_monthly', oldMonthKey)
      const oldMonthSnap = await getDoc(oldMonthDocRef)
      if (oldMonthSnap.exists()) {
        let oldEventsList = oldMonthSnap.data().events || []
        oldEventsList = oldEventsList.filter(
          (e) => e.eventId !== eventId && e.original_doc_id !== eventId,
        )
        await updateDoc(oldMonthDocRef, { events: oldEventsList })
      }

      const newMonthDocRef = doc(db, 'events_monthly', newMonthKey)
      const updatedEvent = { ...oldEvent, ...eventData }
      await setDoc(newMonthDocRef, { events: arrayUnion(updatedEvent) }, { merge: true })
    }
  } catch (error) {
    console.error('Failed to update event:', error)
    throw new Error(`イベントの更新に失敗しました。${error.message}`)
  }
}

export const deleteEventService = async (eventId, userId) => {
  try {
    await verifyEventOwnership(eventId, userId)
    const event = await getEventService(eventId)
    const monthKey =
      event.date && event.date.length >= 7 ? event.date.substring(0, 7) : 'unknown_month'

    const monthDocRef = doc(db, 'events_monthly', monthKey)
    const monthSnap = await getDoc(monthDocRef)

    if (monthSnap.exists()) {
      let eventsList = monthSnap.data().events || []
      eventsList = eventsList.filter((e) => e.eventId !== eventId && e.original_doc_id !== eventId)
      await updateDoc(monthDocRef, { events: eventsList })
    }
  } catch (error) {
    console.error('Failed to delete event:', error)
    throw new Error(`イベントの削除に失敗しました。${error.message}`)
  }
}
