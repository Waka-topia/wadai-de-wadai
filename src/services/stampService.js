import { collection, doc, setDoc, getDocs, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export async function addStampToUser(userId, displayName, groupId, stampId) {
  try {
    const stampRef = doc(db, `users/${userId}/stampsReceived`, stampId);

    // すでに同じ stampId が存在するか確認
    const existingStamp = await getDoc(stampRef);
    if (existingStamp.exists()) {
      return { exists: true }; // 既に存在する場合のフラグを返す
    }

    // stampsReceived サブコレクションにスタンプデータを追加
    const stampData = {
      groupId,
      timestamp: serverTimestamp(),
    };
    await setDoc(stampRef, stampData);

    // ユーザードキュメントに displayName を保存
    const userRef = doc(db, `users/${userId}`);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      // ユーザードキュメントが存在しない場合は作成
      await setDoc(userRef, { displayName });
    } else {
      // 既存のユーザードキュメントがある場合は更新
      await updateDoc(userRef, { displayName });
    }

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

export async function getUserStampImages(userId) {
  try {
    // ユーザーの stampsReceived コレクションを取得
    const userStampsSnapshot = await getDocs(collection(db, `users/${userId}/stampsReceived`));
    const userStamps = userStampsSnapshot.docs.map((doc) => doc.id); // stampId のリスト

    // stamps コレクションから該当するスタンプのデータを取得
    const stampImages = [];
    for (const stampId of userStamps) {
      const stampDoc = await getDoc(doc(db, "stamps", stampId));
      if (stampDoc.exists()) {
        stampImages.push({
          stampId,
          ...stampDoc.data(), // imageUrl, name, description などを展開
        });
      }
    }
    return stampImages;
  } catch (error) {
    console.error("Error fetching user stamp images: ", error);
    throw error;
  }
}
