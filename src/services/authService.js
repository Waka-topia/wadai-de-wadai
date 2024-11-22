import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth"; // signOut をインポート
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
      throw error;
    }
  },

  // サインアップ処理
  async signup({ email, password }) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      return user;
    } catch (error) {
      console.error("Sign-up failed:", error);
      throw error;
    }
  },

  // ログアウト処理
  async logout() {
    try {
      await signOut(auth); // FirebaseのsignOutメソッドを呼び出す
      console.log("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  },
};
