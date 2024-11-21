// Firebase初期化ファイル
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDwkloo4u-Iu_A53IYYcIgm7sMIBQw0D4k",
  authDomain: "wadai-de-wadai.firebaseapp.com",
  projectId: "wadai-de-wadai",
  storageBucket: "wadai-de-wadai.firebasestorage.app",
  messagingSenderId: "121459315235",
  appId: "1:121459315235:web:78d854282cf20c051c1796"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app); // 認証用
export const db = getFirestore(app); // Firestore用