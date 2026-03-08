import { db } from '@/firebase/config'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'

/**
 * 講義ごとのマイクロレビュー（回ごとの楽単度評価）を管理するサービス
 *
 * Firestore のパス:
 *   lecture_reviews/{nameNormalized}/reviews/{uid}
 *     - difficulty: number   1（楽）〜 5（難）
 *     - comment: string      短いコメント（任意）
 *     - authorName: string
 *     - createdAt: Timestamp
 *     - updatedAt: Timestamp
 */
const getReviewsRef = (nameNormalized) =>
  collection(db, 'lecture_reviews', nameNormalized, 'reviews')

const getReviewRef = (nameNormalized, uid) =>
  doc(db, 'lecture_reviews', nameNormalized, 'reviews', uid)

/**
 * レビュー一覧を取得する（新着順）
 * @param {string} nameNormalized - 正規化された講義名
 * @returns {Promise<Array>} レビューの配列
 */
export const fetchReviews = async (nameNormalized) => {
  if (!nameNormalized) return []
  const q = query(getReviewsRef(nameNormalized), orderBy('updatedAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ uid: d.id, ...d.data() }))
}

/**
 * 既存のレビューを取得（uidが一致するもの）
 * @param {string} nameNormalized - 正規化された講義名
 * @param {string} uid - ユーザーUID
 * @returns {Promise<Object|null>} レビューデータまたはnull
 */
export const fetchMyReview = async (nameNormalized, uid) => {
  const snap = await getDoc(getReviewRef(nameNormalized, uid))
  return snap.exists() ? snap.data() : null
}

/**
 * レビューを保存（uidをキーにするので1人1件）
 * @param {string} nameNormalized - 正規化された講義名
 * @param {string} uid - ユーザーUID
 * @param {{ difficulty: number, comment: string, authorName: string }} data - レビュー内容
 */
export const saveReview = async (nameNormalized, uid, data) => {
  const ref = getReviewRef(nameNormalized, uid)
  const existing = await getDoc(ref)
  await setDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
    createdAt: existing.exists() ? existing.data().createdAt : serverTimestamp(),
  })
}

/**
 * 平均難易度スコアを計算する
 * @param {Array<{difficulty: number}>} reviews - レビュー配列
 * @returns {number} 平均スコア（0なら評価なし）
 */
export const calcAverageDifficulty = (reviews) => {
  if (!reviews.length) return 0
  return reviews.reduce((sum, r) => sum + r.difficulty, 0) / reviews.length
}
