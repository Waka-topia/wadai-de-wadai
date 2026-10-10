import { onMounted, ref } from 'vue'
import { adminUserId } from '@/config/constants'
import { hashValue } from '@/utils/crypto'

// 運営 ID のハッシュは変わらないので、最初の 1 回だけ計算して使い回す
let adminHashPromise = null

/**
 * 運営による代理登録イベントかどうかを判定するコンポーザブル
 *
 * @returns {{ isProxyEvent: (event: object | null | undefined) => boolean }} イベントの作成者が運営かどうかを返す関数
 */
export const useProxyEvent = () => {
  const hashedAdminId = ref('')

  onMounted(async () => {
    adminHashPromise ??= hashValue(adminUserId)
    hashedAdminId.value = await adminHashPromise
  })

  /**
   * イベントが運営による代理登録かどうかを判定する
   *
   * @param {object | null | undefined} event - イベントデータ
   * @returns {boolean} 運営の代理登録なら true
   */
  const isProxyEvent = (event) => !!hashedAdminId.value && event?.createdBy === hashedAdminId.value

  return { isProxyEvent }
}
