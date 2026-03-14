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

/**
 * Firestore から photoURL を取得する関数
 *
 * @param {string} userId - ユーザーID
 * @returns {Promise<string | null>} PhotoURL（存在しない場合は null）
 */
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
  /**
   * 認証状態の変更を監視する
   *
   * @param {function(object|null): void} [callback] - 状態変更時に呼び出されるコールバック関数
   * @returns {function(): void} 監視を解除するための unsubscribe 関数
   */
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

  /**
   * ログイン処理
   *
   * @param {object} params - ログイン情報
   * @param {string} params.email - メールアドレス
   * @param {string} params.password - パスワード
   * @returns {Promise<object>} ログインしたユーザー情報 (User)
   */
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

  /**
   * ユーザーの新規登録（サインアップ）処理
   *
   * @param {object} params - 登録情報
   * @param {string} params.email - メールアドレス
   * @param {string} params.password - パスワード
   * @param {string} params.username - ユーザー名 (displayName)
   * @returns {Promise<object>} 登録されたユーザー情報 (User)
   */
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

  /**
   * ログアウト処理
   *
   * @returns {Promise<void>}
   */
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

  /**
   * 画像URLの更新処理 (Authentication と Firestore の両方を更新)
   *
   * @param {object} user - Firebase Authentication のユーザーオブジェクト
   * @param {string} photoURL - 新しい画像のURL
   * @returns {Promise<void>}
   */
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
