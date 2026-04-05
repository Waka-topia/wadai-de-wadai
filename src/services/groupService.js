import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  setDoc,
} from 'firebase/firestore'
import bcrypt from 'bcryptjs'
import { allGroups } from '@/data/groups'
import { db } from '@/firebase/config'

// 代表者ステータスのメモリキャッシュ (groupId_userId -> boolean)
const representativeCache = new Map()

/**
 * Groups.js の団体一覧を Firestore の groups コレクションへ登録する
 *
 * @returns {Promise<{ registeredCount: number; skippedCount: number }>} 登録結果
 */
export const registerAllGroupsService = async () => {
  try {
    const groupsRef = collection(db, 'groups')
    const existingSnapshot = await getDocs(groupsRef)
    const existingIds = new Set(existingSnapshot.docs.map((groupDoc) => groupDoc.id))

    let registeredCount = 0
    let skippedCount = 0

    const savePromises = allGroups.map(async (group) => {
      const groupId = String(group.id)

      if (existingIds.has(groupId)) {
        skippedCount += 1
        return
      }

      await setDoc(doc(groupsRef, groupId), {
        id: group.id,
        name: group.name,
        mainCategory: group.mainCategory,
        subCategory: group.subCategory,
        representatives: [],
        representativeCount: 0,
        hasPassword: false,
        createdAt: new Date().toISOString(),
      })

      registeredCount += 1
    })

    await Promise.all(savePromises)

    return {
      registeredCount,
      skippedCount,
    }
  } catch (error) {
    throw new Error(`団体データの登録に失敗しました。${error.message}`)
  }
}

/**
 * 指定された団体のドキュメントを取得する
 *
 * @param {string} groupId 団体ID
 * @returns {Promise<object | null>} 団体データ（存在しない場合はnull）
 */
export const getGroupService = async (groupId) => {
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
 * 指定された団体にすでに代表者が存在するかどうかを判定する
 *
 * @param {string} groupId 団体ID
 * @returns {Promise<boolean>} 代表者が1人以上いる場合true
 */
export const hasExistingRepresentatives = async (groupId) => {
  const group = await getGroupService(groupId)
  if (!group) return false

  const reps = group.representatives || []
  return reps.length > 0
}

/**
 * パスワード認証で後続の代表者を即座に登録する すでに代表者がいる団体に対して、パスワードが一致すれば即座に登録完了
 *
 * @param {string} groupId 団体ID
 * @param {string} userId ユーザーID
 * @param {string} userName ユーザー名
 * @param {string} password 入力されたパスワード
 * @returns {Promise<object>} 登録結果
 */
export const addRepresentativeByPassword = async (groupId, userId, userName, password) => {
  if (!groupId) throw new Error('団体IDが指定されていません')
  if (!userId) throw new Error('認証されていません')
  if (!password) throw new Error('パスワードが入力されていません')

  try {
    const groupRef = doc(db, 'groups', String(groupId))

    return await runTransaction(db, async (transaction) => {
      const groupSnap = await transaction.get(groupRef)

      if (!groupSnap.exists()) {
        throw new Error('団体が見つかりません')
      }

      const groupData = groupSnap.data()
      const representatives = groupData.representatives || []

      // すでに登録済みかチェック
      if (representatives.some((rep) => rep.userId === userId)) {
        throw new Error('あなたはすでにこの団体の代表者として登録されています')
      }

      // パスワード照合
      if (!groupData.passwordHash) {
        throw new Error(
          'この団体にはまだパスワードが設定されていません。初回申請を行ってください。',
        )
      }

      const isMatch = await bcrypt.compare(password, groupData.passwordHash)
      if (!isMatch) {
        throw new Error('パスワードが正しくありません')
      }

      // 新しい代表者を追加
      const newRepresentative = {
        userId,
        userName: userName || '匿名ユーザー',
        role: 'representative',
        grantedAt: new Date().toISOString(),
      }

      transaction.update(groupRef, {
        representatives: arrayUnion(newRepresentative),
        representativeCount: representatives.length + 1,
        updatedAt: new Date().toISOString(),
      })

      return { flow: 'instant', representative: newRepresentative }
    })
  } catch (error) {
    throw new Error(`代表者登録に失敗しました。${error.message}`)
  }
}

/**
 * 管理者承認後に代表者を登録し、初回の場合はパスワードも設定する （updateProveOwnerApprovalService から呼ばれる）
 *
 * @param {string} groupId 団体ID
 * @param {string} userId ユーザーID
 * @param {string} userName ユーザー名
 * @param {string} password 申請時に設定されたパスワード（平文）
 * @returns {Promise<void>}
 */
export const addRepresentativeByApproval = async (groupId, userId, userName, password) => {
  if (!groupId) throw new Error('団体IDが指定されていません')
  if (!userId) throw new Error('ユーザーIDが指定されていません')

  try {
    const groupRef = doc(db, 'groups', String(groupId))

    await runTransaction(db, async (transaction) => {
      const groupSnap = await transaction.get(groupRef)

      if (!groupSnap.exists()) {
        throw new Error('団体が見つかりません')
      }

      const groupData = groupSnap.data()
      const representatives = groupData.representatives || []

      // すでに登録済みならスキップ
      if (representatives.some((rep) => rep.userId === userId)) {
        return
      }

      const newRepresentative = {
        userId,
        userName: userName || '匿名ユーザー',
        role: 'representative',
        grantedAt: new Date().toISOString(),
      }

      const updateData = {
        representatives: arrayUnion(newRepresentative),
        representativeCount: representatives.length + 1,
        updatedAt: new Date().toISOString(),
      }

      // 初回登録（まだパスワードが設定されていない場合）はパスワードをハッシュ化して保存
      if (!groupData.hasPassword && password) {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        updateData.passwordHash = hash
        updateData.hasPassword = true
      }

      transaction.update(groupRef, updateData)
    })
  } catch (error) {
    throw new Error(`代表者の承認登録に失敗しました。${error.message}`)
  }
}

/**
 * ユーザーが指定された団体の代表者かどうかを判定する
 *
 * @param {string} groupId 団体ID
 * @param {string} userId ユーザーID
 * @returns {Promise<boolean>} 代表者の場合true
 */
export const isUserRepresentative = async (groupId, userId) => {
  if (!groupId || !userId) return false

  // キャッシュチェック
  const cacheKey = `${groupId}_${userId}`
  if (representativeCache.has(cacheKey)) {
    return representativeCache.get(cacheKey)
  }

  const group = await getGroupService(groupId)
  if (!group) return false

  const representatives = group.representatives || []
  const isRep = representatives.some((rep) => rep.userId === userId)

  // 結果をキャッシュに保存
  representativeCache.set(cacheKey, isRep)
  return isRep
}
