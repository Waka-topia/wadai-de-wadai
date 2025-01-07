import { getDocs, collection, setDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";
import { getUserStamps } from "../services/stampService"; // ユーザーのスタンプ取得サービス

/**
 * Fetches all titles from the Firestore "titles" collection.
 * @returns {Promise<Array<Object>>} - An array of title data.
 */
export async function getAllTitles() {
  const titlesCollectionRef = collection(db, "titles");
  const querySnapshot = await getDocs(titlesCollectionRef);

  return querySnapshot.docs.map(doc => ({
    id: doc.id, // ドキュメントID
    ...doc.data(), // タイトルデータ
  }));
}

/**
 * Checks if the user can earn a specific title.
 * @param {Array<string>} requiredStamps - The required stamps for the title.
 * @param {Array<string>} userStamps - The stamps the user possesses.
 * @returns {boolean} - Whether the user meets the criteria.
 */
export function canEarnTitle(requiredStamps, userStamps) {
  return requiredStamps.every(stamp => userStamps.includes(stamp));
}

/**
 * Adds a title to the user's list of titles if eligible.
 * @param {string} userID - The ID of the user.
 * @param {string} titleID - The ID of the title.
 * @param {Object} titleData - The data of the title.
 * @returns {Promise<void>} - Resolves when the title is added.
 */
export async function addTitleToUser(userID, titleID, titleData) {
    if (!userID || typeof userID !== "string") {
      throw new Error("Invalid userID");
    }
    if (!titleID || typeof titleID !== "string") {
      throw new Error("Invalid titleID");
    }
  
    const userTitleRef = doc(db, `users/${userID}/titles`, titleID);
  
    try {
      // ユーザーのスタンプを取得し、IDリストを抽出
      const userStamps = (await getUserStamps(userID)).map(stamp => stamp.id);
      console.log("ユーザーが所持するスタンプ（IDのみ）:", userStamps);
  
      // 必要なスタンプを配列として取得
      const requiredStamps = Array.isArray(titleData.requiredStamps)
        ? titleData.requiredStamps
        : [...titleData.requiredStamps]; // Proxy解除
      console.log("必要なスタンプ（配列）:", requiredStamps);
  
      // 各スタンプのマッチ状況を確認
      requiredStamps.forEach(stamp => {
        console.log(
          `スタンプ: ${stamp}, 所持しているか: ${userStamps.includes(stamp)}`
        );
      });
  
      // 条件を満たしている場合
      if (canEarnTitle(requiredStamps, userStamps)) {
        console.log("タイトル取得条件を満たしています。タイトルを追加します。");
  
        await setDoc(userTitleRef, {
          name: titleData.name,
          description: titleData.description,
          earnedAt: new Date().toISOString(),
        });
        // 成功した場合のアラート
        alert(`称号「${titleData.name}」を獲得しました！`);
      } else {
        alert("称号の取得条件を満たしていません。");
        console.error("タイトル取得条件を満たしていません。");
        throw new Error("User does not meet the criteria for this title");
      }
    } catch (error) {
      console.error("タイトルの追加中にエラーが発生しました:", error.message);
      throw error;
    }
  }
  