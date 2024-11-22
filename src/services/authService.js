import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import store from "@/store";

export default {
  // ユーザー認証状態の監視
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        store.dispatch('auth/setUserId', user.uid);  // VuexにuserIdを設定
      } else {
        store.dispatch('auth/setUserId', null);  // ユーザーがいない場合はnull
      }
      callback(user);
    });
  },

  // ログイン処理
  async login({ email, password }) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      return user;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },

  // サインアップ処理
  async signup({ email, password, username }) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ユーザー名の設定
      await updateProfile(user, {
        displayName: username,
      });

      return user;
    } catch (error) {
      console.error("Sign-up failed:", error);
      throw error;
    }
  },

  // ログアウト処理
  async logout() {
    try {
      await signOut(auth);
      console.log("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  },
};
