/**
 * 外部サイトを新しいタブで開く
 *
 * 開いた先のページから window.opener 経由でこのアプリを操作されないよう、noopener を付ける
 *
 * @param {string} url - 開く URL
 */
export const openExternalLink = (url) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}
