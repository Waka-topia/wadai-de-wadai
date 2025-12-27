//src/store/index.js
import { createStore } from 'vuex'
import authModule from './modules/auth'
import stampModule from './modules/stamp' // スタンプモジュールをインポート
import rankingModule from './modules/ranking' // ランキングモジュールをインポート
import shinkanModule from './modules/shinkan' // 新歓モジュールをインポート
import userModule from './modules/user' // ユーザーモジュールをインポート
import titleModule from './modules/title' // タイトルモジュールをインポート
import eventModule from './modules/event' // イベントモジュールをインポート

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
    users: {
      namespaced: true, // 名前空間を有効にする
      ...userModule,
    },
    ranking: rankingModule, // ランキングモジュールを登録
    shinkan: shinkanModule, // 新歓モジュールを登録
    title: titleModule, // タイトルモジュールを登録
    event: {
      namespaced: true, // 名前空間を有効にする
      ...eventModule, // イベントモジュールを登録
    },
  },
})
