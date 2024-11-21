// src/services/firestoreService.js
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

// スタンプデータをFirestoreに追加
export const addStamp = async (userId, stampData) => {
  try {
    const docRef = await addDoc(collection(db, "stamps"), {
      userId,
      ...stampData,
    });
    return docRef.id;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Firestoreからスタンプデータを取得
export const getStamps = async (userId) => {
  try {
    const querySnapshot = await getDocs(collection(db, "stamps"));
    let stamps = [];
    querySnapshot.forEach((doc) => {
      if (doc.data().userId === userId) {
        stamps.push(doc.data());
      }
    });
    return stamps;
  } catch (error) {
    throw new Error(error.message);
  }
};
