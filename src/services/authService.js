import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut,  // signOut をインポート
  } from "firebase/auth";
  import { auth } from "../firebase/config";
  import { onAuthStateChanged } from "firebase/auth";
  
  // ログイン処理
  export const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user; // 成功したユーザー情報を返す
    } catch (error) {
      console.error("Login Error:", error.message); // エラー内容をコンソールに表示
      throw new Error("ログインに失敗しました。"); // ユーザー向けにエラーメッセージを変更
    }
  };
  
  // サインアップ処理
  export const signUp = async (email, password, displayName = "") => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
      // Firebaseのユーティリティ関数を使用してユーザー名を設定
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
  
      return userCredential.user; // 成功したユーザー情報を返す
    } catch (error) {
      console.error("Sign Up Error:", error.message); // エラー内容をコンソールに表示
      throw new Error("サインアップに失敗しました。"); // ユーザー向けにエラーメッセージを変更
    }
  };
  
  // 認証状態を監視する関数
  export const observeAuthState = (callback) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User logged in:", user); // ログインしたユーザー情報をログに表示
        callback(user); // ユーザー情報をコールバック関数に渡す
      } else {
        console.log("No user logged in"); // ログインしていないことをログに表示
        callback(null); // ログインしていない場合は null を渡す
      }
    });
  };
  
  // ログアウト処理
  export const logout = async () => {
    try {
      await signOut(auth); // FirebaseのsignOut関数を使用してログアウト
      console.log("ログアウトしました");
    } catch (error) {
      console.error("Logout Error:", error.message); // エラー内容をコンソールに表示
      throw new Error("ログアウトに失敗しました。"); // ユーザー向けにエラーメッセージを変更
    }
  };
  