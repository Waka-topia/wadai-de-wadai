import { db } from "../firebase/config"; // FirebaseのFirestoreインスタンス
import { doc, setDoc, getDoc } from "firebase/firestore";

/**
 * 新歓データを Firestore に保存する
 * @param {string} userId ユーザー ID
 * @param {string} groupName 団体名
 * @param {string} nextDate 次に行く日付
 */
export async function saveNextShinkan(userId, groupName, nextDate) {
  try {
    // 正しいドキュメント参照を作成 (サブコレクションを使用)
    const docRef = doc(db, `users/${userId}/NextShinkan`, "details");

    // Firestore にデータを保存
    await setDoc(docRef, {
      groupName,
      nextDate,
    });

    console.log("Next Shinkan successfully saved!");
  } catch (error) {
    console.error("Error saving next Shinkan: ", error);
    throw error;
  }
}

/**
 * ユーザーIDに基づいて次の新歓情報を取得する
 * @param {string} userId ユーザーID
 * @returns {object} 次の新歓データ
 */
export async function getNextShinkan(userId) {
    try {
      // Firestore の正しいドキュメント参照を作成
      const docRef = doc(db, `users/${userId}/NextShinkan`, "details");
  
      // ドキュメントを取得
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        return docSnap.data(); // データを返す
      } else {
        console.log("No such document!");
        return null;
      }
    } catch (error) {
      console.error("Error getting next Shinkan: ", error);
      throw error;
    }
  }
