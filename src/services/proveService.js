import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/firebase/config'

export const fetchOrganizationData = async (organizationId) => {
  const groupRef = doc(db, 'groups', organizationId)
  const groupSnap = await getDoc(groupRef)

  if (!groupSnap.exists()) throw new Error('団体が見つかりません')

  return groupSnap.data()
}

/**
 * 代表者証明申請の承認状態を更新する
 *
 * @param {string} userId Firebase AuthのユーザーID
 * @param {boolean} isApproved 承認状態
 * @returns {Promise<void>}
 */
export const updateProveOwnerApprovalService = async (userId, isApproved) => {
  try {
    // 値の存在を確認
    if (!userId) throw new Error('承認状態を更新するには認証が必要です')

    // 申請状態を更新
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      isOfficial: isApproved,
      isProvePending: false,
      role: isApproved ? 'official' : 'general',
      'proveOwnerApplication.reviewedAt': new Date().toISOString(),
      'proveOwnerApplication.reviewedStatus': isApproved ? 'approved' : 'rejected',
    })

    return { flow: 'approved' }
  } catch (error) {
    throw new Error(`承認状態の更新に失敗しました。${error.message}`)
  }
}

/**
 * 代表者証明申請をgroupsコレクションに保存する
 *
 * @param {string} organizationId 団体ID
 * @param {string} userId ユーザーID
 * @param {string} password 代表者証明パスワード
 * @returns {Promise<void>}
 */
export const submitOwnership = async (organizationId, userId, password) => {
  try {
    // 値の存在を確認
    if (!userId) throw new Error('認証されていません')
    if (!organizationId) throw new Error('団体IDが選択されていません')
    if (!password) throw new Error('パスワードが入力されていません')

    // 申請者の情報を保存
    const tempId = uuidv4()
    const requestedAt = new Date().toISOString()
    const application = {
      password,
      tempId,
      requestedAt,
    }
    const applicantRef = doc(db, 'groups', organizationId, 'applicants', userId)
    await setDoc(applicantRef, application, { merge: true })

    // 申請状態を保存
    const groupRef = doc(db, 'groups', organizationId)
    await setDoc(groupRef, { isProvePending: true }, { merge: true })

    return { flow: 'submitted' }
  } catch (error) {
    throw new Error(`代表者証明の申請に失敗しました。${error.message}`)
  }
}
