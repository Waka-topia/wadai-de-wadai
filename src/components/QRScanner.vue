<template>
  <div>
    <h2>QRコードをスキャンしてください</h2>
    <video ref="video" autoplay></video>
    <p v-if="scannedData">読み取ったデータ: {{ scannedData }}</p>
    <!-- テスト用ボタン -->
    <button @click="simulateQRCodeScan">QRコードを読み取ったと仮定</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      scannedData: null, // 読み取ったQRコードのデータ
    };
  },
  mounted() {
    this.startVideo();
  },
  methods: {
    // 実際のQRコードスキャン処理
    startVideo() {
      const video = this.$refs.video;
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          video.srcObject = stream;
        });
    },

    // テスト用: QRコード読み取りの仮想データを設定
    simulateQRCodeScan() {
      const qrData = {
        groupId: "group123",
        stampId: "stamp456"
      };
      this.handleQRCodeData(qrData);
    },

    // QRコードのデータを処理
    handleQRCodeData(data) {
      // ここでQRコードのデータを扱う
      // 例えば、Vuexにスタンプを追加したり、表示を更新したり
      console.log("読み取ったQRコードのデータ:", data);
      this.scannedData = JSON.stringify(data);
      // ここでaddStampなどのアクションを呼び出すことができます
    }
  }
};
</script>

<style>
video {
  width: 100%;
  height: auto;
}
</style>
