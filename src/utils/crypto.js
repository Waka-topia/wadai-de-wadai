/**
 * 文字列を SHA-256 でハッシュ化する (Web Crypto API を使用)
 *
 * @param {string} val ハッシュ化する文字列
 * @returns {Promise<string | null>} ハッシュ化された16進数文字列
 */
export const hashValue = async (val) => {
  if (val === null || val === undefined) {
    return null
  }

  const msgUint8 = new TextEncoder().encode(String(val))
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}
