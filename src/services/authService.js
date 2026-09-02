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

/**
 * ユーザードキュメントが無ければ作成する
 *
 * サインアップの途中で失敗した場合に Auth 側だけユーザーが残ることがあるため、 認証状態が確定するたびに補完する。描画をブロックしないよう await せずに呼び、
 * 完了後にストアのユーザー情報を取り直す。
 *
 * @param {object} user - Firebase Auth のユーザー
 * @returns {Promise<void>}
 */
const ensureUserDocument = async (user) => {
  try {
    const userRef = doc(db, 'users', user.uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName,
        isOfficial: false,
        isProvePending: false,
        proveOwnerApplication: null,
        belongingOrgs: [],
      })
    }

    // 補完前に読み込まれた既定値（Unknown 等）を実データで置き換える
    await store.dispatch('users/refreshCurrentUserData', user.uid)
  } catch (error) {
    console.error('Failed to ensure user document:', error)
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
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        store.commit('auth/setUser', user)
        store.commit('auth/setUserId', user.uid)

        // Firestore への往復を待つと初回起動が真っ白なまま数十秒止まるため、
        // トークン取得とユーザードキュメントの補完は描画をブロックしない形で行う
        void user.getIdToken().then((idToken) => {
          store.commit('auth/setIdToken', idToken)
        })
        void ensureUserDocument(user)
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

      // 表示名の更新と Firestore への登録は互いに依存しないため並列で行う
      await Promise.all([
        updateProfile(user, { displayName: userName }),
        setDoc(doc(db, 'users', user.uid), {
          email,
          displayName: userName,
          isOfficial: false,
          isProvePending: false,
          proveOwnerApplication: null,
          belongingOrgs: [],
        }),
      ])

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

      // Auth ユーザーを消すと認証が切れて Firestore の削除が拒否されるため、先に Firestore を消す。
      // rankingEntries を残すとランキングに退会済みユーザーが並び続ける。
      await deleteDoc(doc(db, 'users', currentUser.uid))
      await deleteDoc(doc(db, 'rankingEntries', currentUser.uid))
      await deleteUser(currentUser)
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
        return []
      }
    } catch (error) {
      console.error('Error fetching user organizations:', error)
      throw error
    }
  },
}
