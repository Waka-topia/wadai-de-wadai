import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore' // Firestore の関数をインポート

// Firestore インスタンスをインポート
import store from '@/store'
import { auth, db } from '../firebase/config'

// Firebaseが正しく初期化されているかチェック
if (!auth || !db) {
  console.error('❌ Firebaseが初期化されていません。.envファイルを確認してください。')
}

// Firestore から photoURL を取得する関数
/** @param userId */
export async function getPhotoURL(userId) {
  if (!db) {
    throw new Error('Firebaseが初期化されていません。.envファイルを確認してください。')
  }
  try {
    // Firestore の正しいドキュメント参照を作成
    const docRef = doc(db, `users/${userId}`)

    // ドキュメントを取得
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return data.photoURL || null // photoURL を返す（存在しない場合は null）
    } else {
      console.log('No such document!')
      return null
    }
  } catch (error) {
    console.error('Error getting photo URL: ', error)
    throw error
  }
}

export default {
  onAuthStateChanged(callback) {
    if (!auth) {
      console.error('❌ Firebase Authが初期化されていません。')
      if (callback) callback(null)
      return () => {} // 空のunsubscribe関数を返す
    }
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idToken = await user.getIdToken()
        store.commit('auth/setUser', user)
        store.commit('auth/setIdToken', idToken)
        store.commit('auth/setUserId', user.uid)
      } else {
        store.commit('auth/clearAuthState')
      }
      if (callback) callback(user)
    })
  },

  async login({ email, password }) {
    if (!auth) {
      throw new Error('Firebase Authが初期化されていません。.envファイルを確認してください。')
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  },

  async signup({ email, password, username }) {
    if (!auth) {
      throw new Error('Firebase Authが初期化されていません。.envファイルを確認してください。')
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      await updateProfile(user, { displayName: username })
      return user
    } catch (error) {
      console.error('Sign-up failed:', error)
      throw error
    }
  },

  async logout() {
    if (!auth) {
      console.warn('Firebase Authが初期化されていません。')
      return
    }
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Logout failed:', error)
      throw error
    }
  },

  // 画像URLの更新処理
  async updatePhotoURL(user, photoURL) {
    if (!auth || !db) {
      throw new Error('Firebaseが初期化されていません。.envファイルを確認してください。')
    }
    try {
      // Firebase Authentication のプロフィール情報を更新
      await updateProfile(user, { photoURL })

      // Firestore の参照先を定義
      const docRef = doc(db, `users/${user.uid}`)
      // Firestore に photoURL を保存
      await setDoc(docRef, { photoURL }, { merge: true })

      console.log('User photo URL updated in Firestore and Authentication:', photoURL)
    } catch (error) {
      console.error('Error updating photo URL:', error)
      throw error
    }
  },
}
