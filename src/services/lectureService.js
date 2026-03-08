import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { normalizeLectureName } from '@/utils/lectureNormalizer'

/**
 * ユーザーの時間割データを Firestore で管理するサービス
 *
 * Firestore のパス: user_timetables/{uid}/lectures/{day-period}
 */
const getLecturesRef = (uid) => collection(db, 'user_timetables', uid, 'lectures')
const getLectureRef = (uid, day, period) =>
  doc(db, 'user_timetables', uid, 'lectures', `${day}-${period}`)

/** ユーザーの全講義を取得する */
export const fetchTimetable = async (uid) => {
  const snapshot = await getDocs(getLecturesRef(uid))
  const timetable = {}
  snapshot.forEach((d) => {
    timetable[d.id] = d.data()
  })
  return timetable
}

/** 1コマ分の講義を保存する（新規 or 上書き）*/
export const saveLecture = async (uid, day, period, lectureData) => {
  const ref = getLectureRef(uid, day, period)
  await setDoc(ref, {
    ...lectureData,
    // 正規化された講義名を別フィールドで保存（名寄せ用）
    nameNormalized: normalizeLectureName(lectureData.name || '', { katakana: true }),
    day,
    period,
    updatedAt: new Date().toISOString(),
  })
}

/** 1コマ分の講義を削除する */
export const deleteLecture = async (uid, day, period) => {
  const ref = getLectureRef(uid, day, period)
  await deleteDoc(ref)
}

/** 1コマ分の講義を取得する */
export const getLecture = async (uid, day, period) => {
  const ref = getLectureRef(uid, day, period)
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : null
}
