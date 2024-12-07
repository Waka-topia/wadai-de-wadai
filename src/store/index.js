import { createStore } from "vuex";
import authModule from "./modules/auth";
import stampModule from "./modules/stamp"; // スタンプモジュールをインポート
import rankingModule from "./modules/ranking"; // ランキングモジュールをインポート
import shinkanModule from "./modules/shinkan"; // 新歓モジュールをインポート

export default createStore({
  state: {
    // ストア全体の状態を記述（今回は空でも問題なし）
  },
  modules: {
    auth: authModule,
    stamps: {
      namespaced: true, // 名前空間を有効にする
      ...stampModule,
    },
    ranking: rankingModule, // ランキングモジュールを登録
    shinkan: shinkanModule, // 新歓モジュールを登録
  },
});
