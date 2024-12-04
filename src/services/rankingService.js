import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase/config"; // FirebaseのFirestoreインスタンス

export default {
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
};
