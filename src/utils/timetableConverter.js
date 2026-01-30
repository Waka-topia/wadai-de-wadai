/**
 * 簡易フォーマットの時刻表データを、アプリで使用する詳細オブジェクト形式に変換します。
 *
 * 入力例: "24sw" (7時台)
 * 出力例: {
 *   h: 7,
 *   m: 24,
 *   type: "limited_express",
 *   dest: "namba",
 *   features: ["reserved_seat", "women_only"]
 * }
 */

export const convertTimetables = (rawData) => {
  const converted = {}

  for (const [routeKey, variants] of Object.entries(rawData)) {
    converted[routeKey] = {}
    for (const [dayType, hoursMap] of Object.entries(variants)) {
      const scheduleList = []

      for (const [hourStr, minutesArr] of Object.entries(hoursMap)) {
        const hour = parseInt(hourStr)

        minutesArr.forEach(rawStr => {
          const item = parseTimeItem(hour, rawStr, routeKey)
          scheduleList.push(item)
        })
      }

      // 時刻順にソート (念のため)
      scheduleList.sort((a, b) => {
        if (a.h !== b.h) return a.h - b.h
        return a.m - b.m
      })

      converted[routeKey][dayType] = scheduleList
    }
  }

  return converted
}

const parseTimeItem = (hour, rawStr, routeKey) => {
  // 分(数字) と サフィックス(文字) を分離
  // 例: "30s" -> match[1]="30", match[2]="s"
  const match = rawStr.match(/^(\d+)([a-zA-Z]*)$/)
  if (!match) {
    console.warn(`Invalid time format: ${rawStr}`)
    return null
  }

  const minutes = parseInt(match[1])
  const suffixes = match[2].toLowerCase()

  // デフォルト値
  let type = 'local'
  let dest = getDefaultDest(routeKey)
  let features = []

  // 電車サフィックスの解析
  if (suffixes.includes('s')) {
    type = 'limited_express_southern' // サザン
    features.push('reserved_seat')
  } else if (suffixes.includes('t')) {
    type = 'limited_express' // 特急
  } else if (suffixes.includes('q')) {
    type = 'express' // 急行
  } else if (suffixes.includes('k')) {
    type = 'sub_express' // 区間急行
  }

  // バスサフィックスの解析
  // BusUniv
  if (suffixes.includes('e')) {
    dest = 'station_only' // 駅止まり
    features.push('terminates_at_station')
  }

  // BusJr
  if (suffixes.includes('n')) {
    features.push('via_nobutoki') // 延時経由
  } else if (suffixes.includes('j')) {
    features.push('via_jiromaru') // 次郎丸経由
  }

  // 電車行き先
  if (suffixes.includes('p')) dest = 'wakayamako'
  if (suffixes.includes('h')) dest = 'hagurazaki'
  if (suffixes.includes('i')) dest = 'izumisano'

  // その他
  if (suffixes.includes('w')) features.push('women_only')

  return {
    h: hour,
    m: minutes,
    s: 0, // 秒はデフォルト0
    type,
    dest,
    features,
    // 表示用のフォーマット時刻 (デバッグや単純表示用)
    displayTime: `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }
}

const getDefaultDest = (routeKey) => {
  if (routeKey.includes('Namba')) return 'namba'
  if (routeKey.includes('Wakayamashi')) return 'wakayamashi'
  if (routeKey.includes('BusUniv')) return 'fujitodai' // Default: Station & Fujitodai
  if (routeKey.includes('BusJr')) return 'jr_station'
  return 'unknown'
}
