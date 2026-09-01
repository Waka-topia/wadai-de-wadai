import { findStamp } from '@/data/stamps'

/**
 * QRコードの読み取り結果をスタンプ付与用のペイロードに変換する
 *
 * 想定フォーマットは 2025年4月版と同じ JSON 文字列: {"groupId":"1","stampId":"cir01"} マスターに存在しない stampId
 * は未知のQRコードとして弾く。
 *
 * @param {string | object} rawValue - QRコードから読み取った生の値
 * @returns {{ groupId: string; stampId: string } | null} 不正な場合は null
 */
export const parseStampPayload = (rawValue) => {
  if (!rawValue) return null

  let payload = rawValue

  if (typeof rawValue === 'string') {
    try {
      payload = JSON.parse(rawValue)
    } catch {
      return null
    }
  }

  if (typeof payload !== 'object' || payload === null) return null

  const { groupId, stampId } = payload
  if (!groupId || !stampId) return null
  if (typeof stampId !== 'string') return null
  if (!findStamp(stampId)) return null

  return { groupId: String(groupId), stampId }
}
