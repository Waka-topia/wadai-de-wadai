<template>
  <div class="profile-image">
    <!-- アイコン変更ボタン -->
    <button v-if="!isEditing" @click="startEditing">アイコンを変更</button>

    <!-- アイコン選択フォーム（編集モード時のみ表示） -->
    <div v-if="isEditing">
      <div class="icons">
        <img
          v-for="(icon, index) in icons"
          :key="index"
          :src="`src/assets/userIcon/userIcon${index + 1}.png`"
          alt="アイコン"
          :class="{'selected': selectedIcon === index}"
          @click="selectIcon(index)"
        />
      </div>

      <p v-if="selectedIcon !== null">選択されたアイコン: {{ selectedIcon + 1 }}</p>

      <button @click="saveIcon">アイコンを保存</button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "ProfileImage",
  data() {
    return {
      selectedIcon: null, // アイコンが選択されていない状態
      isEditing: false, // 編集モードかどうかのフラグ
      icons: Array.from({ length: 8 }, (_, index) => `userIcon${index + 1}`), // アイコン画像の配列
    };
  },
  computed: {
    ...mapGetters("auth", ["photoURL"]),
  },
  methods: {
    selectIcon(index) {
      this.selectedIcon = index; // アイコンが選択されたとき、そのインデックスを設定
    },
    saveIcon() {
      if (this.selectedIcon !== null) {
        const iconURL = `userIcon/userIcon${this.selectedIcon + 1}.png`;
        this.updatePhotoURL(iconURL); // アイコンURLを更新
        this.isEditing = false; // 編集終了後、フォームを非表示にする
      } else {
        alert("アイコンを選択してください");
      }
    },
    startEditing() {
      this.isEditing = true; // 編集モードを開始
    },
    ...mapActions("auth", ["updatePhotoURL"]), // Vuex アクションの呼び出し
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

button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #45a049;
}
</style>
