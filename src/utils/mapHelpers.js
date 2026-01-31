/**
 * Map Helpers
 * マップ関連のユーティリティ関数
 */

/**
 * 評価スコアから色を取得
 *
 * @param {number} averageRating - 平均評価(1-5)
 * @returns {string} 色コード
 */
export function getRatingColor(averageRating) {
  if (averageRating === null || averageRating === undefined) {
    return '#9E9E9E' // グレー(評価なし)
  }

  if (averageRating >= 4.5) return '#4CAF50' // 濃い緑
  if (averageRating >= 3.5) return '#8BC34A' // 黄緑
  if (averageRating >= 2.5) return '#FFC107' // 黄色
  if (averageRating >= 1.5) return '#FF9800' // オレンジ
  return '#F44336' // 赤
}

/**
 * GeoJSON形式のFeatureCollectionを作成
 *
 * @param {Array} locations - 場所データの配列
 * @returns {object} GeoJSON FeatureCollection
 */
export function createGeoJSONFeatureCollection(locations) {
  return {
    type: 'FeatureCollection',
    features: locations.map((location) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [location.coordinates.lng, location.coordinates.lat],
      },
      properties: {
        id: location.id,
        name: location.name,
        category: location.category,
        description: location.description,
        images: location.images,
      },
    })),
  }
}

/**
 * MapLibre GL JSのマーカー用HTMLを生成
 *
 * @param {string} iconName - MDIアイコン名
 * @param {string} color - 色コード
 * @param {number} size - アイコンサイズ(px)
 * @returns {string} HTML文字列
 */
export function createMarkerHTML(iconName, color, size = 24) {
  return `<i class="mdi ${iconName}" style="font-size: ${size}px; color: ${color};"></i>`
}

/**
 * 境界ボックスを計算
 *
 * @param {Array} locations - 場所データの配列
 * @returns {Array} [[minLng, minLat], [maxLng, maxLat]]
 */
export function calculateBounds(locations) {
  if (!locations || locations.length === 0) {
    return null
  }

  let minLng = Infinity
  let maxLng = -Infinity
  let minLat = Infinity
  let maxLat = -Infinity

  locations.forEach((location) => {
    const { lng, lat } = location.coordinates
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
  })

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ]
}

/**
 * マップの中心座標を計算
 *
 * @param {Array} locations - 場所データの配列
 * @returns {Array} [lng, lat]
 */
export function calculateCenter(locations) {
  if (!locations || locations.length === 0) {
    return null
  }

  let sumLng = 0
  let sumLat = 0

  locations.forEach((location) => {
    sumLng += location.coordinates.lng
    sumLat += location.coordinates.lat
  })

  return [sumLng / locations.length, sumLat / locations.length]
}
