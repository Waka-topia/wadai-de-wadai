import { db } from "../firebase/config"; // FirebaseのFirestoreインスタンス
import { doc, setDoc } from "firebase/firestore";

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
