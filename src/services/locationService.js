import { collection, getDocs, getDoc, doc, addDoc, query, where, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase/config'

/**
 * Location Service
 * 場所データのCRUD操作を提供
 */

const COLLECTION_NAME = 'locations'

/**
 * 全場所データを取得
 *
 * @param {string[]} categories - フィルターするカテゴリー(空配列の場合は全て取得)
 * @returns {Promise<Array>} 場所データの配列
 */
export async function fetchLocations(categories = []) {
  try {
    const locationsRef = collection(db, COLLECTION_NAME)
    let q = locationsRef

    // カテゴリーフィルターが指定されている場合
    if (categories.length > 0) {
      q = query(locationsRef, where('category', 'in', categories))
    }

    const querySnapshot = await getDocs(q)
    const locations = []

    querySnapshot.forEach((doc) => {
      locations.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    return locations
  } catch (error) {
    console.error('場所データの取得に失敗しました:', error)
    throw error
  }
}

/**
 * 特定の場所を取得
 *
 * @param {string} locationId - 場所ID
 * @returns {Promise<object>} 場所データ
 */
export async function fetchLocationById(locationId) {
  try {
    const locationRef = doc(db, COLLECTION_NAME, locationId)
    const locationSnap = await getDoc(locationRef)

    if (!locationSnap.exists()) {
      throw new Error('場所が見つかりません')
    }

    return {
      id: locationSnap.id,
      ...locationSnap.data(),
    }
  } catch (error) {
    console.error('場所の取得に失敗しました:', error)
    throw error
  }
}

/**
 * 新規場所を追加
 *
 * @param {object} location - 場所データ
 * @param {string} location.name - 場所名
 * @param {string} location.category - カテゴリー
 * @param {object} location.coordinates - 座標 { lng: number, lat: number }
 * @param {string} location.description - 説明
 * @param {string[]} location.images - 画像URL配列
 * @returns {Promise<object>} 追加された場所データ(IDを含む)
 */
export async function addLocation(location) {
  try {
    const now = Timestamp.now()
    const locationData = {
      ...location,
      createdAt: now,
      updatedAt: now,
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), locationData)

    return {
      id: docRef.id,
      ...locationData,
    }
  } catch (error) {
    console.error('場所の追加に失敗しました:', error)
    throw error
  }
}

/**
 * カテゴリー定義
 * UIで使用するカテゴリー情報
 */
export const LOCATION_CATEGORIES = {
  toilet: {
    id: 'toilet',
    name: 'トイレ',
    icon: 'mdi-toilet',
    color: '#2196F3', // 青
  },
  studySpot: {
    id: 'studySpot',
    name: '勉強スポット',
    icon: 'mdi-book-open-variant',
    color: '#4CAF50', // 緑
  },
  food: {
    id: 'food',
    name: '食事',
    icon: 'mdi-food',
    color: '#FF9800', // オレンジ
  },
  other: {
    id: 'other',
    name: 'その他',
    icon: 'mdi-map-marker',
    color: '#9E9E9E', // グレー
  },
}

/**
 * カテゴリーIDから情報を取得
 *
 * @param {string} categoryId - カテゴリーID
 * @returns {object} カテゴリー情報
 */
export function getCategoryInfo(categoryId) {
  return LOCATION_CATEGORIES[categoryId] || LOCATION_CATEGORIES.other
}
