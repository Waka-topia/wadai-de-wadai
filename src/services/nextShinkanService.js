import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

/**
 * 新歓データを Firestore に保存する
 *
 * @param {string} userId ユーザー ID
 * @param {string} groupName 団体名
 * @param {string} nextDate 次に行く日付
 */
export async function saveNextShinkan(userId, groupName, nextDate) {
  try {
    const docRef = doc(db, `users/${userId}/NextShinkan`, 'details')

    await setDoc(docRef, {
      groupName,
      nextDate,
    })
  } catch (error) {
    console.error(error)
    throw error
  }
}

/**
 * ユーザーIDに基づいて次の新歓情報を取得する
 *
 * @param {string} userId ユーザーID
 * @returns {object} 次の新歓データ
 */
export async function getNextShinkan(userId) {
  try {
    const docRef = doc(db, `users/${userId}/NextShinkan`, 'details')

    const docSnap = await getDoc(docRef)

    return docSnap.data()
  } catch (error) {
    console.error(error)
    throw error
  }
}
