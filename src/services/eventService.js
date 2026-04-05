import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  setDoc,
} from 'firebase/firestore'
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

/**
 * イベント情報を更新する（トランザクションを使用して競合を防止）
 *
 * @param {string} eventId イベントID
 * @param {object} eventData 更新データ
 * @param {string} userId Firebase AuthのユーザーID
 * @returns {Promise<void>}
 */
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

    const oldMonthDocRef = doc(db, 'events_monthly', oldMonthKey)
    const newMonthDocRef = doc(db, 'events_monthly', newMonthKey)

    await runTransaction(db, async (transaction) => {
      if (oldMonthKey === newMonthKey) {
        // パターンA: 日付（月）が変更されていない場合（同じドキュメント内の更新）
        const monthSnap = await transaction.get(oldMonthDocRef)
        if (!monthSnap.exists()) {
          throw new Error('対象の月別データが存在しません。')
        }

        let eventsList = monthSnap.data().events || []
        const index = eventsList.findIndex(
          (e) => e.eventId === eventId || e.original_doc_id === eventId,
        )

        if (index !== -1) {
          eventsList[index] = { ...eventsList[index], ...eventData }
          transaction.update(oldMonthDocRef, { events: eventsList })
        } else {
          throw new Error('更新対象のイベントが見つかりません。')
        }
      } else {
        // パターンB: 日付（月）が変更された場合（古い月から削除し、新しい月へ追加）
        // ※Firestoreのルール: トランザクション内では、すべての「読み込み」を「書き込み」より先に行う必要があります。
        const oldMonthSnap = await transaction.get(oldMonthDocRef)
        const newMonthSnap = await transaction.get(newMonthDocRef)

        // 1. 古い月からの削除
        if (oldMonthSnap.exists()) {
          let oldEventsList = oldMonthSnap.data().events || []
          oldEventsList = oldEventsList.filter(
            (e) => e.eventId !== eventId && e.original_doc_id !== eventId,
          )
          transaction.update(oldMonthDocRef, {
            events: oldEventsList,
            totalCount: oldEventsList.length,
          })
        }

        // 2. 新しい月への追加
        const updatedEvent = { ...oldEvent, ...eventData }
        if (newMonthSnap.exists()) {
          let newEventsList = newMonthSnap.data().events || []
          newEventsList.push(updatedEvent)
          transaction.update(newMonthDocRef, {
            events: newEventsList,
            totalCount: newEventsList.length,
          })
        } else {
          // 新しい月のドキュメントがまだ存在しない場合は作成
          transaction.set(newMonthDocRef, {
            events: [updatedEvent],
            totalCount: 1,
          })
        }
      }
    })
  } catch (error) {
    console.error('Failed to update event with transaction:', error)
    throw new Error(`イベントの更新に失敗しました。${error.message}`)
  }
}

/**
 * イベントを削除する（トランザクションを使用して競合を防止）
 *
 * @param {string} eventId イベントID
 * @param {string} userId Firebase AuthのユーザーID
 * @returns {Promise<void>}
 */
export const deleteEventService = async (eventId, userId) => {
  try {
    // 1. 所有権の確認（これはトランザクション外で行ってOKです）
    await verifyEventOwnership(eventId, userId)

    // 2. イベントの月を取得（月別ドキュメントを特定するため）
    const event = await getEventService(eventId)
    const monthKey =
      event.date && event.date.length >= 7 ? event.date.substring(0, 7) : 'unknown_month'
    const monthDocRef = doc(db, 'events_monthly', monthKey)

    // 3. トランザクションの実行
    await runTransaction(db, async (transaction) => {
      // トランザクション内で最新のドキュメントを読み込む
      const monthSnap = await transaction.get(monthDocRef)

      if (!monthSnap.exists()) {
        throw new Error('対象の月別データが存在しません。')
      }

      let eventsList = monthSnap.data().events || []

      // 削除対象のイベントを配列から除外
      const originalLength = eventsList.length
      eventsList = eventsList.filter((e) => e.eventId !== eventId && e.original_doc_id !== eventId)

      // もし配列の長さが変わっていなければ、すでに他の人に削除された可能性がある
      if (eventsList.length === originalLength) {
        throw new Error('すでに削除されているか、データが見つかりません。')
      }

      // トランザクション内で更新を予約する
      transaction.update(monthDocRef, {
        events: eventsList,
        totalCount: eventsList.length, // ついでに件数も更新しておきます
      })
    })
  } catch (error) {
    console.error('Failed to delete event with transaction:', error)
    throw new Error(`イベントの削除に失敗しました。${error.message}`)
  }
}
