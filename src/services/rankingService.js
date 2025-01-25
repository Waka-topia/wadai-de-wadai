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
};
