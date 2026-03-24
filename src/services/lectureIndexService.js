/**
 * 全ユーザーの講義データを集約した「マスターインデックス」を管理するサービス
 *
 * Firestore のパス: lecture_index/{nameNormalized}
 *
 * - Name: string 最もよく使われる表示名（マスター）
 * - NameNormalized: string 正規化名（ドキュメントID）
 * - Aliases: string[] 別表記の一覧
 * - AliasCounts: object 表示名ごとの出現回数
 * - Count: number 登録ユーザー数（FieldValue.increment で競合なく更新）
 * - UpdatedAt: string
 *
 * フロー: ユーザーが講義を保存 → saveLecture が nameNormalized を生成 → incrementLectureIndex を呼んでインデックスに登録 or
 * カウントアップ → count が多い表示名が自動的に「マスター」になる
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  setDoc,
  startAt,
  updateDoc,
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
    const storedNormalized = data.nameNormalized || ''
    const isPrefix = storedNormalized.startsWith(normalized)
    const score = calcSimilarityScore(input, data.name)
    const classification = classifyScore(score)

    if (isPrefix || classification !== 'different') {
      results.push({
        name: data.name,
        count: data.count,
        score: isPrefix ? Math.max(score, 0.8) : score,
      })
    }
  })

  results.sort((a, b) => b.score - a.score)
  return results.slice(0, maxResults)
}

/**
 * 講義をインデックスに登録（または既存エントリのカウントアップ）
 *
 * Count の更新には FieldValue.increment() を使用。 これにより Transaction なしでアトミックに更新でき、 同時アクセスによる競合・リトライが発生しない。
 * aliasCounts の更新のみ getDoc が必要。
 *
 * @param {string} name - ユーザーが入力した表示名
 * @param {string} nameNormalized - 正規化済み名称
 */
export const incrementLectureIndex = async (name, nameNormalized) => {
  const ref = doc(db, INDEX_COL, nameNormalized)
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    // 新規登録（この名称で初めての登録）
    await setDoc(ref, {
      name,
      nameNormalized,
      aliases: [],
      aliasCounts: { [name]: 1 },
      count: 1,
      updatedAt: new Date().toISOString(),
    })
    return
  }

  // 既存エントリの更新
  const data = snap.data()
  const aliasCounts = { ...(data.aliasCounts || {}) }
  aliasCounts[name] = (aliasCounts[name] || 0) + 1

  // 最も出現回数が多い名称をマスターに昇格
  const masterName = Object.entries(aliasCounts).reduce(
    (best, [n, c]) => (c > best[1] ? [n, c] : best),
    ['', 0],
  )[0]

  const aliases = Object.keys(aliasCounts).filter((n) => n !== masterName)

  // count は FieldValue.increment() でアトミックに更新（競合なし）
  await updateDoc(ref, {
    name: masterName,
    aliases,
    aliasCounts,
    count: increment(1),
    updatedAt: new Date().toISOString(),
  })
}
