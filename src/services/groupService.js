import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'

/**
 * 指定された団体のドキュメントを取得する
 *
 * @param {string} groupId 団体ID
 * @returns {Promise<object | null>} 団体データ（存在しない場合はnull）
 */
const getGroupService = async (groupId) => {
  try {
    if (!groupId) throw new Error('団体IDが指定されていません')

    const groupRef = doc(db, 'groups', String(groupId))
    const groupSnap = await getDoc(groupRef)

    if (!groupSnap.exists()) {
      return null
    }

    return groupSnap.data()
  } catch (error) {
    throw new Error(`団体情報の取得に失敗しました。${error.message}`)
  }
}

/**
 * ユーザーが指定された団体の代表者かどうかを判定する
 *
 * 復刻版では代表者証明の申請フローを持たないため、groups コレクションは 空のままで運用される。その場合この関数は常に false を返し、 すべてのイベントが一般（非公式）扱いになる。
 *
 * @param {string} groupId 団体ID
 * @param {string} userId ユーザーID
 * @returns {Promise<boolean>} 代表者の場合true
 */
export const isUserRepresentative = async (groupId, userId) => {
  if (!groupId || !userId) return false

  const group = await getGroupService(groupId)
  if (!group) return false

  const representatives = group.representatives || []
  return representatives.some((rep) => rep.userId === userId)
}
