// src/services/firestoreService.js
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

// スタンプをFirestoreに追加する関数、スタンプIDは返り値として返す
export async function addStamp(userId, groupId) {
  try {
    const docRef = await addDoc(collection(db, "userStamps"), {
      userId,
      groupId,
      timestamp: serverTimestamp(),
    });
    return docRef.id; // 作成されたスタンプIDを返す
  } catch (error) {
    console.error("Error adding stamp: ", error);
    throw error;
  }
};

// Firestoreからユーザーのスタンプデータを取得
export const getUserStamps = async (userId) => {
  try {
    const querySnapshot = await getDocs(collection(db, "userStamps"));
    let stamps = [];
    querySnapshot.forEach((doc) => {
      if (doc.data().userId === userId) {
        stamps.push({ id: doc.id, ...doc.data() });
      }
    });
    return stamps;
  } catch (error) {
    throw new Error(error.message);
  }
};