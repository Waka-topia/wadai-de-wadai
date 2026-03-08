import { db } from '@/firebase/config'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'

/**
 * ピア・アラート（課題・テスト情報の同一講義受講者間共有）を管理するサービス
 *
 * Firestore のパス:
 *   lecture_alerts/{nameNormalized}/alerts/{alertId}
 *     - content: string     テキスト内容（例: "3/15 レポート締切"）
 *     - authorUid: string   投稿者のUID
 *     - authorName: string  投稿者の表示名
 *     - lectureName: string 表示用講義名
 *     - createdAt: Timestamp
 */
const getAlertsRef = (nameNormalized) =>
  collection(db, 'lecture_alerts', nameNormalized, 'alerts')

const getAlertRef = (nameNormalized, alertId) =>
  doc(db, 'lecture_alerts', nameNormalized, 'alerts', alertId)

/**
 * 指定講義のアラート一覧を取得する（新着順）
 * @param {string} nameNormalized - 正規化された講義名
 * @returns {Promise<Array>} アラートの配列
 */
export const fetchAlerts = async (nameNormalized) => {
  if (!nameNormalized) return []
  const q = query(getAlertsRef(nameNormalized), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

/**
 * アラートを投稿する
 * @param {string} nameNormalized - 正規化された講義名
 * @param {string} lectureName - 表示用講義名
 * @param {string} content - アラート内容
 * @param {{ uid: string, displayName: string }} author - 投稿者情報
 * @returns {Promise<string>} 作成されたドキュメントID
 */
export const postAlert = async (nameNormalized, lectureName, content, author) => {
  const ref = await addDoc(getAlertsRef(nameNormalized), {
    content,
    lectureName,
    authorUid: author.uid,
    authorName: author.displayName || '名無し',
    createdAt: serverTimestamp(),
  })
  return ref.id
}

/**
 * アラートを削除する（投稿者本人のみ）
 * @param {string} nameNormalized - 正規化された講義名
 * @param {string} alertId - アラートID
 */
export const deleteAlert = async (nameNormalized, alertId) => {
  await deleteDoc(getAlertRef(nameNormalized, alertId))
}
