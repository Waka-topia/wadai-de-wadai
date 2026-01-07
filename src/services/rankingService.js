import { collection, deleteDoc, doc, getDocs, getFirestore, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config' // FirebaseのFirestoreインスタンス

export default {
  // 全ユーザーのランキングを取得
  async getUserRanking() {
    try {
      const snapshot = await getDocs(collection(db, 'users'))

      if (snapshot.empty) {
        console.warn('No users found in Firestore.')
        return []
      }

      // ユーザーの基本情報を取得
      const userPromises = snapshot.docs.map(async (docSnapshot) => {
        const userId = docSnapshot.id

        const userData = docSnapshot.data()
        const displayName = userData.displayName || '不明なユーザー'

        const stampsCollectionRef = collection(db, `users/${userId}/stampsReceived`)
        const stampsSnapshot = await getDocs(stampsCollectionRef)
        const count = stampsSnapshot.size

        return { userId, displayName, count }
      })

      // 並列で全てのユーザー情報を取得
      const rankings = await Promise.all(userPromises)
      console.log('Rankings:', rankings)

      // スタンプ数の降順でソート
      return rankings.sort((a, b) => b.count - a.count)
    } catch (error) {
      console.error('Error fetching rankings:', error)
      throw error
    }
  },

  // 自分のユーザーIDに合致する順位とスタンプ数を取得
  async getMyRanking(userId) {
    try {
      // 全ユーザーのランキングを取得
      const rankings = await this.getUserRanking()

      // 自分のランキングを取得
      const rank = rankings.findIndex((ranking) => ranking.userId === userId)

      if (rank === -1) {
        throw new Error('Ranking not found for this user')
      }

      // 順位とユーザー情報を返す
      return { ...rankings[rank], rank: rank + 1 }
    } catch (error) {
      console.error('Error fetching my ranking:', error)
      throw error
    }
  },
  async updateTop100() {
    const db = getFirestore()

    try {
      // `users`コレクションのすべてのユーザーを取得
      const usersRef = collection(db, 'users')
      const snapshot = await getDocs(usersRef)

      // ユーザーごとのスタンプ数と次の新歓情報を計算
      const userStats = []
      for (const user of snapshot.docs) {
        const userId = user.id
        const userData = user.data()

        // `stampsReceived` 子コレクションのドキュメント数を取得
        const stampRef = collection(db, `users/${userId}/stampsReceived`)
        const stampSnapshot = await getDocs(stampRef)

        // stampsReceivedコレクションが存在しない（空）ユーザーはスキップ
        if (stampSnapshot.empty) {
          console.log(`ユーザー ${userId} はスタンプを持っていないためスキップします`)
          continue
        }

        // `NextShinkan` 子コレクションから `details` ドキュメントを取得
        const nextShinkanRef = collection(db, `users/${userId}/NextShinkan`)
        const nextShinkanSnapshot = await getDocs(nextShinkanRef)

        let nextShinkanDetails = null
        if (!nextShinkanSnapshot.empty) {
          // 最初のドキュメントのみを取得（想定）
          const detailsDoc = nextShinkanSnapshot.docs[0]
          const detailsData = detailsDoc.data()
          nextShinkanDetails = {
            groupName: detailsData.groupName || null,
            nextDate: detailsData.nextDate || null,
          }
        }

        // displayNameが存在しない場合はデフォルト値を設定
        const displayName = userData.displayName || '名前なし'
        const photoURL = userData.photoURL || 'userIcon/defaultIcon.png'

        userStats.push({
          userId,
          displayName,
          photoURL,
          stampCount: stampSnapshot.size,
          nextShinkan: nextShinkanDetails,
        })
      }

      // スタンプ数で降順ソート
      userStats.sort((a, b) => b.stampCount - a.stampCount)

      // ランキング対象となったユーザー数をログ出力
      console.log(`ランキング対象ユーザー数: ${userStats.length}人`)

      // 更新前に`top100`コレクションをクリア
      const top100Ref = collection(db, 'top100')
      const top100Snapshot = await getDocs(top100Ref)
      const deletePromises = top100Snapshot.docs.map((topDoc) => deleteDoc(topDoc.ref))
      await Promise.all(deletePromises) // 並列で削除処理を実行

      // 上位100人を保存
      const savePromises = []
      for (let i = 0; i < Math.min(100, userStats.length); i++) {
        const user = userStats[i]
        const documentId = String(i + 1).padStart(3, '0')

        // null/undefinedチェックを全フィールドに適用
        const docData = {
          rank: i + 1,
          userId: user.userId || '',
          displayName: user.displayName || '名前なし',
          photoURL: user.photoURL || 'userIcon/defaultIcon.png',
          stampCount: user.stampCount || 0,
          nextShinkan: user.nextShinkan || null,
          documentId: documentId,
          lastUpdated: new Date(),
        }

        savePromises.push(setDoc(doc(top100Ref, documentId), docData))
      }

      await Promise.all(savePromises) // 並列で保存処理を実行
      console.log('ランキングが更新されました！')
    } catch (error) {
      console.error('ランキング更新中にエラーが発生しました:', error)

      // エラーが特定のドキュメントに関連するものか確認
      if (error.message && error.message.includes('in document top100/')) {
        const docIdMatch = error.message.match(/in document top100\/(\d+)/)
        if (docIdMatch && docIdMatch[1]) {
          console.error(`問題のあるドキュメントID: ${docIdMatch[1]}`)
        }
      }

      throw error // エラーを上位に伝播
    }
  },

  /**
   * Firestoreからランキングデータ（top100）を取得する関数
   *
   * @returns {Promise<Array>} ランキングデータの配列
   */
  async fetchTop100() {
    const db = getFirestore()
    const top100Ref = collection(db, 'top100')

    const snapshot = await getDocs(top100Ref)
    const ranking = snapshot.docs.map((doc) => doc.data())

    return ranking
  },
}