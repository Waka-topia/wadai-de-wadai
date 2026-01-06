import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase/config'

/**
 * @param userId
 * @param displayName
 * @param groupId
 * @param stampId
 */
export async function addStampToUser(userId, displayName, groupId, stampId) {
  try {
    const stampRef = doc(db, `users/${userId}/stampsReceived`, stampId)

    // すでに同じ stampId が存在するか確認
    const existingStamp = await getDoc(stampRef)
    if (existingStamp.exists()) {
      return { exists: true } // 既に存在する場合のフラグを返す
    }

    // stampsReceived サブコレクションにスタンプデータを追加
    const stampData = {
      groupId,
      timestamp: serverTimestamp(),
    }
    await setDoc(stampRef, stampData)

    // ユーザードキュメントに displayName を保存
    const userRef = doc(db, `users/${userId}`)
    const userDoc = await getDoc(userRef)
    if (!userDoc.exists()) {
      // ユーザードキュメントが存在しない場合は作成
      await setDoc(userRef, { displayName })
    } else {
      // 既存のユーザードキュメントがある場合は更新
      await updateDoc(userRef, { displayName })
    }

    return { exists: false, stampId } // 正常に追加された場合の情報を返す
  } catch (error) {
    console.error('Error adding stamp: ', error)
    throw error
  }
}

// Firestoreからユーザーのスタンプデータを取得
/** @param userId */
export async function getUserStamps(userId) {
  try {
    const querySnapshot = await getDocs(collection(db, `users/${userId}/stampsReceived`))
    let stamps = []
    querySnapshot.forEach((doc) => {
      stamps.push({ id: doc.id, ...doc.data() })
    })
    return stamps
  } catch (error) {
    throw new Error(`Failed to fetch stamps: ${error.message}`)
  }
}

/** @param userId */
export async function getUserStampImages(userId) {
  try {
    // ユーザーの stampsReceived コレクションを取得
    const userStampsSnapshot = await getDocs(collection(db, `users/${userId}/stampsReceived`))
    const userStamps = userStampsSnapshot.docs.map((doc) => doc.id) // stampId のリスト

    // stamps コレクションから該当するスタンプのデータを取得
    const stampPromises = userStamps.map(async (stampId) => {
      const stampDoc = await getDoc(doc(db, 'stamps', stampId))
      return stampDoc.exists() ? { stampId, ...stampDoc.data() } : null
    })

    return (await Promise.all(stampPromises)).filter((item) => item !== null)
  } catch (error) {
    console.error('Error fetching user stamp images: ', error)
    throw error
  }
}
