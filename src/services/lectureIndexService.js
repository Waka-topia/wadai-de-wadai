/**
 * 全ユーザーの講義データを集約した「マスターインデックス」を管理するサービス
 *
 * 【アプローチA】 検索用のメタデータを search_index/master という1つのドキュメントに集約し、 ブラウザ側で超高速なフィルタリング・ソートを実現します。
 *
 * Firestore のパス:
 *
 * - 詳細データ: lecture_syllabuses/{name}
 * - インデックス: lecture_search/all_lectures_index
 */

import { doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { normalizeLectureName } from '@/utils/lectureNormalizer'

const INDEX_DOC_PATH = 'lecture_search/all_lectures_index'

/**
 * マスターインデックス（全件データ）を取得する
 *
 * @returns {Promise<object>} インデックスデータ { l: Array, updatedAt: Timestamp }
 */
export const fetchMasterIndex = async () => {
  const ref = doc(db, INDEX_DOC_PATH)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    return { l: [], updatedAt: null }
  }
  return snap.data()
}

/**
 * シラバス詳細の保存と検索インデックスの更新を一つのトランザクションで行う
 *
 * @param {string} lectureName - 講義名
 * @param {object} syllabusData - シラバスのメタデータ (teacher, room, credits, description)
 * @param {string} uid - ユーザーID
 * @param {string} displayName - ユーザー表示名
 * @returns {Promise<void>}
 */
export const saveSyllabusWithIndex = async (lectureName, syllabusData, uid, displayName) => {
  if (!lectureName || !uid) throw new Error('講義名とユーザーIDは必須です')

  const syllabusRef = doc(db, 'lecture_syllabuses', lectureName)
  const indexRef = doc(db, INDEX_DOC_PATH)
  const normalized = normalizeLectureName(lectureName)

  await runTransaction(db, async (transaction) => {
    // 1. マスターインデックスを読み込む
    const indexSnap = await transaction.get(indexRef)
    let indexData = indexSnap.exists() ? indexSnap.data() : { l: [] }
    let lectures = indexData.l || []

    // 2. 詳細データの保存内容を準備
    const now = serverTimestamp()
    const detailData = {
      ...syllabusData,
      lastEditedBy: displayName || '匿名ユーザー',
      lastEditedById: uid,
      updatedAt: now,
    }

    // 3. インデックス用データの準備（極限まで軽量化）
    const indexEntry = {
      id: lectureName,
      n: normalized,
      t: syllabusData.teacher || '',
      b: syllabusData.room || '', // 建物・場所
      c: Number(syllabusData.credits) || 2,
      g: syllabusData.categories || [], // 授業区分（配列）
    }

    // 4. 配列を更新（既存なら上書き、なければPush）
    const existingIndex = lectures.findIndex((item) => item.id === lectureName)
    if (existingIndex >= 0) {
      lectures[existingIndex] = indexEntry
    } else {
      lectures.push(indexEntry)
    }

    // 5. 書き込み（一件シラバス詳細 ＋ インデックス全体）
    transaction.set(syllabusRef, detailData, { merge: true })
    transaction.set(indexRef, {
      l: lectures,
      updatedAt: now,
    })
  })
}

// 互換性のためのスタブ（将来的に廃止予定）
export const searchSuggestions = async () => {
  console.warn('searchSuggestions is deprecated. Use fetchMasterIndex and local filtering.')
  return []
}

export const incrementLectureIndex = async () => {
  console.warn('incrementLectureIndex is deprecated. Use saveSyllabusWithIndex.')
}
