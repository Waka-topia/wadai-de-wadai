// src/utils/busMatcher.js

// =========================================================
// 🎯 和歌山バス GTFS ターゲットID設定（自動探索結果より設定）
// =========================================================
export const BUS_CONFIG = {
  // 和歌山大学のバス停ID（上り・下り両方の乗り場に対応するため配列化）
  univStopIds: ['63_1', '63_2'],

  // 路線Univ（和歌山大学前駅・ふじと台方面）の路線IDリスト（前方一致）
  // ※もし表示が逆なら '16000' と入れ替えてください
  routeUnivIds: ['16002'],

  // 路線Jr（JR和歌山駅方面）の路線IDリスト（前方一致）
  // ※もし表示が逆なら '16002' と入れ替えてください
  routeJrIds: ['16000'],
}

/** GTFSデータから「和歌山大学に次に到着/出発するバス」を特定する */
export const findTargetBuses = (gtfsData) => {
  if (!gtfsData || !gtfsData.tripUpdates || !gtfsData.tripUpdates.entity) {
    return { routeUniv: null, routeJr: null }
  }

  const entities = gtfsData.tripUpdates.entity
  const nowSec = Math.floor(Date.now() / 1000) // GTFSの時間は秒単位（UNIX Timestamp）

  let candidatesUniv = []
  let candidatesJr = []

  // 全バスのこれからの停車予定をチェック
  entities.forEach((entity) => {
    const trip = entity.tripUpdate.trip
    if (!trip || !trip.routeId) return

    const stopUpdates = entity.tripUpdate.stopTimeUpdate || []

    // このバスが「和歌山大学（63_1 または 63_2）」に停まる予定があるか探す
    const univStop = stopUpdates.find((stu) => BUS_CONFIG.univStopIds.includes(stu.stopId))

    if (univStop) {
      const hasArr = univStop.arrival && univStop.arrival.time
      const hasDep = univStop.departure && univStop.departure.time

      let targetTimeSec = 0
      let delay = 0
      let status = 'transit' // 'origin'(始発) | 'destination'(終点) | 'transit'(途中)
      let timeType = 'departure' // 'departure'(発) | 'arrival'(着)

      // GTFSの仕様に合わせた始発・終点・途中の判定
      if (hasDep && !hasArr) {
        status = 'origin'
        timeType = 'departure'
        targetTimeSec = parseInt(univStop.departure.time, 10)
        delay = univStop.departure.delay || 0
      } else if (hasArr && !hasDep) {
        status = 'destination'
        timeType = 'arrival'
        targetTimeSec = parseInt(univStop.arrival.time, 10)
        delay = univStop.arrival.delay || 0
      } else if (hasArr && hasDep) {
        status = 'transit'
        timeType = 'departure' // 途中の場合は「出発時刻」を基準にする
        targetTimeSec = parseInt(univStop.departure.time, 10)
        delay = univStop.departure.delay || 0
      } else {
        return // 時間データが全くなければスキップ
      }

      // まだ出発/到着していない（未来の時間の）バスのみ候補に入れる
      if (targetTimeSec > nowSec) {
        const busInfo = {
          entity: entity,
          tripId: trip.tripId,
          routeId: trip.routeId,
          targetTime: targetTimeSec, // UIでカウントダウンに使う基準時間
          delay: delay,
          status: status, // UI表示用ステータス
          timeType: timeType, // UI表示用（発/着）
        }

        // 路線UnivかJrに振り分け（startsWith で前方一致にしているのは枝番を吸収するため）
        const isRouteUniv = BUS_CONFIG.routeUnivIds.some((id) => trip.routeId.startsWith(id))
        const isRouteJr = BUS_CONFIG.routeJrIds.some((id) => trip.routeId.startsWith(id))

        if (isRouteUniv) candidatesUniv.push(busInfo)
        if (isRouteJr) candidatesJr.push(busInfo)
      }
    }
  })

  // 時間が最も早い順にソート（昇順）
  candidatesUniv.sort((a, b) => a.targetTime - b.targetTime)
  candidatesJr.sort((a, b) => a.targetTime - b.targetTime)

  return {
    routeUniv: candidatesUniv.length > 0 ? candidatesUniv[0] : null,
    routeJr: candidatesJr.length > 0 ? candidatesJr[0] : null,
  }
}

/** 該当バスの vehiclePosition (緯度経度) を探し出す */
export const getBusPosition = (gtfsData, targetTripId) => {
  if (!gtfsData || !gtfsData.vehiclePositions || !gtfsData.vehiclePositions.entity) return null

  const vPos = gtfsData.vehiclePositions.entity.find(
    (e) => e.vehicle?.trip?.tripId === targetTripId,
  )
  if (vPos && vPos.vehicle && vPos.vehicle.position) {
    return {
      lat: vPos.vehicle.position.latitude,
      lng: vPos.vehicle.position.longitude,
      speed: vPos.vehicle.position.speed || 0,
    }
  }
  return null
}
