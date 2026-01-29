import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase/config'
import store from '@/store'

// Firestore から photoURL を取得する関数
/** @param userId */
export async function getPhotoURL(userId) {
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
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error) {
      switch (error.code) {
        case 'auth/invalid-email':
          error.message = 'メールアドレスの形式が正しくありません。'
          break
        case 'auth/invalid-credentials':
          error.message = 'メールアドレスまたはパスワードが正しくありません。'
          break
        case 'auth/network-request-failed':
          error.message = 'ネットワークエラーが発生しました。接続を確認してください。'
          break
      }
      throw error
    }
  },

  async signup({ email, password, username }) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      await updateProfile(user, { displayName: username })
      return user
    } catch (error) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          error.message =
            'このメールアドレスは既に使用されています。別のメールアドレスを使用してください。'
          break
        case 'auth/invalid-email':
          error.message = 'メールアドレスの形式が正しくありません。'
          break
        case 'auth/weak-password':
          error.message = 'パスワードが弱すぎます。8文字以上の強力なパスワードを使用してください。'
          break
        case 'auth/network-request-failed':
          error.message = 'ネットワークエラーが発生しました。接続を確認してください。'
          break
      }
      throw error
    }
  },

  async logout() {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Logout failed:', error)
      switch (error.code) {
        case 'auth/network-request-failed':
          error.message = 'ネットワークエラーが発生しました。接続を確認してください。'
          break
      }
      throw error
    }
  },

  // 画像URLの更新処理
  async updatePhotoURL(user, photoURL) {
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
