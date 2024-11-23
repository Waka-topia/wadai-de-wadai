import { collection, doc, setDoc, getDocs, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

// スタンプをユーザーの stampsReceived に追加する
// export async function addStampToUser(userId, groupId, stampId) {
//   try {
//     const stampData = {
//       groupId,
//       timestamp: serverTimestamp(),
//     };
//     const stampRef = doc(db, `users/${userId}/stampsReceived`, stampId);
//     await setDoc(stampRef, stampData); // サブコレクションにスタンプデータを追加
//     return stampId;
//   } catch (error) {
//     console.error("Error adding stamp: ", error);
//     throw error;
//   }
// }

export async function addStampToUser(userId, groupId, stampId) {
  try {
    const stampRef = doc(db, `users/${userId}/stampsReceived`, stampId);

    // すでに同じ stampId が存在するか確認
    const existingStamp = await getDoc(stampRef);
    if (existingStamp.exists()) {
      return { exists: true }; // 既に存在する場合のフラグを返す
    }

    const stampData = {
      groupId,
      timestamp: serverTimestamp(),
    };
    await setDoc(stampRef, stampData); // サブコレクションにスタンプデータを追加
    return { exists: false, stampId }; // 正常に追加された場合の情報を返す
  } catch (error) {
    console.error("Error adding stamp: ", error);
    throw error;
  }
}

// Firestoreからユーザーのスタンプデータを取得
export async function getUserStamps(userId) {
  try {
    const querySnapshot = await getDocs(collection(db, `users/${userId}/stampsReceived`));
    let stamps = [];
    querySnapshot.forEach((doc) => {
      stamps.push({ id: doc.id, ...doc.data() });
    });
    return stamps;
  } catch (error) {
    throw new Error(`Failed to fetch stamps: ${error.message}`);
  }
}
