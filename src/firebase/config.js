// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebaseの設定
const firebaseConfig = {
    apiKey: "AIzaSyDwkloo4u-Iu_A53IYYcIgm7sMIBQw0D4k",
    authDomain: "wadai-de-wadai.firebaseapp.com",
    projectId: "wadai-de-wadai",
    storageBucket: "wadai-de-wadai.firebasestorage.app",
    messagingSenderId: "121459315235",
    appId: "1:121459315235:web:78d854282cf20c051c1796"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
