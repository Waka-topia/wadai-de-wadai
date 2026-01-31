/**
 * Geolocation Service
 * ユーザーの位置情報を取得・監視する機能を提供
 */

/**
 * Geolocation APIのオプション
 */
const DEFAULT_OPTIONS = {
  enableHighAccuracy: true, // 高精度モード
  maximumAge: 0, // キャッシュを使用しない
  timeout: 5000, // タイムアウト時間(5秒)
}

/**
 * ユーザーの現在地を取得
 *
 * @param {object} options - Geolocation APIのオプション
 * @returns {Promise<{lng: number, lat: number, accuracy: number}>} 位置情報オブジェクト
 */
export function getCurrentPosition(options = DEFAULT_OPTIONS) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('このブラウザは位置情報に対応していません'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lng: position.coords.longitude,
          lat: position.coords.latitude,
          accuracy: position.coords.accuracy, // 精度(メートル)
        })
      },
      (error) => {
        reject(handleGeolocationError(error))
      },
      options,
    )
  })
}

/**
 * 位置情報の監視を開始
 *
 * @param {(position: {lng: number, lat: number, accuracy: number}) => void} callback - 位置更新時のコールバック関数
 * @param {(error: Error) => void} errorCallback - エラー時のコールバック関数
 * @param {object} options - Geolocation APIのオプション
 * @returns {number} watchId - 監視ID(停止時に使用)
 */
export function watchPosition(callback, errorCallback, options = DEFAULT_OPTIONS) {
  if (!navigator.geolocation) {
    errorCallback(new Error('このブラウザは位置情報に対応していません'))
    return null
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      callback({
        lng: position.coords.longitude,
        lat: position.coords.latitude,
        accuracy: position.coords.accuracy,
      })
    },
    (error) => {
      errorCallback(handleGeolocationError(error))
    },
    options,
  )

  return watchId
}

/**
 * 位置情報の監視を停止
 *
 * @param {number} watchId - 監視ID
 */
export function clearWatch(watchId) {
  if (watchId !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId)
  }
}

/**
 * Geolocation APIのエラーをハンドリング
 *
 * @param {object} error - エラーオブジェクト
 * @returns {Error} エラーメッセージを含むErrorオブジェクト
 */
function handleGeolocationError(error) {
  let message = ''

  switch (error.code) {
    case error.PERMISSION_DENIED:
      message =
        '位置情報の取得が拒否されました。位置情報を有効にしてください。\n\n' +
        '【iPhoneの場合】\n' +
        '1. 設定アプリを開く\n' +
        '2. 「プライバシー」をタップ\n' +
        '3. 「位置情報サービス」をオンにする\n' +
        '4. 「アプリ名(safari等)」への位置情報のアクセスを許可する\n' +
        '※iOSが18.0未満の場合、位置情報が取得できない場合があります。iOS18.0以上にアップデートしてください。\n\n' +
        '【Androidの場合】\n' +
        '1. 設定アプリを開く\n' +
        '2. 「位置情報」をタップ\n' +
        '3. 位置情報をオンにする\n' +
        '4. 「アプリ名(GoogleChrome等)」への位置情報のアクセスを許可する'
      break
    case error.POSITION_UNAVAILABLE:
      message = '位置情報が利用できません。'
      break
    case error.TIMEOUT:
      message = '位置情報の取得がタイムアウトしました。'
      break
    default:
      message = '不明なエラーが発生しました。'
      break
  }

  return new Error(message)
}

/**
 * 2点間の距離を計算(Haversine公式)
 *
 * @param {object} point1 - 地点1 { lng: number, lat: number }
 * @param {object} point2 - 地点2 { lng: number, lat: number }
 * @returns {number} 距離(メートル)
 */
export function calculateDistance(point1, point2) {
  const R = 6371e3 // 地球の半径(メートル)
  const φ1 = (point1.lat * Math.PI) / 180
  const φ2 = (point2.lat * Math.PI) / 180
  const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180
  const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // 距離(メートル)
}

/**
 * 距離を人間が読みやすい形式に変換
 *
 * @param {number} meters - 距離(メートル)
 * @returns {string} フォーマットされた距離文字列
 */
export function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}
