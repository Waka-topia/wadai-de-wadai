/**
 * 講義名の前処理・正規化ユーティリティ
 *
 * 目的: Gemini API や Embeddings による名寄せの前に、 ルールで機械的に解決できる表記ゆれを吸収する。
 *
 * 処理順序:
 *
 * 1. 全角英数字 → 半角英数字
 * 2. ローマ数字 (Ⅰ〜Ⅹ) → アラビア数字 (1〜10)
 * 3. 全角スペース → 半角スペース
 * 4. 連続スペースの圧縮 / 前後トリム
 * 5. ひらがな → カタカナ (任意オプション)
 */

/**
 * 全角英数字 → 半角英数字
 *
 * @param {string} str - 変換対象の文字列
 * @returns {string} 変換後の文字列
 */
const toHalfWidth = (str) =>
  str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))

/** ローマ数字 (全角) → アラビア数字 */
const ROMAN_MAP = {
  Ⅰ: '1',
  Ⅱ: '2',
  Ⅲ: '3',
  Ⅳ: '4',
  Ⅴ: '5',
  Ⅵ: '6',
  Ⅶ: '7',
  Ⅷ: '8',
  Ⅸ: '9',
  Ⅹ: '10',
  // 半角ローマ数字の代替表記も吸収
  I: '1',
  II: '2',
  III: '3',
  IV: '4',
  VI: '6',
  VII: '7',
  VIII: '8',
  IX: '9',
}

const replaceRoman = (str) => str.replace(/Ⅰ|Ⅱ|Ⅲ|Ⅳ|Ⅴ|Ⅵ|Ⅶ|Ⅷ|Ⅸ|Ⅹ/g, (c) => ROMAN_MAP[c] || c)

/**
 * ひらがな → カタカナ
 *
 * @param {string} str - 変換対象の文字列
 * @returns {string} 変換後の文字列
 */
const toKatakana = (str) =>
  str.replace(/[\u3041-\u3096]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60))

/**
 * 講義名を正規化する
 *
 * @param {string} name - 元の講義名
 * @param {{ katakana?: boolean }} options
 * @returns {string} 正規化された講義名
 */
export const normalizeLectureName = (name, options = {}) => {
  if (!name) return ''

  let n = name
  n = toHalfWidth(n)
  n = replaceRoman(n)
  n = n.replace(/\u3000/g, ' ') // 全角スペース → 半角
  n = n.replace(/\s+/g, ' ') // 連続スペース圧縮
  n = n.trim()

  if (options.katakana) {
    n = toKatakana(n)
  }

  return n
}

/**
 * 2つの講義名の「単純類似度」をスコアで返す (0.0〜1.0) ルールベースで機械的に判定できる範囲のみ。 より高度な判定は Gemini API に委ねる。
 *
 * @param {string} a - 講義名A
 * @param {string} b - 講義名B
 * @returns {number} 類似度スコア (1.0 = 完全一致)
 */
export const calcSimilarityScore = (a, b) => {
  const na = normalizeLectureName(a, { katakana: true })
  const nb = normalizeLectureName(b, { katakana: true })

  if (na === nb) return 1.0

  // レーベンシュタイン距離 (簡易実装)
  const dist = levenshtein(na, nb)
  const maxLen = Math.max(na.length, nb.length)
  if (maxLen === 0) return 1.0

  // 距離が短いほど高スコア
  return Math.max(0, 1 - dist / maxLen)
}

/**
 * レーベンシュタイン距離
 *
 * @param {string} a - 比較対象の文字列A
 * @param {string} b - 比較対象の文字列B
 * @returns {number} 編集距離
 */
const levenshtein = (a, b) => {
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  )

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

/**
 * スコアから名寄せの判定を行う
 *
 * @param {number} score - CalcSimilarityScore の結果
 * @returns {'same' | 'maybe' | 'different'} 判定結果
 */
export const classifyScore = (score) => {
  if (score >= 0.92) return 'same' // ほぼ確実に同一 → 自動統合OK
  if (score >= 0.7) return 'maybe' // 微妙 → Gemini API に判定を委ねる
  return 'different' // 明らかに別の授業
}
