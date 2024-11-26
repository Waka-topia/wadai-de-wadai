<template>
    <div id="map-container"></div>
  </template>
  
  <script>
  import L from "leaflet";
  import "leaflet/dist/leaflet.css";
  import * as turf from "@turf/turf";
  
  // mdiアイコンをインポート
  import { mdiLibrary, mdiSoccerField, mdiMapMarker } from "@mdi/js";
  
  export default {
    name: "QuestMap",
    data() {
      return {
        map: null,
        playerMarker: null,
      };
    },
    mounted() {
      // 地図の初期化
      this.map = L.map("map-container").setView(
        [34.26506389024405, 135.15114784240725],
        17
      );
  
      // OpenStreetMap タイルを追加
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      }).addTo(this.map);
  
      // プレイヤー位置の初期化
      this.addPlayerLocation();
  
      // クエストポイントの設定
      const questPoints = [
        {
          name: "図書館",
          description: "ここで次のヒントを探してください！",
          coordinates: [34.2655, 135.1517],
          iconPath: mdiLibrary, // 図書館アイコン
        },
        {
          name: "グラウンド",
          description: "ここで写真を撮りましょう！",
          coordinates: [34.2648, 135.1505],
          iconPath: mdiSoccerField, // サッカー場アイコン
        },
      ];
  
      // クエストポイントを地図に追加
      questPoints.forEach((point) => {
        const marker = L.marker(point.coordinates, {
          icon: L.divIcon({
            html: `<svg viewBox="0 0 24 24" style="width:32px;height:32px;fill:red;"><path d="${point.iconPath}" /></svg>`,
            className: "",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          }),
        })
          .addTo(this.map)
          .bindPopup(`<b>${point.name}</b><br>${point.description}`);
  
        marker.on("click", () => {
          alert(`${point.name} に到着しました！クエストクリア！`);
          marker.remove(); // クエストクリア後、マーカーを削除
        });
      });
    },
    methods: {
      // プレイヤー位置を取得してマーカーを表示
      addPlayerLocation() {
        if (navigator.geolocation) {
          navigator.geolocation.watchPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
  
              // プレイヤーの現在地マーカーを更新
              if (!this.playerMarker) {
                this.playerMarker = L.marker([latitude, longitude], {
                  icon: L.divIcon({
                    html: `<svg viewBox="0 0 24 24" style="width:32px;height:32px;fill:blue;"><path d="${mdiMapMarker}" /></svg>`,
                    className: "",
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                  }),
                }).addTo(this.map);
              } else {
                this.playerMarker.setLatLng([latitude, longitude]);
              }
  
              // 地図を現在地にフォーカス
              this.map.setView([latitude, longitude], 17);
            },
            (error) => {
              console.error("位置情報が取得できませんでした:", error);
            }
          );
        } else {
          alert("位置情報がサポートされていません");
        }
      },
    },
  };
  </script>
  
  <style>
  #map-container {
    width: 100%;
    height: 100%;
  }
  </style>
  