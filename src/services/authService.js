import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore"; // Firestore の関数をインポート
import { db } from "../firebase/config"; // Firestore インスタンスをインポート
import store from "@/store";

export default {
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        store.commit('auth/setUser', user);
        store.commit('auth/setIdToken', idToken);
        store.commit('auth/setUserId', user.uid);
      } else {
        store.commit('auth/clearAuthState');
      }
      if (callback) callback(user);
    });
  },

  async login({ email, password }) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },

  async signup({ email, password, username }) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: username });
      return user;
    } catch (error) {
      console.error("Sign-up failed:", error);
      throw error;
    }
  },

  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  },

  // 画像URLの更新処理
  async updatePhotoURL(user, photoURL) {
    try {
      // Firebase Authentication のプロフィール情報を更新
      await updateProfile(user, { photoURL });

      // Firestore の参照先を定義
      const docRef = doc(db, `users/${user.uid}`);
      // Firestore に photoURL を保存
      await setDoc(docRef, { photoURL }, { merge: true });

      console.log("User photo URL updated in Firestore and Authentication:", photoURL);
    } catch (error) {
      console.error("Error updating photo URL:", error);
      throw error;
    }
  },
};
