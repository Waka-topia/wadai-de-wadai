/**
 * 全ユーザーの講義データを集約した「マスターインデックス」を管理するサービス
 *
 * Firestore のパス: lecture_index/{nameNormalized} ← 正規化名がドキュメントID - name: string 最もよく使われる表示名（マスター） -
 * nameNormalized: string - aliases: string[] エイリアス（別表記の一覧） - count: number 登録人数 - updatedAt:
 * string
 *
 * フロー: ユーザーが講義を保存 → saveLecture が nameNormalized を生成 → incrementLectureIndex を呼んでインデックスに登録 or
 * カウントアップ → count が多い表示名が自動的に「マスター」になる
 */

import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  startAt,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { calcSimilarityScore, classifyScore, normalizeLectureName } from '@/utils/lectureNormalizer'

const INDEX_COL = 'lecture_index'

/**
 * 講義名でインデックスを検索してサジェスト候補を返す
 *
 * @param {string} input - ユーザーの入力文字列
 * @param {number} maxResults - 最大件数
 * @returns {Promise<{ name: string; count: number }[]>} サジェスト候補の配列（スコア降順）
 */
export const searchSuggestions = async (input, maxResults = 8) => {
  if (!input || input.trim().length < 1) return []

  const normalized = normalizeLectureName(input, { katakana: true })

  // Firestore: nameNormalized が入力に似ているドキュメントを検索
  // （prefix検索の近似として、辞書順で startAt を使う）
  const q = query(
    collection(db, INDEX_COL),
    orderBy('nameNormalized'),
    startAt(normalized),
    limit(20),
  )

  const snapshot = await getDocs(q)
  const results = []

  snapshot.forEach((d) => {
    const data = d.data()
    const score = calcSimilarityScore(input, data.name)
    const classification = classifyScore(score)

    if (classification !== 'different') {
      results.push({ name: data.name, count: data.count, score })
    }
  })

  // スコア降順でソート
  results.sort((a, b) => b.score - a.score)
  return results.slice(0, maxResults)
}

/**
 * 講義をインデックスに登録（または既存エントリのカウントアップ） Transactionで安全に更新する。
 *
 * @param {string} name - ユーザーが入力した表示名
 * @param {string} nameNormalized - 正規化済み名称
 */
export const incrementLectureIndex = async (name, nameNormalized) => {
  const ref = doc(db, INDEX_COL, nameNormalized)

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)

    if (!snap.exists()) {
      // 新規登録：この名称が最初のマスター
      tx.set(ref, {
        name,
        nameNormalized,
        aliases: [],
        aliasCounts: { [name]: 1 }, // 表示名ごとの出現回数
        count: 1,
        updatedAt: new Date().toISOString(),
      })
    } else {
      const data = snap.data()
      const aliasCounts = { ...(data.aliasCounts || {}) }

      // 各表示名の出現カウントを更新
      aliasCounts[name] = (aliasCounts[name] || 0) + 1

      // 最も出現回数が多い名称をマスターに昇格させる
      const masterName = Object.entries(aliasCounts).reduce(
        (best, [n, c]) => (c > best[1] ? [n, c] : best),
        ['', 0],
      )[0]

      // エイリアス一覧（マスター以外）
      const aliases = Object.keys(aliasCounts).filter((n) => n !== masterName)

      tx.update(ref, {
        name: masterName,
        aliases,
        aliasCounts,
        count: (data.count || 0) + 1,
        updatedAt: new Date().toISOString(),
      })
    }
  })
}
