import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/config";
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
  
  async updatePhotoURL(user, photoURL) {
    try {
      await updateProfile(user, { photoURL }); // Firebase ユーザーのプロファイル更新
      console.log("Updated photo URL:", photoURL);
    } catch (error) {
      console.error("Error updating photo URL:", error);
      throw error;
    }
  },
};
