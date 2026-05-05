const { onSchedule } = require('firebase-functions/v2/scheduler')
const { initializeApp } = require('firebase-admin/app')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')
const axios = require('axios')
const GtfsRealtimeBindings = require('gtfs-realtime-bindings')

// Firebase Admin SDKの初期化
initializeApp()
const db = getFirestore()

// 1分に1回実行されるスケジュール関数
exports.fetchWakayamaBusData = onSchedule(
  {
    schedule: 'every 1 minutes',
    timeZone: 'Asia/Tokyo',
    region: 'asia-northeast1',
    timeoutSeconds: 60,
    memory: '256MiB',
  },
  async (event) => {
    try {
      // 和歌山バスの3つのAPIエンドポイント
      const urls = {
        tripUpdate: 'https://loc.bus-vision.jp/realtime/wakayama_trip_update.bin',
        vehiclePosition: 'https://loc.bus-vision.jp/realtime/wakayama_vpos_update.bin',
        serviceAlert: 'https://loc.bus-vision.jp/realtime/wakayama_alrt_update.bin',
      }

      // 並列実行
      const [tuRes, vpRes, saRes] = await Promise.all([
        axios.get(urls.tripUpdate, { responseType: 'arraybuffer' }),
        axios.get(urls.vehiclePosition, { responseType: 'arraybuffer' }),
        axios.get(urls.serviceAlert, { responseType: 'arraybuffer' }),
      ])

      // .bin (バイナリデータ) を JavaScriptオブジェクトに解読する関数
      const decodeData = (buffer) => {
        const message = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
          new Uint8Array(buffer),
        )
        return JSON.parse(JSON.stringify(message))
      }

      const combinedData = {
        tripUpdates: decodeData(tuRes.data),
        vehiclePositions: decodeData(vpRes.data),
        serviceAlerts: decodeData(saRes.data),
        updatedAt: FieldValue.serverTimestamp(),
      }

      // "busData" コレクション内のドキュメント"wakayama_latest"に上書き保存
      await db.collection('busData').doc('wakayama_latest').set(combinedData)

      console.log('和歌山バスデータの取得とFirestoreへの保存が完了しました')
    } catch (error) {
      console.error('データ取得・保存エラー:', error)
    }
  },
)
