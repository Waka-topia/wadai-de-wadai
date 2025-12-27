<template>
  <div class="bg-black">
    <h2 class="text-center">QRコードをスキャンしてください</h2>

    <!-- QRコードリーダー -->
    <qrcode-stream @detect="onDetect" @init="onInit" />

    <!-- QRコードデータ表示 ここを消せば読み取った時のテキストが消える。-->
    <!-- <p v-if="scannedData">読み取ったデータ: {{ scannedData }}</p> -->

    <!-- テスト用ボタン -->
    <!-- <button @click="simulateQRCodeScan">QRコードを読み取ったと仮定</button> -->
  </div>
</template>

<script>
import { QrcodeStream } from 'vue-qrcode-reader'
import { mapActions } from 'vuex'

export default {
  components: {
    QrcodeStream,
  },
  data() {
    return {
      scannedData: null, // 読み取ったQRコードのデータ
      isInitialized: false, // 初期化フラグ
    }
  },
  methods: {
    ...mapActions('stamps', ['addStamp']), // Vuexアクションをマッピング

    // QRコードが正常に読み取られた時の処理
    onDetect(decodedResult) {
      console.log('QRコードの検出結果:', decodedResult)
      const result = Array.isArray(decodedResult) ? decodedResult[0] : decodedResult
      console.log('QRコードのresult:', result)

      // QRコードの生データ（rawValue）を取得
      const rawData = result?.rawValue

      console.log('rawValue:', result?.rawValue)

      if (!rawData) {
        console.error('QRコードの生データが取得できませんでした:', decodedResult)
        alert('QRコードが正しく読み取れませんでした。もう一度お試しください。')
        return
      }

      console.log('QRコードの生データ:', rawData)

      let parsedData
      try {
        // rawDataが文字列の場合はJSONとしてパース
        if (typeof rawData === 'string') {
          // 文字列データをJSONとしてパース
          parsedData = JSON.parse(rawData)
        } else if (typeof rawData === 'object') {
          // JSONオブジェクトがそのまま渡された場合はそのまま使用
          parsedData = rawData
        } else {
          throw new Error('データ形式が不正です')
        }
      } catch (error) {
        console.error('QRコードのデータ解析エラー:', error)
        alert('QRコードのデータ解析に失敗しました。もう一度お試しください。')
        return
      }

      // 必要なデータを抽出
      const extractedData = this.extractData(parsedData)

      if (extractedData) {
        this.scannedData = JSON.stringify(extractedData)
        console.log('抽出されたデータ:', extractedData)

        // Firestore に保存
        this.addStampToFirestore(extractedData)
      } else {
        alert('必要なデータが見つかりませんでした。正しいQRコードを使用してください。')
      }
    },

    // データの抽出
    extractData(rawData) {
      try {
        // rawDataがオブジェクトの場合、そのまま利用
        const groupId = rawData?.groupId
        const stampId = rawData?.stampId

        // データが存在する場合はオブジェクトを返す
        if (groupId && stampId) {
          return { groupId, stampId }
        } else {
          console.error('必要なデータが不足しています:', rawData)
        }
      } catch (error) {
        console.error('データ抽出エラー:', error)
      }
      return null // 必要なデータがない場合はnullを返す
    },

    // 初期化時のメッセージ
    onInit(promise) {
      promise
        .then(() => {
          this.isInitialized = true
          console.log('QRコードリーダーが初期化されました。')
        })
        .catch((err) => {
          console.error('QRコードリーダーの初期化エラー:', err)
          alert('カメラが使えません。設定を確認してください。HTTPSでアクセスする必要があります。')
        })
    },

    // Firestore に QR データを保存する処理
    async addStampToFirestore(qrData) {
      try {
        const result = await this.addStamp(qrData)
        console.log('Firestore へのスタンプ追加結果:', result)
        alert(result.message)
      } catch (error) {
        console.error('Firestore へのスタンプ追加中にエラーが発生しました:', error)
        alert('エラーが発生しました。スタンプを追加できませんでした。')
      }
    },

    // テスト用: QRコード読み取りの仮想データを設定しFirestoreにアップロード
    async simulateQRCodeScan() {
      const qrData = {
        groupId: 'group123',
        stampId: 'stamp456', // QRコードから取得したスタンプID
      }

      this.scannedData = JSON.stringify(qrData)
      console.log('テスト用読み取ったデータ:', this.scannedData)

      try {
        const result = await this.addStamp(qrData)
        alert(result.message)
        console.log('スタンプ追加結果:', result)
      } catch (error) {
        console.error('Firestoreへのスタンプ追加中にエラーが発生しました:', error)
        alert('エラーが発生しました。スタンプを追加できませんでした。')
      }
    },
  },
}
</script>
