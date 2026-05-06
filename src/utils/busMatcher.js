// src/utils/busMatcher.js

// =========================================================
// 🎯 和歌山バス GTFS ターゲットID設定（プラットホーム判定）
// =========================================================
export const BUS_CONFIG = {
  // 代わりに「どちらの乗り場（プラットホーム）に停まるか」で完全に振り分けます。

  // 路線Univ（和歌山大学前駅・ふじと台方面）の乗り場ID
  // ※もし画面上で表示が逆になっていたら、ここを '63_1' にしてください
  univPlatformId: '63_2',

  // 路線Jr（JR和歌山駅方面）の乗り場ID
  // ※もし画面上で表示が逆になっていたら、ここを '63_2' にしてください
  jrPlatformId: '63_1',
}

/** GTFSデータから「和歌山大学に次に到着/出発するバス」を特定する */
export const findTargetBuses = (gtfsData) => {
  if (!gtfsData || !gtfsData.tripUpdates || !gtfsData.tripUpdates.entity) {
    return { routeUniv: null, routeJr: null }
  }

  const entities = gtfsData.tripUpdates.entity
  const nowSec = Math.floor(Date.now() / 1000) // 現在時刻（UNIX秒）

  let candidatesUniv = []
  let candidatesJr = []

  entities.forEach((entity) => {
    const trip = entity.tripUpdate.trip
    if (!trip || !trip.routeId) return

    const stopUpdates = entity.tripUpdate.stopTimeUpdate || []

    // このバスが「和歌山大学（63_1 または 63_2）」に停まる予定があるか探す
    const univStop = stopUpdates.find(
      (stu) => stu.stopId === BUS_CONFIG.univPlatformId || stu.stopId === BUS_CONFIG.jrPlatformId,
    )

    if (univStop) {
      let targetTimeSec = 0
      let delay = 0
      let status = 'transit'
      let timeType = 'departure'

      const depTime = univStop.departure?.time
      const arrTime = univStop.arrival?.time

      if (depTime) {
        targetTimeSec = parseInt(depTime, 10)
        delay = univStop.departure?.delay || 0
        timeType = 'departure'
        status = arrTime ? 'transit' : 'origin' // 到着もあれば途中、出発のみなら始発
      } else if (arrTime) {
        targetTimeSec = parseInt(arrTime, 10)
        delay = univStop.arrival?.delay || 0
        timeType = 'arrival'
        status = 'destination' // 到着のみなら終点
      } else {
        return
      }

      // まだ出発/到着していない（未来の時間の）バスのみ候補に入れる
      if (targetTimeSec > nowSec) {
        const busInfo = {
          entity: entity,
          tripId: trip.tripId,
          routeId: trip.routeId,
          targetTime: targetTimeSec,
          delay: delay,
          status: status,
          timeType: timeType,
        }

        // プラットホームのIDを見て、どっち方面のバスかを振り分ける
        if (univStop.stopId === BUS_CONFIG.univPlatformId) {
          candidatesUniv.push(busInfo)
        } else if (univStop.stopId === BUS_CONFIG.jrPlatformId) {
          candidatesJr.push(busInfo)
        }
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
