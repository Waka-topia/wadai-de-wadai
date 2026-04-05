import { collection, doc, getDocs, setDoc } from 'firebase/firestore'
import { allGroups } from '@/data/groups'
import { db } from '@/firebase/config'

/**
 * groups.js の団体一覧を Firestore の groups コレクションへ登録する
 *
 * @returns {Promise<{registeredCount:number, skippedCount:number}>} 登録結果
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
