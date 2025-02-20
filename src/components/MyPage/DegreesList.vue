<template>
  <div class="title-container">
    <ul class="title-list">
      <li v-for="title in userTitles" :key="title.id" class="title-item">
        <div class="title-card">
          <h3 class="title-name">{{ title.name }}</h3>
          <p class="title-description">{{ title.description }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  computed: {
    // Vuex の getter を使用してユーザーの称号を取得
    userId() {
      return this.$store.getters['auth/userId']; // authモジュールのuserIdを取得
    },
    userTitles() {
      return this.$store.getters['title/getUserTitles'](this.userId);
    }
  },
  created() {
    // コンポーネント作成時に、ユーザーの称号を取得するアクションを呼び出す
    this.fetchUserTitles();
  },
  methods: {
    async fetchUserTitles() {
      try {
        await this.$store.dispatch('title/fetchUserTitles', this.userId);
        
        // userTitles をコンソールに出力
        console.log("取得したユーザーの称号:", this.userTitles);
      } catch (error) {
        console.error("称号の取得に失敗しました:", error);
      }
    }
  }
};
</script>

<style scoped>
.title-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  background-color: #fff;
  height: auto;
  flex-direction: column; /* 縦並びに変更 */
}

.title-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column; /* 縦に並べる */
  align-items: center; /* 中央揃え */
}

.title-item {
  width: 100%; /* 横幅を100%にして、縦に並ぶように調整 */
  margin: 15px 0; /* 縦に間隔を空ける */
  padding: 20px;
  background-color: #f4f7fa;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out;
}

.title-item:hover {
  transform: translateY(-5px);
}

.title-card {
  text-align: left; /* 左詰めに変更 */
}

.title-name {
  font-size: 1.2em;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px; /* title-name と description の間にスペースを追加 */
}

.title-description {
  font-size: 1em;
  color: #666;
  white-space: nowrap; /* 文字の折り返しを防ぐ */
  overflow: hidden;
  text-overflow: ellipsis; /* 長い文字がはみ出る場合は省略記号を表示 */
}
</style>
