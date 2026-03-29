import { deleteField, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { incrementLectureIndex } from '@/services/lectureIndexService'
import { normalizeLectureName } from '@/utils/lectureNormalizer'

/*
 * ユーザーの時間割データを Firestore で管理するサービス
 *
 * Firestore のパス: user_timetables/{uid}/semesters/{semester}
 * semester: '1-first' | '4-second' 等（学年＋学期）
 *
 * 🚨 スキーマ最適化済み（1学期＝1ドキュメント構造）
 * ドキュメント構造:
 * {
 *   lectures: {
 *     "mon-1": { name: "...", day: "mon", period: 1, ... },
 *     "tue-2": { ... }
 *   },
 *   updatedAt: "2023-..."
 * }
 */

/**
 * 1学期分のドキュメント参照を取得する
 *
 * @param {string} uid - ユーザーUID
 * @param {string} semester - 学期キー (例: '1-first')
 * @returns {import('firebase/firestore').DocumentReference} ドキュメント参照
 */
const getSemesterDocRef = (uid, semester) => doc(db, 'user_timetables', uid, 'semesters', semester)

/**
 * ユーザーの1学期分の全講義を取得する （1回のReadで全コマを取得するコスト最適化モデル）
 *
 * @param {string} uid - ユーザーUID
 * @param {string} semester - 学期キー
 * @returns {Promise<object>} 時間割データ（セルキーをキーとするオブジェクト）
 */
export const fetchTimetable = async (uid, semester) => {
  const ref = getSemesterDocRef(uid, semester)
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data().lectures || {} : {}
}

/**
 * 1コマ分の講義を保存する（新規 or 上書き） 1つの学期ドキュメント内にマージする形式で保存する。
 *
 * @param {string} uid - ユーザーUID
 * @param {string} semester - 学期キー
 * @param {string} day - 曜日コード（mon・tue・...）
 * @param {number} period - 時限
 * @param {object} lectureData - 保存する講義データ
 */
export const saveLecture = async (uid, semester, day, period, lectureData) => {
  const ref = getSemesterDocRef(uid, semester)
  const nameNormalized = normalizeLectureName(lectureData.name || '', { katakana: true })

  const lecturePayload = {
    ...lectureData,
    nameNormalized,
    day,
    period,
    semester,
    updatedAt: new Date().toISOString(),
  }

  // setDoc(merge: true) を使うことで、他の曜日の時間割情報を消さずに一部だけ更新・追加できる
  await setDoc(
    ref,
    {
      lectures: {
        [`${day}-${period}`]: lecturePayload,
      },
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  )

  // グローバルインデックスへの登録（名寄せ・サジェスト用）
  // ユーザーの意向により、シラバス経由 (isFromSyllabus: true) の場合のみ登録する
  if (lectureData.isFromSyllabus) {
    incrementLectureIndex(lectureData.name, nameNormalized).catch((e) =>
      console.warn('[lectureService] index update failed:', e),
    )
  }
}

/**
 * 1コマ分の講義を削除する 対象のフィールドのみ deleteField() で削除し、同じ学期の他データは保護する。
 *
 * @param {string} uid - ユーザーUID
 * @param {string} semester - 学期キー
 * @param {string} day - 曜日コード
 * @param {number} period - 時限
 */
export const deleteLecture = async (uid, semester, day, period) => {
  const ref = getSemesterDocRef(uid, semester)
  await updateDoc(ref, {
    [`lectures.${day}-${period}`]: deleteField(),
    updatedAt: new Date().toISOString(),
  }).catch((e) => {
    // もしドキュメント自体がまだ存在しない場合の updateDoc エラーは無視（既に何もないため）
    if (e.code === 'not-found') return
    throw e
  })
}

/**
 * 1コマ分の講義を取得する
 *
 * @param {string} uid - ユーザーUID
 * @param {string} semester - 学期キー
 * @param {string} day - 曜日コード
 * @param {number} period - 時限
 * @returns {Promise<object | null>} 講義データまたはnull
 */
export const getLecture = async (uid, semester, day, period) => {
  const ref = getSemesterDocRef(uid, semester)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const data = snap.data()
  return data.lectures && data.lectures[`${day}-${period}`]
    ? data.lectures[`${day}-${period}`]
    : null
}
