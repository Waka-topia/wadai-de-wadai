import { collection, doc, getDoc, limit, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '@/firebase/config'

/** ランキングに表示する最大人数 */
export const rankingLimit = 100

/**
 * Firestore のドキュメントをランキング表示用の形に整える
 *
 * @param {object} data - RankingEntries ドキュメントのデータ
 * @param {number} index - 並び順（0始まり）
 * @returns {object} Rank を付与したエントリ
 */
const toRankingEntry = (data, index) => ({
  userId: data.userId ?? '',
  displayName: data.displayName || '名前なし',
  iconId: data.iconId ?? '',
  nextShinkan: data.nextShinkan ?? null,
  stampCount: data.stampCount ?? 0,
  rank: index + 1,
})

/**
 * スタンプ数上位のランキングをリアルタイムで購読する
 *
 * RankingEntries はスタンプ取得時に増分更新される公開用のコレクションなので、 集計バッチを走らせなくても常に最新の値が読める。
 *
 * @param {object} params - 購読の設定
 * @param {(entries: object[]) => void} params.onChange - 更新時に rank 付きの配列を受け取る
 * @param {(error: Error) => void} [params.onError] - 購読エラー時のハンドラ
 * @param {number} [params.limitCount] - 取得件数
 * @returns {() => void} 購読を解除する関数
 */
export const subscribeTopRanking = ({ onChange, onError, limitCount = rankingLimit }) => {
  const rankingQuery = query(
    collection(db, 'rankingEntries'),
    orderBy('stampCount', 'desc'),
    limit(limitCount),
  )

  return onSnapshot(
    rankingQuery,
    (snapshot) => {
      onChange(snapshot.docs.map((entryDoc, index) => toRankingEntry(entryDoc.data(), index)))
    },
    (error) => {
      onError?.(new Error(`ランキングの取得に失敗しました。${error.message}`))
    },
  )
}

/**
 * 指定ユーザーのランキングエントリを取得する
 *
 * 順位はトップ100の一覧から求めるため、ここでは返さない（圏外の判定に使う）。
 *
 * @param {string} userId - Firebase Auth の UID
 * @returns {Promise<{ userId: string; displayName: string; stampCount: number } | null>} エントリ
 */
export const fetchMyRankingEntry = async (userId) => {
  if (!userId) return null

  try {
    const snapshot = await getDoc(doc(db, 'rankingEntries', userId))
    if (!snapshot.exists()) return null

    const data = snapshot.data()
    return {
      userId: data.userId ?? userId,
      displayName: data.displayName || '名前なし',
      stampCount: data.stampCount ?? 0,
    }
  } catch (error) {
    throw new Error(`自分のランキング情報の取得に失敗しました。${error.message}`)
  }
}
