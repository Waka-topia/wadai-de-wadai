import { markRaw, onMounted, onUnmounted, shallowRef } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// MapTiler API Documentation: https://docs.maptiler.com/maplibre-gl-js/
const apiKey = import.meta.env.VITE_MAPTILER_API_KEY

/**
 * MapTiler の地図をマウント時に作成し、アンマウント時に破棄するコンポーザブル
 *
 * @param {import('vue').Ref<HTMLElement | null>} containerRef - 地図を描画する要素
 * @param {object} options - Maplibregl.Map に渡す追加オプション（center・zoom など）
 * @param {(map: maplibregl.Map) => void} [onCreated] - 地図の作成直後に呼ぶ処理（コントロールの追加など）
 * @returns {import('vue').ShallowRef<maplibregl.Map | null>} 作成した地図（API キーが無いときは null）
 */
export const useMapLibre = (containerRef, options, onCreated) => {
  const map = shallowRef(null)

  onMounted(() => {
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      console.error('MapTiler API Key is not set. Please add VITE_MAPTILER_API_KEY to .env file.')
      return
    }

    map.value = markRaw(
      new maplibregl.Map({
        container: containerRef.value,
        // MapTiler Basic Style（他に 'streets-v2', 'outdoor-v2', 'satellite-v2' など）
        style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${apiKey}`,
        // 帰属表示は各地図で必要に応じて compact モードで追加する
        attributionControl: false,
        ...options,
      }),
    )
    onCreated?.(map.value)
  })

  onUnmounted(() => {
    if (map.value) {
      map.value.remove()
      map.value = null
    }
  })

  return map
}
