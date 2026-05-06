// src/utils/busMatcher.js

// =========================================================
// 🎯 ターゲットID設定（後でコンソールのログを見てここを埋めます）
// =========================================================
export const BUS_CONFIG = {
  // 和歌山大学のバス停ID
  univStopId: 'UNKNOWN_STOP_ID',

  // 路線Univ（和歌山大学前駅・ふじと台方面）の路線IDリスト（前方一致用）
  routeUnivIds: ['UNKNOWN_ROUTE_UNIV'],

  // 路線Jr（JR和歌山駅方面）の路線IDリスト（前方一致用）
  routeJrIds: ['UNKNOWN_ROUTE_JR'],
}

/** GTFSデータから「和歌山大学に次に到着するバス」を特定する */
export const findTargetBuses = (gtfsData) => {
  if (!gtfsData || !gtfsData.tripUpdates || !gtfsData.tripUpdates.entity) {
    return { routeUniv: null, routeJr: null }
  }

  const entities = gtfsData.tripUpdates.entity
  const nowSec = Math.floor(Date.now() / 1000) // GTFSの時間は秒単位（UNIX Timestamp）

  // --- 🕵️ ID調査用デバッグログ（本番では消してOK） ---
  console.groupCollapsed('💡 [ID調査] 現在のGTFSデータに含まれるID一覧')
  const activeRoutes = new Set()
  const activeStops = new Set()
  entities.forEach((e) => {
    if (e.tripUpdate?.trip?.routeId) activeRoutes.add(e.tripUpdate.trip.routeId)
    e.tripUpdate?.stopTimeUpdate?.forEach((stu) => {
      if (stu.stopId) activeStops.add(stu.stopId)
    })
  })
  console.log('路線(routeId)の候補:', Array.from(activeRoutes))
  console.log('直近のバス停(stopId)の候補:', Array.from(activeStops).slice(0, 10), '...など')
  console.groupEnd()
  // ----------------------------------------------------

  let candidatesUniv = []
  let candidatesJr = []

  // 全バスのこれからの停車予定をチェック
  entities.forEach((entity) => {
    const trip = entity.tripUpdate.trip
    if (!trip || !trip.routeId) return

    const stopUpdates = entity.tripUpdate.stopTimeUpdate || []

    // このバスが「和歌山大学（univStopId）」に停まる予定があるか探す
    const univStop = stopUpdates.find((stu) => stu.stopId === BUS_CONFIG.univStopId)

    if (univStop && univStop.arrival && univStop.arrival.time) {
      const arrivalTimeSec = parseInt(univStop.arrival.time, 10)

      // まだ到着していない（未来の時間の）バスのみ候補に入れる
      if (arrivalTimeSec > nowSec) {
        const busInfo = {
          entity: entity,
          tripId: trip.tripId,
          routeId: trip.routeId,
          arrivalTime: arrivalTimeSec, // 秒
          delay: univStop.arrival.delay || 0, // 遅れ（秒）
        }

        // 路線UnivかJrに振り分け（startsWith で前方一致にしているのは枝番を吸収するため）
        const isRouteUniv = BUS_CONFIG.routeUnivIds.some((id) => trip.routeId.startsWith(id))
        const isRouteJr = BUS_CONFIG.routeJrIds.some((id) => trip.routeId.startsWith(id))

        if (isRouteUniv) candidatesUniv.push(busInfo)
        if (isRouteJr) candidatesJr.push(busInfo)
      }
    }
  })

  // 到着予定時間が最も早い順にソート（昇順）
  candidatesUniv.sort((a, b) => a.arrivalTime - b.arrivalTime)
  candidatesJr.sort((a, b) => a.arrivalTime - b.arrivalTime)

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
