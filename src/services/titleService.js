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
 * Checks if the user can earn a specific title based on the new criteria.
 * @param {Object} titleData - The title data containing required stamps and required number.
 * @param {Array<string>} userStamps - The stamps the user possesses.
 * @returns {boolean} - Whether the user meets the criteria.
 */
export function canEarnTitle(titleData, userStamps) {
  const { requiredStamps, requiredStampsNumber } = titleData;

  if (!Array.isArray(requiredStamps) || typeof requiredStampsNumber !== "number") {
    console.error("Invalid title data format.");
    return false;
  }

  // ユーザーが持っているスタンプの中で、称号の対象リストにあるものを数える
  const matchingStampsCount = userStamps.filter(stamp => requiredStamps.includes(stamp)).length;

  // 必要なスタンプ数以上持っていれば称号獲得
  return matchingStampsCount >= requiredStampsNumber;
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

    // 条件を満たしている場合
    if (canEarnTitle(titleData, userStamps)) {
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

export async function getUserTitles(userID) {
  if (!userID || typeof userID !== "string") {
    throw new Error("Invalid userID");
  }

  const userTitlesCollectionRef = collection(db, `users/${userID}/titles`);
  try {
    const querySnapshot = await getDocs(userTitlesCollectionRef);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("ユーザーの称号取得中にエラーが発生しました:", error);
    throw error;
  }
}