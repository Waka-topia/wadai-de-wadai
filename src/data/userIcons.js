import defaultIcon from '@/assets/userIcon/defaultIcon.png'
import userIcon1 from '@/assets/userIcon/userIcon1.png'
import userIcon2 from '@/assets/userIcon/userIcon2.png'
import userIcon3 from '@/assets/userIcon/userIcon3.png'
import userIcon4 from '@/assets/userIcon/userIcon4.png'
import userIcon5 from '@/assets/userIcon/userIcon5.png'
import userIcon6 from '@/assets/userIcon/userIcon6.png'
import userIcon7 from '@/assets/userIcon/userIcon7.png'
import userIcon8 from '@/assets/userIcon/userIcon8.png'

/**
 * 選択できるユーザーアイコンの一覧
 *
 * Firestore には id（例: userIcon3）だけを保存し、実際の画像URLはここで解決する。 パスを文字列で保存するとビルド後にハッシュ付きのファイル名と一致しなくなるため。
 */
export const userIcons = [
  { id: 'userIcon1', src: userIcon1 },
  { id: 'userIcon2', src: userIcon2 },
  { id: 'userIcon3', src: userIcon3 },
  { id: 'userIcon4', src: userIcon4 },
  { id: 'userIcon5', src: userIcon5 },
  { id: 'userIcon6', src: userIcon6 },
  { id: 'userIcon7', src: userIcon7 },
  { id: 'userIcon8', src: userIcon8 },
]

const iconMap = new Map(userIcons.map((icon) => [icon.id, icon.src]))

/** 未設定・未知のIDのときに使うアイコン */
export const defaultUserIcon = defaultIcon

/**
 * アイコンIDから画像URLを解決する
 *
 * @param {string} [iconId] - アイコンID（例: userIcon3）
 * @returns {string} 画像URL。未設定・未知のIDのときは既定のアイコン
 */
export const resolveUserIcon = (iconId) => iconMap.get(iconId) ?? defaultIcon
