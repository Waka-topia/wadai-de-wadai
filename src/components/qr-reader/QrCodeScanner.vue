<template>
  <div>
    <div class="scanner-stage">
      <QrcodeStream
        :formats="['qr_code']"
        :paused="paused"
        :torch="isTorchOn"
        :track="paintOutline"
        @camera-on="onCameraOn"
        @camera-off="onCameraOff"
        @detect="onDetect"
        @error="onError"
      >
        <!-- 読み取り位置を示す枠 -->
        <div class="scanner-overlay d-flex align-center justify-center">
          <div class="scanner-frame">
            <span class="frame-corner frame-corner--tl" />
            <span class="frame-corner frame-corner--tr" />
            <span class="frame-corner frame-corner--bl" />
            <span class="frame-corner frame-corner--br" />
          </div>
        </div>

        <div v-if="!isCameraReady" class="camera-placeholder">
          <v-progress-circular color="white" indeterminate size="36" />
          <p class="text-body-2 mt-3 mb-0">カメラを起動しています…</p>
        </div>

        <v-btn
          v-if="isTorchAvailable"
          class="torch-btn"
          :color="isTorchOn ? 'orange' : 'grey-darken-3'"
          icon="mdi-flashlight"
          size="small"
          @click="toggleTorch"
        />
      </QrcodeStream>
    </div>

    <p class="text-center text-body-1 font-weight-bold py-8 mb-0">
      QRコードをスキャンして、スタンプを集めよう！
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { QrcodeStream } from 'vue-qrcode-reader'
import { parseStampPayload } from '@/utils/qrPayload'

defineProps({
  /** 読み取りを一時停止するか（獲得ダイアログ表示中など） */
  paused: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['detected', 'invalid', 'error'])

const isCameraReady = ref(false)
const isTorchAvailable = ref(false)
const isTorchOn = ref(false)

/**
 * 検出したQRコードの輪郭をオレンジで描画する
 *
 * 「今スキャンできている」ことが利用者に伝わるようにするための描画コールバック
 *
 * @param {object[]} detectedCodes - 検出されたコード
 * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
 */
const paintOutline = (detectedCodes, ctx) => {
  detectedCodes.forEach((code) => {
    const [firstPoint, ...otherPoints] = code.cornerPoints

    ctx.strokeStyle = '#ff9800'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(firstPoint.x, firstPoint.y)
    otherPoints.forEach((point) => ctx.lineTo(point.x, point.y))
    ctx.closePath()
    ctx.stroke()
  })
}

/**
 * カメラ起動完了時の処理
 *
 * @param {object} capabilities - カメラのトラック機能
 */
const onCameraOn = (capabilities) => {
  isCameraReady.value = true
  isTorchAvailable.value = Boolean(capabilities?.torch)
}

const onCameraOff = () => {
  isCameraReady.value = false
  isTorchOn.value = false
}

const toggleTorch = () => {
  isTorchOn.value = !isTorchOn.value
}

/**
 * QRコード検出時の処理
 *
 * @param {object[]} detectedCodes - 検出されたコード
 */
const onDetect = (detectedCodes) => {
  const rawValue = detectedCodes?.[0]?.rawValue
  const payload = parseStampPayload(rawValue)

  if (!payload) {
    emit('invalid')
    return
  }

  emit('detected', payload)
}

/**
 * カメラ関連のエラーを日本語のメッセージに変換して通知する
 *
 * @param {Error} error - QrcodeStream が投げたエラー
 */
const onError = (error) => {
  const messages = {
    NotAllowedError: 'カメラの使用が許可されていません。ブラウザの設定を確認してください。',
    NotFoundError: '利用できるカメラが見つかりませんでした。',
    NotSupportedError: 'この環境ではカメラを利用できません。',
    NotReadableError: 'カメラを他のアプリが使用中の可能性があります。',
    OverconstrainedError: '対応するカメラが見つかりませんでした。',
    StreamApiNotSupportedError: 'この環境ではカメラを利用できません。',
    InsecureContextError: 'カメラを使うには https でのアクセスが必要です。',
  }

  emit('error', messages[error.name] ?? `カメラの起動に失敗しました。${error.message}`)
}
</script>

<style scoped>
.scanner-stage {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  /* 横長・低いビューポートで画面を占有しすぎないよう上限を設ける */
  max-height: 55vh;
  background-color: #808080;
  overflow: hidden;
}

.scanner-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.scanner-frame {
  position: relative;
  /* 縦横どちらか短い方に合わせて正方形にする */
  height: 72%;
  max-width: min(72%, 320px);
  aspect-ratio: 1;
}

.frame-corner {
  position: absolute;
  width: 44px;
  height: 44px;
  border: 6px solid #fff;
}

.frame-corner--tl {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
  border-top-left-radius: 22px;
}

.frame-corner--tr {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
  border-top-right-radius: 22px;
}

.frame-corner--bl {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
  border-bottom-left-radius: 22px;
}

.frame-corner--br {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
  border-bottom-right-radius: 22px;
}

.camera-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
}

.torch-btn {
  position: absolute;
  right: 16px;
  bottom: 16px;
}
</style>
