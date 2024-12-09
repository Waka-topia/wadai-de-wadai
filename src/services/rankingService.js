import { collection, getDocs } from "firebase/firestore";
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

      const rankings = [];
      for (const docSnapshot of snapshot.docs) {
        const userId = docSnapshot.id; // ユーザーID
        const userData = docSnapshot.data(); // ユーザーデータ
        const displayName = userData.displayName || "不明なユーザー";

        const stampsCollectionRef = collection(db, `users/${userId}/stampsReceived`);
        const stampsSnapshot = await getDocs(stampsCollectionRef);
        const count = stampsSnapshot.size; // スタンプ数をカウント

        rankings.push({ userId, displayName, count });
      }

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
      const myRanking = rankings.find((ranking) => ranking.userId === userId);
      
      if (!myRanking) {
        throw new Error("Ranking not found for this user");
      }

      // 順位を計算
      const rank = rankings.indexOf(myRanking) + 1; // インデックスに1を足して順位を計算

      // ユーザーID, 順位, スタンプ数を返す
      return { ...myRanking, rank };
    } catch (error) {
      console.error("Error fetching my ranking:", error);
      throw error;
    }
  },
};
