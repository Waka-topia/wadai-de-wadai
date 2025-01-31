<template>
  <!-- モーダルが表示されるかどうかをisModalVisibleに基づいて表示 -->
  <div v-show="isModalVisible" class="modal">
    <div class="modal-content">
      <!-- モーダルの閉じるボタン -->
      <v-btn @click="handleCloseModal" class="close-btn" icon>
        <v-icon>mdi-close</v-icon>
      </v-btn>

      <!-- イベントのタイトル -->
      <v-card class="elevation-5 rounded-lg pa-5">
        <v-card-title class="text-h5 font-weight-bold">{{ event.title }}</v-card-title>
        <v-divider class="mb-3"></v-divider>

        <!-- アイコンとラベルを使って情報表示 -->
        <v-row class="mb-2">
          <v-col cols="2" class="d-flex justify-center">
            <v-icon>mdi-calendar</v-icon>
          </v-col>
          <v-col cols="10">
            <span><strong>日付:</strong> {{ event.start ? event.start.toLocaleDateString() : '日付情報がありません' }}</span>
          </v-col>
        </v-row>

        <v-row class="mb-2">
          <v-col cols="2" class="d-flex justify-center">
            <v-icon>mdi-clock</v-icon>
          </v-col>
          <v-col cols="10">
            <span><strong>時間:</strong> 
              {{ event.start ? event.start.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '時間情報がありません' }} ～ 
              {{ event.end ? event.end.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '時間情報がありません' }}
            </span>
          </v-col>
        </v-row>

        <v-row class="mb-2">
          <v-col cols="2" class="d-flex justify-center">
            <v-icon>mdi-map-marker</v-icon>
          </v-col>
          <v-col cols="10">
            <span><strong>場所:</strong> {{ event.location }}</span>
          </v-col>
        </v-row>

        <v-row class="mb-2">
          <v-col cols="2" class="d-flex justify-center">
            <v-icon>mdi-information</v-icon>
          </v-col>
          <v-col cols="10">
            <span><strong>概要:</strong> {{ event.description }}</span>
          </v-col>
        </v-row>

        <v-row class="mb-2">
          <v-col cols="2" class="d-flex justify-center">
            <v-icon>mdi-account</v-icon>
          </v-col>
          <v-col cols="10">
            <span><strong>団体名:</strong> {{ event.organizerName }}</span>
          </v-col>
        </v-row>

        <v-divider class="mb-3"></v-divider>

        <!-- 削除ボタン -->
        <v-btn @click="toggleEditDeleteForm" color="error" block>削除フォーム</v-btn>

        <!-- 編集・削除フォーム -->
        <EditDeleteForm
          v-show="isEditDeleteFormVisible"
          :organizer-id="event.organizerId"
          :password="password"
          @delete-event="handleDeleteEvent"
        />

      </v-card>
    </div>
  </div>
</template>

<script>
import EditDeleteForm from "@/components/Event/EditDeleteForm.vue";
import { or } from "firebase/firestore";

export default {
  components: {
    EditDeleteForm
  },
  props: {
    isModalVisible: Boolean,
    event: Object,
  },
  data() {
    return {
      isEditDeleteFormVisible: false,
      password: "",
    };
  },
  methods: {
    // 削除フォームを表示・非表示にする処理
    toggleEditDeleteForm() {
      this.isEditDeleteFormVisible = !this.isEditDeleteFormVisible;
      if (this.isEditDeleteFormVisible) {
        this.organizerId = this.event.organizerId || "";
        this.password = "";
        this.errorMessage = "";
      }
    },

    // モーダルを閉じる処理
    handleCloseModal() {
      // モーダルを閉じるためのイベントを送信
      this.$emit('close-modal');
      
      // 削除フォームが開いている場合は非表示にする
      this.isEditDeleteFormVisible = false;

      // 必要な変数をリセット
      this.organizerId = "";
      this.password = "";
      this.errorMessage = "";
    },

    handleDeleteEvent(organizerId, password) {
      // console.log(organizerId, password);
      // 受け取ったデータを親コンポーネントに伝播
      const DeleteFormOrganizerId = organizerId;
      const DeleteFormPassword = password;
      this.$emit('delete-event',DeleteFormOrganizerId,DeleteFormPassword);
    },
  },
};
</script>


<style scoped>
/* モーダルのスタイル調整 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

.v-row {
  margin-bottom: 10px;
}

.v-col {
  padding-left: 0;
  padding-right: 0;
}

.v-icon {
  font-size: 24px;
}

.v-btn {
  margin-top: 20px;
}
</style>
