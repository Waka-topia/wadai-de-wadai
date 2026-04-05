import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  setDoc,
  where,
} from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/firebase/config'
import { addRepresentativeByApproval } from '@/services/groupService'

/**
 * 代表者証明申請をgroupsコレクションに保存する
 *
 * @param {string} organizationId 団体ID
 * @param {string} userId ユーザーID
 * @param {string} password 代表者証明パスワード
 * @param {object} snapshotMetadata 申請時点の表示用スナップショット
 * @returns {Promise<void>}
 */
export const submitOwnership = async (snapshotMetadata = {}) => {
  try {
    // 値の存在を確認
    if (!snapshotMetadata.userId) throw new Error('認証されていません')
    if (!snapshotMetadata.organizationId) throw new Error('団体IDが選択されていません')
    if (!snapshotMetadata.password) throw new Error('パスワードが入力されていません')

    // 既存のpending申請がある場合は重複申請を防ぐ
    const existingApplicationsQuery = query(
      collection(db, 'proveApplications'),
      where('userId', '==', snapshotMetadata.userId),
      where('groupId', '==', snapshotMetadata.organizationId),
      where('status', 'in', ['pending', 'inReview']),
    )
    const existingApplicationsSnapshot = await getDocs(existingApplicationsQuery)
    if (!existingApplicationsSnapshot.empty) throw new Error('この団体への申請は審査中です')

    // 申請者の情報を保存
    const application = {
      userId: snapshotMetadata.userId,
      groupId: snapshotMetadata.organizationId,
      password: snapshotMetadata.password,
      tempId: uuidv4(),
      requestedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending',
      userNameSnapshot: snapshotMetadata.userNameSnapshot || null,
      groupNameSnapshot: snapshotMetadata.groupNameSnapshot || null,
      emailSnapshot: snapshotMetadata.emailSnapshot || null,
    }

    const proveApplicationRef = doc(collection(db, 'proveApplications'))

    // Firestoreルールに合わせ、V2の申請コレクションへ保存する
    await setDoc(proveApplicationRef, application)

    return { flow: 'submitted' }
  } catch (error) {
    throw new Error(`代表者証明の申請に失敗しました。${error.message}`)
  }
}

/**
 * 代表者証明を申請したユーザー一覧を取得する
 *
 * @returns {Promise<Array>} 申請者一覧（最小構造）
 */
export const getProveOwnerApplicantsService = async () => {
  try {
    const applicationsRef = collection(db, 'proveApplications')
    const proveApplicationsQuery = query(
      applicationsRef,
      where('status', 'in', ['pending', 'inReview']),
      orderBy('requestedAt', 'desc'),
    )
    const applicationsSnapshot = await getDocs(proveApplicationsQuery)

    return applicationsSnapshot.docs.map((applicationDoc) => {
      const applicationData = applicationDoc.data()

      return {
        applicationId: applicationDoc.id,
        isOfficial: false,
        status: applicationData.status || null,
        userId: applicationData.userId,
        organizationId: applicationData.groupId,
        tempId: applicationData.tempId || null,
        userName: applicationData.userNameSnapshot || null,
        email: applicationData.emailSnapshot || null,
        organizationName: applicationData.groupNameSnapshot || null,
      }
    })
  } catch (error) {
    console.error('Failed to get prove owner applicants:', error)
    throw new Error(`申請者一覧の取得に失敗しました。${error.message}`)
  }
}

/**
 * 代表者証明を申請したユーザーの情報を取得する
 *
 * @param {string} userId Firebase AuthのユーザーID
 * @returns {Promise<object>} 申請者情報（最小構造）
 */
export const getProveOwnerApplicantService = async (userId) => {
  try {
    if (!userId) {
      throw new Error('申請者情報を取得するにはユーザーIDが必要です')
    }

    const applicationsRef = collection(db, 'proveApplications')
    const proveApplicationsQuery = query(
      applicationsRef,
      where('userId', '==', userId),
      where('status', 'in', ['pending', 'inReview']),
      orderBy('requestedAt', 'desc'),
      limit(1),
    )
    const applicationsSnapshot = await getDocs(proveApplicationsQuery)

    if (applicationsSnapshot.empty) {
      throw new Error('このユーザーは代表者証明を申請していません')
    }

    const latestApplication = applicationsSnapshot.docs[0]
    const applicationData = latestApplication.data()

    return {
      proveOwnerApplication: {
        tempId: applicationData.tempId || null,
      },
    }
  } catch (error) {
    throw new Error(`申請者情報の取得に失敗しました。${error.message}`)
  }
}

/**
 * 代表者証明申請の承認状態を更新する
 *
 * @param {string} applicationId 申請ドキュメントID
 * @param {boolean} isApproved 承認状態
 * @returns {Promise<void>}
 */
export const updateProveOwnerApprovalService = async (applicationId, isApproved) => {
  try {
    // 値の存在を確認
    if (!applicationId) throw new Error('承認対象の申請IDが必要です')

    const requestedAt = new Date().toISOString()
    const targetApplicationRef = doc(db, 'proveApplications', applicationId)

    // 先に申請データを取得してトランザクション外で使用する情報を準備
    const targetApplicationSnapshot = await getDoc(targetApplicationRef)

    if (!targetApplicationSnapshot.exists()) {
      throw new Error('承認対象の申請が見つかりません')
    }

    const targetApplicationData = targetApplicationSnapshot.data()
    if (!['pending', 'inReview'].includes(targetApplicationData.status)) {
      throw new Error('この申請はすでに審査済みです')
    }

    // 申請ステータスの更新（トランザクション）
    await runTransaction(db, async (transaction) => {
      const freshSnap = await transaction.get(targetApplicationRef)
      if (!freshSnap.exists()) throw new Error('承認対象の申請が見つかりません')

      transaction.update(targetApplicationRef, {
        status: isApproved ? 'approved' : 'rejected',
        reviewedAt: requestedAt,
        updatedAt: requestedAt,
      })

      // 後方互換: groupRepresentatives にも書き込み
      if (isApproved) {
        const groupRepresentativeRef = doc(
          db,
          'groupRepresentatives',
          `${targetApplicationData.groupId}_${targetApplicationData.userId}`,
        )

        transaction.set(
          groupRepresentativeRef,
          {
            userId: targetApplicationData.userId,
            groupId: targetApplicationData.groupId,
            role: 'representative',
            grantedAt: requestedAt,
            isActive: true,
            updatedAt: requestedAt,
            groupNameSnapshot: targetApplicationData.groupNameSnapshot || null,
          },
          { merge: true },
        )
      }
    })

    // 承認された場合、新しい groups コレクションにも代表者を追加
    if (isApproved) {
      await addRepresentativeByApproval(
        targetApplicationData.groupId,
        targetApplicationData.userId,
        targetApplicationData.userNameSnapshot,
        targetApplicationData.password,
      )
    }
  } catch (error) {
    throw new Error(`承認状態の更新に失敗しました。${error.message}`)
  }
}
