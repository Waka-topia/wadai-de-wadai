import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Firebaseの設定
const firebaseConfig = {
  apiKey: getEnvVar('VITE_API_KEY'),
  authDomain: getEnvVar('VITE_AUTH_DOMAIN'),
  projectId: getEnvVar('VITE_PROJECT_ID'),
  storageBucket: getEnvVar('VITE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('VITE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('VITE_APP_ID'),
}

// Firebase初期化
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

export { db, auth }
