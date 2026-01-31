/**
 * Rating Calculator
 * 評価の計算・集計ユーティリティ
 */

/**
 * 評価の平均を計算
 *
 * @param {Array} ratings - 評価データの配列
 * @returns {number|null} 平均評価(1-5)
 */
export function calculateAverageRating(ratings) {
  if (!ratings || ratings.length === 0) {
    return null
  }

  const allScores = []
  ratings.forEach((rating) => {
    if (rating.scores) {
      Object.values(rating.scores).forEach((score) => {
        if (typeof score === 'number') {
          allScores.push(score)
        }
      })
    }
  })

  if (allScores.length === 0) return null

  const sum = allScores.reduce((acc, score) => acc + score, 0)
  return parseFloat((sum / allScores.length).toFixed(1))
}

/**
 * カテゴリー別の平均評価を計算
 *
 * @param {Array} ratings - 評価データの配列
 * @returns {object} カテゴリー別平均評価 { category: average }
 */
export function calculateCategoryAverages(ratings) {
  if (!ratings || ratings.length === 0) {
    return {}
  }

  const categoryScores = {}
  const categoryCounts = {}

  ratings.forEach((rating) => {
    if (rating.scores) {
      Object.entries(rating.scores).forEach(([category, score]) => {
        if (typeof score === 'number') {
          categoryScores[category] = (categoryScores[category] || 0) + score
          categoryCounts[category] = (categoryCounts[category] || 0) + 1
        }
      })
    }
  })

  const averages = {}
  Object.keys(categoryScores).forEach((category) => {
    averages[category] = parseFloat((categoryScores[category] / categoryCounts[category]).toFixed(1))
  })

  return averages
}

/**
 * 評価の分布を計算
 *
 * @param {Array} ratings - 評価データの配列
 * @returns {object} 評価分布 { 1: count, 2: count, ... }
 */
export function calculateRatingDistribution(ratings) {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

  if (!ratings || ratings.length === 0) {
    return distribution
  }

  ratings.forEach((rating) => {
    const avg = calculateAverageRating([rating])
    if (avg !== null) {
      const rounded = Math.round(avg)
      distribution[rounded] = (distribution[rounded] || 0) + 1
    }
  })

  return distribution
}

/**
 * 星の表示用配列を生成
 *
 * @param {number} rating - 評価値(1-5)
 * @returns {Array} 星の状態配列 ['full', 'full', 'half', 'empty', 'empty']
 */
export function generateStarArray(rating) {
  if (rating === null || rating === undefined) {
    return ['empty', 'empty', 'empty', 'empty', 'empty']
  }

  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push('full')
    } else if (i === fullStars && hasHalfStar) {
      stars.push('half')
    } else {
      stars.push('empty')
    }
  }

  return stars
}

/**
 * 評価データのバリデーション
 *
 * @param {object} rating - 評価データ
 * @returns {object} { valid: boolean, errors: string[] }
 */
export function validateRating(rating) {
  const errors = []

  if (!rating.locationId) {
    errors.push('場所IDが必要です')
  }

  if (!rating.category) {
    errors.push('カテゴリーが必要です')
  }

  if (!rating.scores || Object.keys(rating.scores).length === 0) {
    errors.push('評価スコアが必要です')
  } else {
    Object.entries(rating.scores).forEach(([key, value]) => {
      if (typeof value !== 'number' || value < 1 || value > 5) {
        errors.push(`${key}の評価は1-5の範囲で指定してください`)
      }
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
