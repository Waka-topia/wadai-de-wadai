<template>
  <div>
    <!-- 第一段階: カテゴリー選択 -->
    <div class="d-flex flex-column my-3">
      <label for="main-category" class="font-weight-bold">カテゴリーで絞り込み:</label>
      <select v-model="selectedMainCategory" @change="filterGroups">
        <option value="all">すべて</option>
        <option value="club">部活</option>
        <option value="circle">サークル</option>
        <option value="committee">その他(委員会)</option>
      </select>
    </div>

    <!-- 第二段階: 運動系/文化系の選択 -->
    <div v-if="selectedMainCategory !== 'all'" class="d-flex flex-column my-3">
      <label for="sub-category" class="font-weight-bold">運動系または文化系:</label>
      <select v-model="selectedSubCategory" @change="filterGroups">
        <option value="all">すべて</option>
        <option value="sports">運動系</option>
        <option value="culture">文化系</option>
      </select>
    </div>

    <!-- 団体選択 -->
    <div class="d-flex flex-column my-3">
      <label for="group" class="font-weight-bold">団体を選択:</label>
      <select v-model="selectedGroup">
        <option v-for="group in filteredGroups" :key="group.id" :value="group.name">
          {{ group.name }}
        </option>
      </select>
    </div>

    <!-- 日付選択 -->
    <div class="d-flex flex-column my-3">
      <label for="date" class="font-weight-bold">日付を選択:</label>
      <input type="date" v-model="selectedDate" />
    </div>

    <!-- 保存ボタン -->
    <div class="d-flex flex-column my-3 mt-5">
      <v-btn size="large" color="success" @click="saveShinkan">保存</v-btn>
    </div>

    <!-- 次に行く新歓情報の表示 -->
    <div v-if="nextShinkan.groupName" class="my-3 mt-5 next-shinkan">
      <h3>次に行く新歓</h3>
      <p>団体: {{ nextShinkan.groupName }}</p>
      <p>日付: {{ nextShinkan.nextDate }}</p>
    </div>
  </div>
</template>

<script>
import { allGroups } from '@/data/groups' // データをインポート
import { mapActions, mapState } from 'vuex'

export default {
  data() {
    return {
      selectedMainCategory: 'all',
      selectedSubCategory: 'all',
      selectedGroup: '',
      selectedDate: '',
      allGroups: allGroups, // インポートしたデータをセット
      filteredGroups: [],
    }
  },
  computed: {
    ...mapState('shinkan', ['nextShinkan']),
    userId() {
      return this.$store.getters['auth/userId']
    },
  },
  methods: {
    ...mapActions('shinkan', ['saveNextShinkan']),
    filterGroups() {
      let groups =
        this.selectedMainCategory === 'all'
          ? this.allGroups
          : this.allGroups.filter((group) => group.mainCategory === this.selectedMainCategory)

      if (this.selectedSubCategory !== 'all') {
        groups = groups.filter((group) => group.subCategory === this.selectedSubCategory)
      }

      this.filteredGroups = groups
    },
    saveShinkan() {
      const userId = this.userId
      const groupName = this.selectedGroup
      const nextDate = this.selectedDate

      if (!userId) {
        alert('ユーザーがログインしていません。')
        return
      }

      if (!groupName || !nextDate) {
        alert('団体と日付を選択してください')
        return
      }

      this.saveNextShinkan({ userId, groupName, nextDate })
    },
  },
  mounted() {
    this.filterGroups()
  },
}
</script>

<style scoped>
select,
input[type='date'] {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.next-shinkan {
  padding: 10px;
  border-radius: 4px;
  background-color: #fff3e0;
}
</style>
