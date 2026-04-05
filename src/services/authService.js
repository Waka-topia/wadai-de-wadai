import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase/config'
import store from '@/store'

/**
 * パスワードリセットメールを送信する
 *
 * @param {string} email - 送信先メールアドレス
 * @returns {Promise<void>}
 */
export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    switch (error.code) {
      case 'auth/user-not-found':
        error.message = 'このメールアドレスのアカウントが見つかりません。'
        break
      case 'auth/invalid-email':
        error.message = 'メールアドレスの形式が正しくありません。'
        break
      case 'auth/network-request-failed':
        error.message = 'ネットワークエラーが発生しました。接続を確認してください。'
        break
    }
    throw error
  }
}

/**
 * パスワードリセットを確定する
 *
 * @param {string} oobCode - メールリンクに含まれるアクションコード
 * @param {string} newPassword - 新しいパスワード
 * @returns {Promise<void>}
 */
export const resetPassword = async (oobCode, newPassword) => {
  try {
    await confirmPasswordReset(auth, oobCode, newPassword)
  } catch (error) {
    switch (error.code) {
      case 'auth/expired-action-code':
        error.message = 'リセットリンクの有効期限が切れています。再度お試しください。'
        break
      case 'auth/invalid-action-code':
        error.message = '無効なリセットリンクです。再度お試しください。'
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
   * @param {string} params.userName - ユーザー名 (displayName)
   * @returns {Promise<object>} 登録されたユーザー情報 (User)
   */
  async signup({ email, password, userName }) {
    try {
      // Firebase Authentication でユーザーを作成
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      await updateProfile(user, { displayName: userName })

      // Firestore にユーザードキュメントを作成
      await setDoc(doc(db, 'users', user.uid), {
        email,
        displayName: userName,
        isOfficial: false,
        isProvePending: false,
        proveOwnerApplication: null,
        belongingOrgs: [],
      })
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
      throw new Error(`ログアウトに失敗しました。${error.message}`)
    }
  },

  async deleteAccount() {
    try {
      const currentUser = auth.currentUser
      if (!currentUser) throw new Error('ユーザーがログインしていません。')

      await deleteUser(currentUser)
      await deleteDoc(doc(db, 'users', currentUser.uid))
    } catch (error) {
      switch (error.code) {
        case 'auth/requires-recent-login':
          error.message =
            'アカウントの削除には最近のログインが必要です。再度ログインしてからお試しください。'
          break
        case 'auth/network-request-failed':
          error.message = 'ネットワークエラーが発生しました。接続を確認してください。'
          break
      }
      throw new Error(`アカウントの削除に失敗しました。${error.message}`)
    }
  },

  async saveUserOrgs(userId, orgs) {
    try {
      const userRef = doc(db, 'users', userId)
      await setDoc(userRef, { belongingOrgs: orgs }, { merge: true })
    } catch (error) {
      console.error('Error saving user organizations:', error)
      throw error
    }
  },

  async fetchUserOrgs(userId) {
    try {
      const userRef = doc(db, 'users', userId)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        const data = userSnap.data()
        return data.belongingOrgs || []
      } else {
        console.log('No such document!')
        return []
      }
    } catch (error) {
      console.error('Error fetching user organizations:', error)
      throw error
    }
  },
}
