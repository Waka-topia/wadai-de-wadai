import { doc, getDoc } from 'firebase/firestore'
import { resolveUserIcon } from '@/data/userIcons'
import { db } from '@/firebase/config'

/**
 * ユーザードキュメントを取得し、画面表示用に整形する
 *
 * @param {string} userId - Firebase Auth の UID
 * @returns {Promise<object>} 表示用のユーザー情報
 */
export const fetchUserData = async (userId) => {
  try {
    if (!userId) throw new Error('ユーザーIDが不足しています')

    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    const userData = userSnap.data()

    if (!userSnap.exists()) throw new Error('ユーザーデータが見つかりません')

    const user = {
      ...userData,
      userName: userData.displayName || 'Unknown',
      email: userData.email || 'メールアドレスが設定されていません',
      userId: userId || 'ユーザーIDが設定されていません',
      iconId: userData.iconId || '',
      userIconUrl: resolveUserIcon(userData.iconId),
      nextShinkan: userData.nextShinkan || null,
    }

    return user
  } catch (error) {
    throw new Error(`ユーザーデータの取得に失敗しました。${error.message}`)
  }
}
