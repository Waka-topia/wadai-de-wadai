<template>
  <div>
    <h2>QRコードをスキャンしてください</h2>
    
    <!-- QRコードリーダー -->
    <qrcode-stream @detect="onDecode" @init="onInit" />

    <!-- QRコードデータ表示 -->
    <p v-if="scannedData">読み取ったデータ: {{ scannedData }}</p>

    <!-- テスト用ボタン -->
    <button @click="simulateQRCodeScan">QRコードを読み取ったと仮定</button>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import { QrcodeStream } from "vue-qrcode-reader";

export default {
  components: {
    QrcodeStream,
  },
  data() {
    return {
      scannedData: null, // 読み取ったQRコードのデータ
      isInitialized: false, // 初期化フラグ
    };
  },
  methods: {
    ...mapActions("stamp", ["addStamp"]), // Vuexアクションをマッピング

    // QRコードが正常に読み取られた時の処理
    onDecode(decodedString) {
      console.log("QRコードのデータ:", decodedString);
      this.scannedData = decodedString;

      try {
        // QRデータをオブジェクトに変換
        const qrData = JSON.parse(decodedString);
        console.log("パースされたQRデータ:", qrData);
        this.addStampToFirestore(qrData);
      } catch (error) {
        console.error("QRデータのパースに失敗しました:", error);
        alert("QRデータの解析に失敗しました。");
      }
    },

    // 初期化時のメッセージ
    onInit(promise) {
      promise
        .then(() => {
          this.isInitialized = true;
          console.log("QRコードリーダーが初期化されました。");
        })
        .catch((err) => {
          console.error("QRコードリーダーの初期化エラー:", err);
          alert("カメラが使えません。設定を確認してください。");
        });
    },

    // Firestore に QR データを保存する処理
    async addStampToFirestore(qrData) {
      try {
        const result = await this.addStamp(qrData);
        console.log("Firestore へのスタンプ追加結果:", result);
        alert(result.message);
      } catch (error) {
        console.error("Firestore へのスタンプ追加中にエラーが発生しました:", error);
        alert("エラーが発生しました。スタンプを追加できませんでした。");
      }
    },

    // テスト用: QRコード読み取りの仮想データを設定しFirestoreにアップロード
    async simulateQRCodeScan() {
      const qrData = {
        groupId: "group123",
        stampId: "stamp1229", // QRコードから取得したスタンプID
      };

      this.scannedData = JSON.stringify(qrData);

      try {
        const result = await this.addStamp(qrData);
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

p {
  font-size: 18px;
  color: green;
}

button {
  margin-top: 20px;
}
</style>
