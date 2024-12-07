<template>
    <div>
      <h2>次に行く新歓</h2>
  
      <!-- 第一段階: カテゴリー選択 -->
      <div>
        <label for="main-category">カテゴリーで絞り込み:</label>
        <select v-model="selectedMainCategory" @change="filterGroups">
          <option value="all">すべて</option>
          <option value="club">部活</option>
          <option value="circle">サークル</option>
          <option value="committee">その他(委員会)</option>
        </select>
      </div>
  
      <!-- 第二段階: 運動系/文化系の選択 -->
      <div v-if="selectedMainCategory !== 'all'">
        <label for="sub-category">運動系または文化系:</label>
        <select v-model="selectedSubCategory" @change="filterGroups">
          <option value="all">すべて</option>
          <option value="sports">運動系</option>
          <option value="culture">文化系</option>
        </select>
      </div>
  
      <!-- 団体選択 -->
      <div>
        <label for="group">団体を選択:</label>
        <select v-model="selectedGroup">
          <option v-for="group in filteredGroups" :key="group.id" :value="group.name">
            {{ group.name }}
          </option>
        </select>
      </div>
  
      <!-- 日付選択 -->
      <div>
        <label for="date">日付を選択:</label>
        <input type="date" v-model="selectedDate" />
      </div>
  
      <!-- 保存ボタン -->
      <button @click="saveShinkan">保存</button>
  
      <!-- 次に行く新歓情報の表示 -->
      <div v-if="nextShinkan.groupName">
        <h3>次に行く新歓</h3>
        <p>団体: {{ nextShinkan.groupName }}</p>
        <p>日付: {{ nextShinkan.nextDate }}</p>
      </div>
    </div>
  </template>
  
  <script>
    import { allGroups } from "@/data/groups"; // データをインポート
    import { mapActions, mapState } from "vuex";

    export default {
    data() {
        return {
        selectedMainCategory: "all",
        selectedSubCategory: "all",
        selectedGroup: "",
        selectedDate: "",
        allGroups: allGroups, // インポートしたデータをセット
        filteredGroups: [],
        };
    },
    computed: {
        ...mapState("shinkan", ["nextShinkan"]),
        userId() {
        return this.$store.getters["auth/userId"];
        },
    },
    methods: {
        ...mapActions("shinkan", ["saveNextShinkan"]),
        filterGroups() {
        // 主カテゴリーでフィルタリング
        let groups = this.selectedMainCategory === "all"
            ? this.allGroups
            : this.allGroups.filter(group => group.mainCategory === this.selectedMainCategory);

        // 副カテゴリー（運動系・文化系）でフィルタリング
        if (this.selectedSubCategory !== "all") {
            groups = groups.filter(group => group.subCategory === this.selectedSubCategory);
        }

        this.filteredGroups = groups;
        },
        saveShinkan() {
        const userId = this.userId; // 認証済みのユーザーIDを取得
        const groupName = this.selectedGroup;
        const nextDate = this.selectedDate;

        if (!userId) {
            alert("ユーザーがログインしていません。");
            return;
        }

        if (!groupName || !nextDate) {
            alert("団体と日付を選択してください");
            return;
        }

        // Vuex アクションを呼び出す
        this.saveNextShinkan({ userId, groupName, nextDate });
        },
    },
    mounted() {
        this.filterGroups(); // 初期表示時にすべての団体を表示
    },
    };


  </script>
  