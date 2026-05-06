// src/data/busStops.js

// 和歌山大学→和歌山大学前駅・ふじと台方面、和歌山大学→JR和歌山駅方面で描画したい主要なバス停のリスト
// ※座標は和歌山大学周辺の概算です。必要に応じてMapLibre上でクリックして微調整してください。
export const targetBusStops = [
  // --- 共通（出発地） ---
  { id: 'univ', name: '和歌山大学', lat: 34.26583, lng: 135.15167, type: 'start' },

  // --- 路線Univ（和歌山大学前駅・ふじと台方面） ---
  { id: 'univ_station', name: '和歌山大学前駅', lat: 34.27255, lng: 135.14552, route: 'routeUniv' },
  { id: 'fujitodai', name: 'ふじと台', lat: 34.2745, lng: 135.1435, route: 'routeUniv' }, // 終点エリア

  // --- 路線Jr（JR和歌山駅方面） ---
  { id: 'nobutoki', name: '延時', lat: 34.2543, lng: 135.1541, route: 'routeJr' },
  { id: 'jiromaru', name: '次郎丸', lat: 34.2612, lng: 135.1585, route: 'routeJr' },
  { id: 'nankai_shi', name: '南海和歌山市駅', lat: 34.2346, lng: 135.1666, route: 'routeJr' },
  {
    id: 'jr_wakayama',
    name: 'JR和歌山駅',
    lat: 34.2325,
    lng: 135.1913,
    route: 'routeJr',
    type: 'end',
  },
]
