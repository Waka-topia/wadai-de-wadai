// src/store/index.js
import { createStore } from 'vuex'
import authModule from './modules/auth'
import eventModule from './modules/event' // イベントモジュールをインポート

import locationModule from './modules/location' // 場所モジュールをインポート
import rankingModule from './modules/ranking' // ランキングモジュールをインポート

import ratingModule from './modules/rating' // 評価モジュールをインポート
import scrollModule from './modules/scroll' // スクロール位置モジュールをインポート
import shinkanModule from './modules/shinkan' // 新歓モジュールをインポート
import stampModule from './modules/stamp' // スタンプモジュールをインポート
import titleModule from './modules/title' // タイトルモジュールをインポート
import userModule from './modules/user' // ユーザーモジュールをインポート

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
    location: locationModule, // 場所モジュールを登録
    rating: ratingModule, // 評価モジュールを登録
    scroll: scrollModule, // スクロール位置モジュールを登録
  },
})
