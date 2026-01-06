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
      return this.$store.getters['auth/userId'] // authモジュールのuserIdを取得
    },
    userTitles() {
      return this.$store.getters['title/getUserTitles'](this.userId)
    },
  },
  created() {
    // コンポーネント作成時に、ユーザーの称号を取得するアクションを呼び出す
    this.fetchUserTitles()
  },
  methods: {
    async fetchUserTitles() {
      try {
        await this.$store.dispatch('title/fetchUserTitles', this.userId)

        // userTitles をコンソールに出力
        console.log('取得したユーザーの称号:', this.userTitles)
      } catch (error) {
        console.error('称号の取得に失敗しました:', error)
      }
    },
  },
}
</script>

<style scoped>
.title-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  background-color: #fff;
  height: auto;
  width: 100%;
  max-width: 800px; /* コンテナの最大幅を設定 */
  margin: 0 auto; /* 中央揃え */
}

.title-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  width: 100%; /* リストの幅を100%に */
}

.title-item {
  width: 100%;
  margin: 15px 0;
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
  text-align: left;
  width: 100%;
}

.title-name {
  font-size: 1.2em;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  word-break: break-word; /* 長い単語があっても折り返す */
}

.title-description {
  font-size: 1em;
  color: #666;
  white-space: normal; /* 文字を折り返すように変更 */
  overflow: visible; /* オーバーフローを表示するように変更 */
  text-overflow: clip; /* 省略記号を削除 */
  word-break: break-word; /* 長い単語があっても折り返す */
  line-height: 1.5; /* 行間を適切に設定 */
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .title-container {
    padding: 10px;
  }

  .title-item {
    padding: 15px;
    margin: 10px 0;
  }

  .title-name {
    font-size: 1.1em;
  }

  .title-description {
    font-size: 0.9em;
  }
}
</style>
