<template>
    <div class="profile-image">
      <h2>プロフィールアイコンを選択</h2>
  
      <!-- アイコン選択用の8つのアイコン -->
      <div class="icons">
        <img
          v-for="(icon, index) in icons"
          :key="index"
          :src="`/src/components/userIcon/userIcon${index + 1}.png`"
          alt="アイコン"
          :class="{'selected': selectedIcon === index}"
          @click="selectIcon(index)"
        />
      </div>
  
      <!-- 現在選択されているアイコンのURL -->
      <p v-if="selectedIcon !== null">選択されたアイコン: {{ selectedIcon + 1 }}</p>
  
      <button @click="saveIcon">アイコンを保存</button>
    </div>
  </template>
  
  <script>
  import { mapGetters, mapActions } from "vuex";
  
  export default {
    name: "ProfileImage",
    data() {
      return {
        // アイコンのインデックス（最初は選択なし）
        selectedIcon: null,
        icons: Array.from({ length: 8 }, (_, index) => `userIcon${index + 1}`), // アイコン画像ファイル名
      };
    },
    computed: {
      ...mapGetters("auth", ["photoURL"]),
    },
    methods: {
      selectIcon(index) {
        this.selectedIcon = index; // アイコンが選択された場合、そのインデックスを記録
      },
      saveIcon() {
        if (this.selectedIcon !== null) {
          const iconURL = `/src/components/userIcon/userIcon${this.selectedIcon + 1}.png`;
          this.updatePhotoURL(iconURL);
        } else {
          alert("アイコンを選択してください");
        }
      },
      ...mapActions("auth", ["updatePhotoURL"]), // Vuex のアクションをマップ
    },
  };
  </script>
  
  <style scoped>
  .profile-image {
    text-align: center;
  }
  .icons {
    display: flex;
    justify-content: center;
    gap: 10px;
  }
  .icons img {
    width: 50px;
    height: 50px;
    cursor: pointer;
    border-radius: 50%;
  }
  .icons img.selected {
    border: 3px solid blue; /* 選択されたアイコンに青い枠を表示 */
  }
  </style>
  