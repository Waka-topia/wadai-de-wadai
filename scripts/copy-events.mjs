/**
 * 本番(wadai-de-wadai)の新歓イベントを復刻版(wadai-de-wadai-v1)へコピーする一度きりの移行スクリプト
 *
 * 本番へは読み取りしか行わない。書き込み先は復刻版プロジェクトのみ。
 *
 * 使い方: REVIVAL_EMAIL=<復刻版のアカウント> REVIVAL_PASSWORD=<パスワード> node scripts/copy-events.mjs
 *
 * 認証情報は環境変数からのみ読む。Firestore のルールで events_monthly_hashed への書き込みにログインが必要なため。
 */
import { readFileSync } from 'node:fs'
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getFirestore, setDoc } from 'firebase/firestore'

/** コピー対象の月。復刻対象である2025年の新歓シーズンのみ */
const targetMonths = ['2025-04', '2025-05']

/**
 * .env 形式のファイルを読み込む
 *
 * @param {string} path - ファイルパス
 * @returns {Record<string, string>} キーと値の組
 */
const readEnvFile = (path) =>
  Object.fromEntries(
    readFileSync(path, 'utf8')
      .split('\n')
      .filter((line) => line.trim() && !line.startsWith('#'))
      .map((line) => {
        const index = line.indexOf('=')
        return [line.slice(0, index).trim(), line.slice(index + 1).trim()]
      }),
  )

/**
 * Firestore REST の値表現をそのままの値へ変換する
 *
 * @param {object} value - REST が返す値
 * @returns {any} 変換後の値
 */
const fromRestValue = (value) => {
  if ('nullValue' in value) return null
  if ('stringValue' in value) return value.stringValue
  if ('booleanValue' in value) return value.booleanValue
  if ('integerValue' in value) return Number(value.integerValue)
  if ('doubleValue' in value) return Number(value.doubleValue)
  if ('timestampValue' in value) return new Date(value.timestampValue)
  if ('arrayValue' in value) return (value.arrayValue.values ?? []).map(fromRestValue)
  if ('mapValue' in value) return fromRestFields(value.mapValue.fields ?? {})
  throw new Error(`未対応の型です: ${Object.keys(value).join(',')}`)
}

/**
 * Firestore REST の fields をそのままのオブジェクトへ変換する
 *
 * @param {object} fields - REST が返す fields
 * @returns {object} 変換後のオブジェクト
 */
const fromRestFields = (fields) =>
  Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, fromRestValue(value)]))

/**
 * 本番から1ヶ月分のイベントを読み取る
 *
 * Events_monthly_hashed は本番のルールでも公開読み取りが許可されているため、 サービスアカウントを使わずに取得できる。
 *
 * @param {object} params - 接続情報
 * @param {string} params.projectId - 本番のプロジェクトID
 * @param {string} params.apiKey - 本番のAPIキー
 * @param {string} params.monthKey - 対象の月（例: 2025-04）
 * @returns {Promise<object[]>} イベントの配列
 */
const fetchMonthlyEvents = async ({ projectId, apiKey, monthKey }) => {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/events_monthly_hashed/${monthKey}?key=${apiKey}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`${monthKey} の取得に失敗しました (HTTP ${response.status})`)
  }

  const body = await response.json()
  return fromRestFields(body.fields ?? {}).events ?? []
}

const main = async () => {
  const email = process.env.REVIVAL_EMAIL
  const password = process.env.REVIVAL_PASSWORD

  if (!email || !password) {
    throw new Error('REVIVAL_EMAIL と REVIVAL_PASSWORD を環境変数で指定してください')
  }

  const prodEnv = readEnvFile('.env.production')
  const revivalEnv = readEnvFile('.env.revival')

  const app = initializeApp({
    apiKey: revivalEnv.VITE_API_KEY,
    authDomain: revivalEnv.VITE_AUTH_DOMAIN,
    projectId: revivalEnv.VITE_PROJECT_ID,
    storageBucket: revivalEnv.VITE_STORAGE_BUCKET,
    messagingSenderId: revivalEnv.VITE_MESSAGING_SENDER_ID,
    appId: revivalEnv.VITE_APP_ID,
  })

  await signInWithEmailAndPassword(getAuth(app), email, password)
  console.log(`ログインしました（コピー先: ${revivalEnv.VITE_PROJECT_ID}）`)

  const db = getFirestore(app)

  for (const monthKey of targetMonths) {
    const events = await fetchMonthlyEvents({
      projectId: prodEnv.VITE_PROJECT_ID,
      apiKey: prodEnv.VITE_API_KEY,
      monthKey,
    })

    await setDoc(doc(db, 'events_monthly_hashed', monthKey), { events })
    console.log(`${monthKey}: ${events.length} 件をコピーしました`)
  }

  console.log('完了しました')
  process.exit(0)
}

main().catch((error) => {
  console.error('コピーに失敗しました:', error.message)
  process.exit(1)
})
