import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'

export const fetchUserData = async (userId) => {
  try {
    if (!userId) throw new Error('ユーザーIDが不足しています')

    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) throw new Error('ユーザーデータが見つかりません')

    return userSnap.data()
  } catch (error) {
    throw new Error(`ユーザーデータの取得に失敗しました。${error.message}`)
  }
}
