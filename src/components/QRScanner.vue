<template>
  <div>
    <h2>QRコードをスキャンしてください</h2>
    <video ref="video" autoplay></video>
    <p v-if="scannedData">読み取ったデータ: {{ scannedData }}</p>
    <!-- テスト用ボタン -->
    <button @click="simulateQRCodeScan">QRコードを読み取ったと仮定</button>
  </div>
</template>

<!-- <script>
import { mapActions } from "vuex";

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
    ...mapActions("stamp", ["addStamp"]), // Vuexアクションをマッピング

    // 実際のQRコードスキャン処理
    startVideo() {
      const video = this.$refs.video;
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          video.srcObject = stream;
        })
        .catch((error) => {
          console.error("カメラにアクセスできませんでした:", error);
          alert("カメラのアクセスが拒否されました。カメラの設定を確認してください。");
        });
    },

    // テスト用: QRコード読み取りの仮想データを設定しFirestoreにアップロード
    async simulateQRCodeScan() {
      const qrData = {
        groupId: "group123",
        stampId: "stamp456",
      };

      this.scannedData = JSON.stringify(qrData);

      try {
        // Vuex アクションを使用して Firestore にアップロード
        await this.addStamp(qrData.groupId);
        console.log("スタンプがFirestoreに追加されました:", qrData);
      } catch (error) {
        console.error("Firestoreへのスタンプ追加中にエラーが発生しました:", error);
      }
    },
  },
};
</script> -->
<script>
import { mapActions } from "vuex";

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
    ...mapActions("stamp", ["addStamp"]), // Vuexアクションをマッピング

    // 実際のQRコードスキャン処理
    startVideo() {
      const video = this.$refs.video;
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          video.srcObject = stream;
        })
        .catch((error) => {
          console.error("カメラにアクセスできませんでした:", error);
          alert("カメラのアクセスが拒否されました。カメラの設定を確認してください。");
        });
    },

    // テスト用: QRコード読み取りの仮想データを設定しFirestoreにアップロード
    async simulateQRCodeScan() {
      const qrData = {
        groupId: "group123",
        stampId: "stamp456", // QRコードから取得したスタンプID
      };

      this.scannedData = JSON.stringify(qrData);

      try {
        // Vuex アクションを使用して Firestore にアップロード
        const result = await this.addStamp(qrData);

        // ユーザーに結果を提供
        alert(result.message);
        console.log("スタンプ追加結果:", result);
      } catch (error) {
        console.error("Firestoreへのスタンプ追加中にエラーが発生しました:", error);
        alert("エラーが発生しました。スタンプを追加できませんでした。");
      }
    },
  },
};
</script>


<style>
video {
  width: 100%;
  height: auto;
}
</style>
