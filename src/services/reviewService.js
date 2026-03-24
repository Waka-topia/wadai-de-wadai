import { doc, getDoc, getFirestore, runTransaction } from 'firebase/firestore'

/**
 * 講義の平均評価とレビュー件数を取得する
 *
 * @param {string} lectureName - 講義名
 * @returns {Promise<{ average: number; count: number } | null>} セッション情報
 */
export const getLectureReviewStats = async (lectureName) => {
  if (!lectureName) return null
  const db = getFirestore()
  const docRef = doc(db, 'lecture_reviews', lectureName)
  const snap = await getDoc(docRef)
  if (!snap.exists()) return { average: 0, count: 0 }
  return snap.data()
}

/**
 * ユーザー自身の評価を取得する
 *
 * @param {string} lectureName - 講義名
 * @param {string} uid - ユーザーID
 * @returns {Promise<number>} 星の数(0-5)
 */
export const getUserRating = async (lectureName, uid) => {
  if (!lectureName || !uid) return null
  const db = getFirestore()
  const docRef = doc(db, 'lecture_reviews', lectureName, 'ratings', uid)
  const snap = await getDoc(docRef)
  return snap.exists() ? snap.data().rating : 0
}

/**
 * ユーザーの評価を送信・更新する（トランザクション処理）
 *
 * @param {string} lectureName - 講義名
 * @param {string} uid - ユーザーID
 * @param {number} rating - 新しい星の数
 * @returns {Promise<void>} なし
 */
export const submitUserRating = async (lectureName, uid, rating) => {
  if (!lectureName || !uid || !rating) return
  const db = getFirestore()
  const statsRef = doc(db, 'lecture_reviews', lectureName)
  const ratingRef = doc(db, 'lecture_reviews', lectureName, 'ratings', uid)

  await runTransaction(db, async (transaction) => {
    const statsDoc = await transaction.get(statsRef)
    const ratingDoc = await transaction.get(ratingRef)

    let totalRatings = 0
    let currentAverage = 0

    if (statsDoc.exists()) {
      totalRatings = statsDoc.data().count || 0
      currentAverage = statsDoc.data().average || 0
    }

    const previousRating = ratingDoc.exists() ? ratingDoc.data().rating : null

    let newTotalRatings = totalRatings
    let sum = currentAverage * totalRatings

    if (previousRating !== null) {
      if (previousRating === rating) return // 変更なし
      sum = sum - previousRating + rating
    } else {
      newTotalRatings += 1
      sum += rating
    }

    const newAverage = newTotalRatings > 0 ? sum / newTotalRatings : 0

    transaction.set(statsRef, { average: newAverage, count: newTotalRatings }, { merge: true })
    transaction.set(ratingRef, { rating, updatedAt: new Date() }, { merge: true })
  })
}
