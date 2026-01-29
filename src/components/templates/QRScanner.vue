<template>
  <div class="bg-black">
    <h2 class="text-center">QRコードをスキャンしてください</h2>

    <!-- QRコードリーダー -->
    <QrcodeStream @detect="onDetect" @init="onInit" />

    <!-- QRコードデータ表示 ここを消せば読み取った時のテキストが消える。 -->
    <!-- <p v-if="scannedData">読み取ったデータ: {{ scannedData }}</p> -->

    <!-- テスト用ボタン -->
    <!-- <button @click="simulateQRCodeScan">QRコードを読み取ったと仮定</button> -->

    <!-- スナックバー通知 -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { QrcodeStream } from 'vue-qrcode-reader'

const store = useStore()
const scannedData = ref(null)
const isInitialized = ref(false)
const snackbar = ref({
  show: false,
  color: '',
  message: '',
})

const extractData = (rawData) => {
  try {
    const groupId = rawData?.groupId
    const stampId = rawData?.stampId

    if (groupId && stampId) {
      return { groupId, stampId }
    } else {
      console.error('必要なデータが不足しています:', rawData)
      snackbar.value = {
        show: true,
        color: 'error',
        message: '必要なデータが不足しています。',
      }
    }
  } catch (error) {
    console.error('データ抽出エラー:', error)
    snackbar.value = {
      show: true,
      color: 'error',
      message: 'データ抽出中にエラーが発生しました。',
    }
  }
  return null
}

const addStampToFirestore = async (qrData) => {
  try {
    const result = await store.dispatch('stamps/addStamp', qrData)
    snackbar.value = {
      show: true,
      color: 'success',
      message: result.message,
    }
  } catch (error) {
    console.error('Firestore へのスタンプ追加中にエラーが発生しました:', error)
    snackbar.value = {
      show: true,
      color: 'error',
      message: 'エラーが発生しました。スタンプを追加できませんでした。',
    }
  }
}

const onDetect = (decodedResult) => {
  console.log('QRコードの検出結果:', decodedResult)
  const result = Array.isArray(decodedResult) ? decodedResult[0] : decodedResult

  const rawData = result?.rawValue

  if (!rawData) {
    console.error('QRコードの生データが取得できませんでした:', decodedResult)
    snackbar.value = {
      show: true,
      color: 'error',
      message: 'QRコードが正しく読み取れませんでした。もう一度お試しください。',
    }
    return
  }

  let parsedData
  try {
    switch (typeof rawData) {
      case 'string':
        parsedData = JSON.parse(rawData)
        break
      case 'object':
        parsedData = rawData
        break
      default:
        throw new Error('データ形式が不正です')
    }
  } catch (error) {
    console.error('QRコードのデータ解析エラー:', error)
    snackbar.value = {
      show: true,
      color: 'error',
      message: 'QRコードのデータ解析に失敗しました。もう一度お試しください。',
    }
    return
  }

  const extractedData = extractData(parsedData)

  if (extractedData) {
    scannedData.value = JSON.stringify(extractedData)
    addStampToFirestore(extractedData)
  } else {
    snackbar.value = {
      show: true,
      color: 'error',
      message: '必要なデータが見つかりませんでした。正しいQRコードを使用してください。',
    }
  }
}

const onInit = async (promise) => {
  try {
    await promise
    isInitialized.value = true
    snackbar.value = {
      show: true,
      color: 'error',
      message: 'QRコードリーダーが初期化されました。',
    }
  } catch (err) {
    console.error('QRコードリーダーの初期化エラー:', err)
    snackbar.value = {
      show: true,
      color: 'error',
      message: 'カメラが使えません。設定を確認してください。HTTPSでアクセスする必要があります。',
    }
  }
}

// テスト用: QRコード読み取りの仮想データを設定しFirestoreにアップロード
/*
  const simulateQRCodeScan = async () => {
    const qrData = {
      groupId: 'group123',
      stampId: 'stamp456', // QRコードから取得したスタンプID
    }

    scannedData.value = JSON.stringify(qrData)
    console.log('テスト用読み取ったデータ:', scannedData.value)

    try {
      await addStampToFirestore(qrData)
    } catch (error) {
      console.error('エラー:', error)
    }
  }
  */
</script>
