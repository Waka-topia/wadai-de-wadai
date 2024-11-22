import { createStore } from "vuex";
import authModule from "./modules/auth";
import stampModule from "./modules/stamp"; // スタンプモジュールをインポート

export default createStore({
  state: {
    // ストア全体の状態を記述（今回は空でも問題なし）
  },
  modules: {
    auth: authModule,
    stamp: stampModule, // スタンプモジュールを追加
  },
});
