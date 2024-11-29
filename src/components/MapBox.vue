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
      style: "mapbox://styles/wadaishinkan/cm3xz39au006g01rc56gmatlj",
      center: [135.151645, 34.265574],
      zoom: 15,
      maxBounds: [
        [135.1469319, 34.2617275], // 南西の座標 (左下の角)
        [135.1532004, 34.2706795], // 北東の座標 (右上の角)
      ],
      pitch: 75, // 初期ピッチを設定 (0〜60程度が適切)
    });

    // マップが読み込まれた後にデータセットを追加
    this.map.on("load", () => {
      // データセットをソースとして追加
      this.map.addSource("my-dataset", {
        type: "vector", // データの種類: vector (タイルセットの場合)
        url: "mapbox://wadaishinkan.cm3y0ee6x673n1omtq0pfv8t6-07e7k", // Tileset ID を指定
      });

      // レイヤーを追加
      this.map.addLayer({
        id: "my-dataset-layer", // レイヤーID
        type: "circle", // 表示形式 (例: circle, line, fill)
        source: "my-dataset", // 上で定義したソースを使用
        "source-layer": "wakayamauniv", // Tileset内のレイヤー名を指定
        paint: {
          "circle-radius": 6, // 円の半径
          "circle-color": "#ff0000", // 円の色
        },
      });

      // `wakayamauniv` のフィーチャー情報を取得してマーカーを表示
      const features = this.map.querySourceFeatures("my-dataset", {
        sourceLayer: "wakayamauniv", // ソースレイヤーを指定
      });

      console.log("Features:", features);  // ここでデータを確認

      features.forEach((feature) => {
        const coordinates = feature.geometry.coordinates;
        const name = feature.properties.name;

        // name や coordinates が正しく取得されているか確認
        console.log("Feature:", name, coordinates);

        // アイコンを含むマーカーを追加
        new mapboxgl.Marker({
          color: "red", // アイコンの色 (必要に応じて変更)
        })
          .setLngLat(coordinates) // 座標を設定
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`<strong>${name}</strong>`) // ポップアップに name を表示
          )
          .addTo(this.map); // マーカーを地図に追加
      });
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
  height: 100vh;
}
</style>
