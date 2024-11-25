<template>
    <div id="map-container"></div>
  </template>
  
  <script>
  import mapboxgl from "mapbox-gl";
  
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
        style: "mapbox://styles/mapbox/streets-v11", // スタイル
        center: [139.6917, 35.6895], // 初期位置 (緯度経度: 東京の例)
        zoom: 15, // 初期ズームレベル
      });
  
      // 地図にクリックイベントを追加
      this.map.on("click", (e) => {
        console.log(`クリックされた位置: 緯度 ${e.lngLat.lat}, 経度 ${e.lngLat.lng}`);
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
  