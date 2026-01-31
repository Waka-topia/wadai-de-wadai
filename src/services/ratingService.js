import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/firebase/config'

/**
 * Rating Service
 * 評価データのCRUD操作を提供
 */

const COLLECTION_NAME = 'ratings'

/**
 * 特定場所の評価を取得
 *
 * @param {string} locationId - 場所ID
 * @param {number} limitCount - 取得する評価数(デフォルト: 50)
 * @returns {Promise<Array>} 評価データの配列
 */
export async function fetchRatings(locationId, limitCount = 50) {
  try {
    const ratingsRef = collection(db, COLLECTION_NAME)
    const q = query(
      ratingsRef,
      where('locationId', '==', locationId),
      orderBy('createdAt', 'desc'),
      limit(limitCount),
    )

    const querySnapshot = await getDocs(q)
    const ratings = []

    querySnapshot.forEach((doc) => {
      ratings.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return ratings
  } catch (error) {
    console.error('評価データの取得に失敗しました:', error)
    throw error
  }
}

/**
 * 評価を送信
 *
 * @param {object} rating - 評価データ
 * @param {string} rating.locationId - 場所ID
 * @param {string} rating.userId - ユーザーID
 * @param {string} rating.category - カテゴリー
 * @param {object} rating.scores - 評価スコア
 * @param {string} rating.comment - コメント
 * @returns {Promise<object>} 追加された評価データ(IDを含む)
 */
export async function submitRating(rating) {
  try {
    const ratingData = {
      ...rating,
      createdAt: Timestamp.now(),
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), ratingData)

    return {
      id: docRef.id,
      ...ratingData,
    }
  } catch (error) {
    console.error('評価の送信に失敗しました:', error)
    throw error
  }
}

/**
 * ユーザーの評価履歴を取得
 *
 * @param {string} userId - ユーザーID
 * @param {number} limitCount - 取得する評価数(デフォルト: 20)
 * @returns {Promise<Array>} 評価データの配列
 */
export async function fetchUserRatings(userId, limitCount = 20) {
  try {
    const ratingsRef = collection(db, COLLECTION_NAME)
    const q = query(
      ratingsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount),
    )

    const querySnapshot = await getDocs(q)
    const ratings = []

    querySnapshot.forEach((doc) => {
      ratings.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return ratings
  } catch (error) {
    console.error('ユーザー評価履歴の取得に失敗しました:', error)
    throw error
  }
}

/**
 * 評価カテゴリー別の評価項目定義
 */
export const RATING_CRITERIA = {
  toilet: {
    cleanliness: {
      id: 'cleanliness',
      name: '清潔度',
      icon: 'mdi-spray-bottle',
      description: 'トイレの清潔さ',
    },
    availability: {
      id: 'availability',
      name: '空き具合',
      icon: 'mdi-door-open',
      description: '混雑していないか',
    },
    amenities: {
      id: 'amenities',
      name: '設備',
      icon: 'mdi-wrench',
      description: '設備の充実度',
    },
  },
  studySpot: {
    quietness: {
      id: 'quietness',
      name: '静かさ',
      icon: 'mdi-volume-off',
      description: '静かに勉強できるか',
    },
    comfort: {
      id: 'comfort',
      name: '快適さ',
      icon: 'mdi-sofa',
      description: '座り心地や環境',
    },
    outlets: {
      id: 'outlets',
      name: 'コンセント',
      icon: 'mdi-power-plug',
      description: 'コンセントの有無',
    },
    wifi: {
      id: 'wifi',
      name: 'Wi-Fi',
      icon: 'mdi-wifi',
      description: 'Wi-Fiの品質',
    },
  },
}

/**
 * カテゴリーIDから評価項目を取得
 *
 * @param {string} categoryId - カテゴリーID
 * @returns {object} 評価項目の定義
 */
export function getRatingCriteria(categoryId) {
  return RATING_CRITERIA[categoryId] || {}
}
