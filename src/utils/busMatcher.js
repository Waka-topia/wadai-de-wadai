// src/utils/busMatcher.js

export const BUS_CONFIG = {
  univPlatformId: '63_2',
  jrPlatformId: '63_1',
}

export const findTargetBuses = (gtfsData) => {
  if (!gtfsData || !gtfsData.tripUpdates || !gtfsData.tripUpdates.entity) {
    return { routeUniv: [], routeJr: [] } // 空の配列を返すように変更
  }

  const entities = gtfsData.tripUpdates.entity
  const nowSec = Math.floor(Date.now() / 1000)

  let candidatesUniv = []
  let candidatesJr = []

  entities.forEach((entity) => {
    const trip = entity.tripUpdate.trip
    if (!trip || !trip.routeId) return

    const stopUpdates = entity.tripUpdate.stopTimeUpdate || []
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
        status = arrTime ? 'transit' : 'origin'
      } else if (arrTime) {
        targetTimeSec = parseInt(arrTime, 10)
        delay = univStop.arrival?.delay || 0
        timeType = 'arrival'
        status = 'destination'
      } else {
        return
      }

      // 【堅牢化】予定時刻から「5分前（300秒）」〜 未来のバスをすべて配列として保持する
      if (targetTimeSec > nowSec - 300) {
        const busInfo = {
          entity: entity,
          tripId: trip.tripId,
          routeId: trip.routeId,
          targetTime: targetTimeSec,
          delay: delay,
          status: status,
          timeType: timeType,
        }

        if (univStop.stopId === BUS_CONFIG.univPlatformId) {
          candidatesUniv.push(busInfo)
        } else if (univStop.stopId === BUS_CONFIG.jrPlatformId) {
          candidatesJr.push(busInfo)
        }
      }
    }
  })

  candidatesUniv.sort((a, b) => a.targetTime - b.targetTime)
  candidatesJr.sort((a, b) => a.targetTime - b.targetTime)

  // 【堅牢化】単一のオブジェクトではなく、配列をごっそりそのまま返す
  return {
    routeUniv: candidatesUniv,
    routeJr: candidatesJr,
  }
}

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
