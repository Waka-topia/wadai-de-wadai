import { collection, deleteDoc, doc, getDocs, getFirestore, setDoc } from "firebase/firestore";
import { db } from "../firebase/config"; // FirebaseのFirestoreインスタンス

export default {
  // 全ユーザーのランキングを取得
  async getUserRanking() {
    try {
      const snapshot = await getDocs(collection(db, "users"));

      if (snapshot.empty) {
        console.warn("No users found in Firestore.");
        return [];
      }

      // ユーザーの基本情報を取得
      const userPromises = snapshot.docs.map(async (docSnapshot) => {
        const userId = docSnapshot.id;

        const userData = docSnapshot.data();
        const displayName = userData.displayName || "不明なユーザー";

        const stampsCollectionRef = collection(db, `users/${userId}/stampsReceived`);
        const stampsSnapshot = await getDocs(stampsCollectionRef);
        const count = stampsSnapshot.size;

        return { userId, displayName, count };
      });

      // 並列で全てのユーザー情報を取得
      const rankings = await Promise.all(userPromises);
      console.log("Rankings:", rankings);

      // スタンプ数の降順でソート
      return rankings.sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error("Error fetching rankings:", error);
      throw error;
    }
  },

  // 自分のユーザーIDに合致する順位とスタンプ数を取得
  async getMyRanking(userId) {
    try {
      // 全ユーザーのランキングを取得
      const rankings = await this.getUserRanking();

      // 自分のランキングを取得
      const rank = rankings.findIndex((ranking) => ranking.userId === userId);

      if (rank === -1) {
        throw new Error("Ranking not found for this user");
      }

      // 順位とユーザー情報を返す
      return { ...rankings[rank], rank: rank + 1 };
    } catch (error) {
      console.error("Error fetching my ranking:", error);
      throw error;
    }
  },
  async updateTop100() {
    const db = getFirestore();

    // `users`コレクションのすべてのユーザーを取得
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    // ユーザーごとのスタンプ数と次の新歓情報を計算
    const userStats = [];
    for (const user of snapshot.docs) {
      const userId = user.id;
      const userData = user.data();

      // `stampsReceived` 子コレクションのドキュメント数を取得
      const stampRef = collection(db, `users/${userId}/stampsReceived`);
      const stampSnapshot = await getDocs(stampRef);

      // `NextShinkan` 子コレクションから `details` ドキュメントを取得
      const nextShinkanRef = collection(db, `users/${userId}/NextShinkan`);
      const nextShinkanSnapshot = await getDocs(nextShinkanRef);

      let nextShinkanDetails = null;
      if (!nextShinkanSnapshot.empty) {
        // 最初のドキュメントのみを取得（想定）
        const detailsDoc = nextShinkanSnapshot.docs[0];
        const detailsData = detailsDoc.data();
        nextShinkanDetails = {
          groupName: detailsData.groupName || null,
          nextDate: detailsData.nextDate || null,
        };
      }

      const photoURL = userData.photoURL || 'userIcon/defaultIcon.png';  // デフォルトのURLを設定

      userStats.push({
        userId,
        displayName: userData.displayName,
        photoURL,// デフォルト値もしくは実際のURLを設定
        stampCount: stampSnapshot.size,
        nextShinkan: nextShinkanDetails, // 次の新歓情報を追加
      });
    }

    // スタンプ数で降順ソート
    userStats.sort((a, b) => b.stampCount - a.stampCount);

    // 上位100人を`top100`コレクションに保存
    const top100Ref = collection(db, "top100");

    // 更新前に`top100`コレクションをクリア
    const top100Snapshot = await getDocs(top100Ref);
    for (const topDoc of top100Snapshot.docs) {
      await deleteDoc(topDoc.ref); // `deleteDoc` を使用して削除
    }

    // 上位100人を保存
    for (let i = 0; i < Math.min(100, userStats.length); i++) {
      const user = userStats[i];
      const documentId = String(i + 1); // ドキュメントIDを1〜100に設定
      await setDoc(doc(top100Ref, documentId), {
        rank: i + 1,
        userId: user.userId,
        displayName: user.displayName,
        photoURL: user.photoURL,
        stampCount: user.stampCount,
        nextShinkan: user.nextShinkan, // 次の新歓情報を保存
        documentId: documentId, // ドキュメントIDをフィールドに格納
        lastUpdated: new Date(),
      });
    }
    console.log("ランキングが更新されました！");
  },


  /**
   * Firestoreからランキングデータ（top100）を取得する関数
   * @returns {Promise<Array>} ランキングデータの配列
   */
    async fetchTop100() {
    const db = getFirestore();
    const top100Ref = collection(db, "top100");

    const snapshot = await getDocs(top100Ref);
    const ranking = snapshot.docs.map(doc => doc.data());

    return ranking;
  }
};
