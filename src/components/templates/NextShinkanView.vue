<template>
    <div>
      <h2>次の新歓情報</h2>
      <div v-if="nextShinkan">
        <p><strong>団体名:</strong> {{ nextShinkan.groupName }}</p>
        <p><strong>次に行く日付:</strong> {{ nextShinkan.nextDate }}</p>
      </div>
      <div v-else>
        <p>次の新歓情報はありません。</p>
      </div>
    </div>
  </template>
  
  <script>
  import { mapState } from "vuex";
  
  export default {
    computed: {
      // VuexのstateからnextShinkanを取得
      ...mapState({
        nextShinkan: (state) => state.shinkan.nextShinkan,
      }),
      userId() {
        return this.$store.getters["auth/userId"];
      },
    },
    created() {
      // コンポーネントが作成されたときに、新歓情報を取得する
      const userId = this.userId; // 認証済みのユーザーIDを取得
      this.$store.dispatch("shinkan/fetchNextShinkan", userId);
    },
  };
  </script>
  
  <style scoped>
  /* スタイルの調整があればここに追加 */
  </style>
  