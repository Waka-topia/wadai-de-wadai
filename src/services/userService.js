import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'

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
      userIconUrl: userData.photoURL || '/src/assets/userIcon/defaultIcon.png',
    }

    return user
  } catch (error) {
    throw new Error(`ユーザーデータの取得に失敗しました。${error.message}`)
  }
}
