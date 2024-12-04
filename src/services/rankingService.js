import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config"; // FirebaseのFirestoreインスタンス

export default {
    async getUserRanking() {
      try {
        const snapshot = await getDocs(collection(db, 'users'));
        
        // Firestoreのデータを確認
        console.log("Snapshot docs:", snapshot.docs);
        
        if (snapshot.empty) {
          console.warn("No users found in Firestore.");
          return [];
        }
  
        const rankings = [];
        for (const doc of snapshot.docs) {
          const userId = doc.id; // ユーザーID
          const stampsCollectionRef = collection(db, `users/${userId}/stampsReceived`);
          const stampsSnapshot = await getDocs(stampsCollectionRef);
          const count = stampsSnapshot.size; // ドキュメント数をカウント
          rankings.push({ userId, count });
        }
  
        // スタンプ数の降順でソート
        return rankings.sort((a, b) => b.count - a.count);
      } catch (error) {
        console.error("Error fetching rankings:", error);
        throw error;
      }
    },
  };
  