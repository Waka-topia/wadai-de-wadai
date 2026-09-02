import { updateProfile } from 'firebase/auth'
import { doc, getDoc, increment, serverTimestamp, writeBatch } from 'firebase/firestore'
import { auth, db } from '@/firebase/config'

/**
 * ユーザーのプロフィールを取得する
 *
 * @param {string} userId - Firebase Auth の UID
 * @returns {Promise<{ displayName: string; iconId: string; nextShinkan: object | null } | null>}
 *   プロフィール
 */
export const fetchProfile = async (userId) => {
  if (!userId) return null

  try {
    const snapshot = await getDoc(doc(db, 'users', userId))
    if (!snapshot.exists()) return null

    const data = snapshot.data()
    return {
      displayName: data.displayName ?? '',
      iconId: data.iconId ?? '',
      nextShinkan: data.nextShinkan ?? null,
    }
  } catch (error) {
    throw new Error(`プロフィールの取得に失敗しました。${error.message}`)
  }
}

/**
 * プロフィールを保存する
 *
 * Users/{uid} と、ランキング表示用の rankingEntries/{uid} を同時に更新する。 rankingEntries が未作成の場合に備えて stampCount には
 * increment(0) を渡している。 未作成なら 0 で作られ、既存なら値が変わらないため、スタンプ数を読み直す必要がない。
 *
 * @param {object} params - 保存する内容
 * @param {string} params.userId - Firebase Auth の UID
 * @param {string} params.displayName - 表示名
 * @param {string} params.iconId - アイコンID（例: userIcon3）
 * @param {{ groupName: string; nextDate: string } | null} params.nextShinkan - 次回参加予定の団体
 * @returns {Promise<void>}
 */
export const saveProfile = async ({ userId, displayName, iconId, nextShinkan }) => {
  if (!userId) throw new Error('プロフィールの保存にはログインが必要です')

  const name = displayName?.trim()
  if (!name) throw new Error('ユーザーネームを入力してください')

  const shinkan = nextShinkan?.groupName
    ? { groupName: nextShinkan.groupName, nextDate: nextShinkan.nextDate ?? '' }
    : null

  const batch = writeBatch(db)

  batch.set(
    doc(db, 'users', userId),
    { displayName: name, iconId, nextShinkan: shinkan },
    { merge: true },
  )

  batch.set(
    doc(db, 'rankingEntries', userId),
    {
      userId,
      displayName: name,
      iconId,
      nextShinkan: shinkan,
      stampCount: increment(0),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  try {
    await batch.commit()

    // ランキング以外の表示や、スタンプ付与時の非正規化にも使うため Auth 側も揃えておく
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: name })
    }
  } catch (error) {
    throw new Error(`プロフィールの保存に失敗しました。${error.message}`)
  }
}
