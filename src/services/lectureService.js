import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { incrementLectureIndex } from '@/services/lectureIndexService'
import { normalizeLectureName } from '@/utils/lectureNormalizer'

/*
 * ユーザーの時間割データを Firestore で管理するサービス
 *
 * Firestore のパス: user_timetables/{uid}/lectures/{day-period}
 */
const getLecturesRef = (uid) => collection(db, 'user_timetables', uid, 'lectures')
const getLectureRef = (uid, day, period) =>
  doc(db, 'user_timetables', uid, 'lectures', `${day}-${period}`)

/**
 * ユーザーの全講義を取得する
 *
 * @param {string} uid - ユーザーUID
 * @returns {Promise<object>} 時間割データ
 */
export const fetchTimetable = async (uid) => {
  const snapshot = await getDocs(getLecturesRef(uid))
  const timetable = {}
  snapshot.forEach((d) => {
    timetable[d.id] = d.data()
  })
  return timetable
}

/**
 * 1コマ分の講義を保存する（新規 or 上書き）
 *
 * @param {string} uid - ユーザーUID
 * @param {string} day - 曜日コード（mon・tue・...）
 * @param {number} period - 時限
 * @param {object} lectureData - 保存する講義データ
 */
export const saveLecture = async (uid, day, period, lectureData) => {
  const ref = getLectureRef(uid, day, period)
  const nameNormalized = normalizeLectureName(lectureData.name || '', { katakana: true })

  await setDoc(ref, {
    ...lectureData,
    nameNormalized,
    day,
    period,
    updatedAt: new Date().toISOString(),
  })

  // グローバルインデックスにも登録（名寄せ・サジェスト用）
  // エラーが出ても本体の保存には影響させない
  incrementLectureIndex(lectureData.name, nameNormalized).catch((e) =>
    console.warn('[lectureService] index update failed:', e),
  )
}

/**
 * 1コマ分の講義を削除する
 *
 * @param {string} uid - ユーザーUID
 * @param {string} day - 曜日コード
 * @param {number} period - 時限
 */
export const deleteLecture = async (uid, day, period) => {
  const ref = getLectureRef(uid, day, period)
  await deleteDoc(ref)
}

/**
 * 1コマ分の講義を取得する
 *
 * @param {string} uid - ユーザーUID
 * @param {string} day - 曜日コード
 * @param {number} period - 時限
 * @returns {Promise<object|null>} 講義データまたはnull
 */
export const getLecture = async (uid, day, period) => {
  const ref = getLectureRef(uid, day, period)
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : null
}
