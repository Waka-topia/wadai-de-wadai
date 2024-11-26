  <template>
    <div id="map-container"></div>
  </template>
  
  <script>
  import mapboxgl from "mapbox-gl";
  import "mapbox-gl/dist/mapbox-gl.css"; // Mapbox CSS をインポート
  
  export default {
    name: "MapComponent",
    data() {
      return {
        map: null,
      };
    },
    mounted() {
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  
      this.map = new mapboxgl.Map({
        container: "map-container",
        style: "mapbox://styles/wadaishinkan/cm3y0d9qw00hp01rd6u883qp5",
        center: [135.151645, 34.265574],
        zoom: 15,
        // pitch: 45, // 初期ピッチを設定 (0〜60程度が適切)
        // bearing: 0, // 初期の方位角を設定
        dragRotate: true, // ドラッグでの回転を有効化
        pitchWithRotate: true, // ピッチ変更のジェスチャーを有効化
      });
  
      // 不足している画像を検知
      this.map.on("styleimagemissing", (e) => {
        // console.warn(Missing image: ${e.id});
      });
  
      // 地図のクリックイベント
      this.map.on("click", (e) => {
        // console.log(クリックされた位置: 緯度 ${e.lngLat.lat}, 経度 ${e.lngLat.lng});
      });
    },
    beforeDestroy() {
      if (this.map) {
        this.map.remove();
      }
    },
  };
  </script>
  
  <style>
  #map-container {
    width: 100%;
    height: 500px;
  }
  </style>