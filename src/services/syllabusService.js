import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore'

/**
 * シラバス情報を取得する
 *
 * @param {string} lectureName - 講義名
 * @returns {Promise<object | null>} シラバス情報データ
 */
export const getSyllabus = async (lectureName) => {
  if (!lectureName) return null
  const db = getFirestore()
  const docRef = doc(db, 'lecture_syllabuses', lectureName)
  const snap = await getDoc(docRef)
  if (!snap.exists()) return null
  return snap.data()
}

/**
 * シラバス情報を保存・更新する
 *
 * @param {string} lectureName - 講義名
 * @param {object} syllabusData - シラバスデータ
 * @param {string} uid - 編集者のユーザーID
 * @param {string} displayName - 編集者の表示名
 */
export const saveSyllabus = async (lectureName, syllabusData, uid, displayName) => {
  if (!lectureName || !uid) return
  const db = getFirestore()
  const docRef = doc(db, 'lecture_syllabuses', lectureName)

  // 既存のデータを取得し、previousVersionとして退避する
  const snap = await getDoc(docRef)
  let previousVersion = null
  if (snap.exists() && (snap.data().description || snap.data().grading || snap.data().textbook)) {
    const data = snap.data()
    previousVersion = {
      description: data.description || '',
      grading: data.grading || '',
      textbook: data.textbook || '',
      editedBy: data.lastEditedBy || '匿名ユーザー',
      editedById: data.lastEditedById || '',
      editedAt: data.updatedAt || null,
    }
  }

  const updateData = {
    description: syllabusData.description || '',
    grading: syllabusData.grading || '',
    textbook: syllabusData.textbook || '',
    lastEditedBy: displayName || '匿名ユーザー',
    lastEditedById: uid,
    updatedAt: serverTimestamp(),
  }

  // もし前のバージョンがあれば一緒に保存
  if (previousVersion) {
    updateData.previousVersion = previousVersion
  }

  await setDoc(docRef, updateData, { merge: true })
}
