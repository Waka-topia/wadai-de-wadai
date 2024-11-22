// services/authService.js
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth"; // onAuthStateChangedをインポート
import { auth } from "../firebase/config"; // Firebase Authの設定をインポート

export default {
  // ユーザー認証状態の監視
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback); // authの認証状態を監視する
  },

  // ログイン処理
  async login({ email, password }) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      return user; // ユーザー情報を返す
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // エラーを投げて、呼び出し元でハンドリング
    }
  },

  // サインアップ処理
  async signup({ email, password }) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      return user; // ユーザー情報を返す
    } catch (error) {
      console.error("Sign-up failed:", error);
      throw error; // エラーを投げて、呼び出し元でハンドリング
    }
  },
};
