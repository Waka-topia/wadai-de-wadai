import {
  collection,
  doc,
  getDocs,
  increment,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/firebase/config'

/**
 * QRコードから読み取ったスタンプをユーザーに付与する
 *
 * StampsReceived の作成と rankingEntries のカウンタ更新を writeBatch で原子的に行う。
 * 取得済みかどうかの事前確認（getDoc）は行わない。既に持っているスタンプに対する書き込みは セキュリティルール（stampsReceived は create のみ許可、update
 * は禁止）が拒否し、 バッチ全体がロールバックするため、カウンタだけが増えることはない。
 *
 * @param {object} params - 付与に必要な情報
 * @param {string} params.userId - Firebase Auth の UID
 * @param {string} params.displayName - ランキング表示用に非正規化する表示名
 * @param {string} params.groupId - QRコードに含まれる団体ID
 * @param {string} params.stampId - QRコードに含まれるスタンプID
 * @returns {Promise<{ granted: boolean; stampId: string }>} Granted が false の場合は取得済み
 */
export const grantStamp = async ({ userId, displayName, groupId, stampId }) => {
  if (!userId) throw new Error('スタンプの取得にはログインが必要です')
  if (!stampId) throw new Error('スタンプIDが指定されていません')

  const batch = writeBatch(db)

  batch.set(doc(db, 'users', userId, 'stampsReceived', stampId), {
    groupId: String(groupId ?? ''),
    stampId,
    receivedAt: serverTimestamp(),
  })

  batch.set(
    doc(db, 'rankingEntries', userId),
    {
      userId,
      displayName: displayName || '名前なし',
      stampCount: increment(1),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  try {
    await batch.commit()
    return { granted: true, stampId }
  } catch (error) {
    // 取得済みスタンプへの書き込みはルールで拒否される
    if (error.code === 'permission-denied') {
      return { granted: false, stampId }
    }
    throw new Error(`スタンプの保存に失敗しました。${error.message}`)
  }
}

/**
 * ユーザーが取得済みのスタンプ一覧を取得する
 *
 * スタンプの名前や画像は src/data/stamps.js の静的マスターから引くため、 ここでは Firestore への問い合わせは1回だけで済む。
 *
 * @param {string} userId - Firebase Auth の UID
 * @returns {Promise<{ stampId: string; groupId: string; receivedAt: Date | null }[]>} 取得済みスタンプ
 */
export const fetchReceivedStamps = async (userId) => {
  if (!userId) return []

  try {
    const snapshot = await getDocs(collection(db, 'users', userId, 'stampsReceived'))

    return snapshot.docs.map((stampDoc) => {
      const data = stampDoc.data()
      return {
        stampId: stampDoc.id,
        groupId: data.groupId ?? '',
        receivedAt: data.receivedAt?.toDate?.() ?? null,
      }
    })
  } catch (error) {
    throw new Error(`スタンプの取得に失敗しました。${error.message}`)
  }
}
