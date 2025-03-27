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
        <v-card-title class="text-h5 font-weight-bold primary--text mb-2">{{
          event.title
        }}</v-card-title>
        <v-divider class="mb-4"></v-divider>

        <!-- アイコンとラベルを使って情報表示 -->
        <v-row class="mb-3">
          <v-col cols="1" class="d-flex justify-center align-center">
            <v-icon color="primary">mdi-calendar</v-icon>
          </v-col>
          <v-col cols="11">
            <span class="info-text"
              ><strong>日付:</strong>
              {{ event.start ? event.start.toLocaleDateString() : '日付情報がありません' }}</span
            >
          </v-col>
        </v-row>

        <v-row class="mb-3">
          <v-col cols="1" class="d-flex justify-center align-center">
            <v-icon color="primary">mdi-clock</v-icon>
          </v-col>
          <v-col cols="11">
            <span class="info-text"
              ><strong>時間:</strong>
              {{
                event.start
                  ? event.start.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
                  : '時間情報がありません'
              }}
              ～
              {{
                event.end
                  ? event.end.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
                  : '時間情報がありません'
              }}
            </span>
          </v-col>
        </v-row>

        <v-row class="mb-3">
          <v-col cols="1" class="d-flex justify-center align-center">
            <v-icon color="primary">mdi-map-marker</v-icon>
          </v-col>
          <v-col cols="11">
            <span class="info-text"><strong>場所:</strong> {{ event.location }}</span>
          </v-col>
        </v-row>

        <v-row class="mb-3">
          <v-col cols="1" class="d-flex justify-center align-center">
            <v-icon color="primary">mdi-information</v-icon>
          </v-col>
          <v-col cols="11">
            <span class="info-text"><strong>概要:</strong> {{ event.description }}</span>
          </v-col>
        </v-row>

        <v-row class="mb-4">
          <v-col cols="1" class="d-flex justify-center align-center">
            <v-icon color="primary">mdi-account</v-icon>
          </v-col>
          <v-col cols="11">
            <span class="info-text"><strong>団体名:</strong> {{ event.organizerName }}</span>
          </v-col>
        </v-row>

        <v-divider class="mb-4"></v-divider>

        <!-- 削除フォーム呼び出しボタン -->
        <v-btn
          @click="toggleEditDeleteForm"
          color="grey darken-1"
          class="delete-form-btn white--text"
          depressed
          block
        >
          <v-icon left>mdi-delete</v-icon>
          削除フォーム
        </v-btn>

        <!-- 編集・削除フォーム -->
        <div class="mt-3">
          <EditDeleteForm
            v-show="isEditDeleteFormVisible"
            :organizer-id="event.organizerId"
            :password="password"
            @delete-event="handleDeleteEvent"
          />
        </div>
      </v-card>
    </div>
  </div>
</template>

<script>
import EditDeleteForm from '@/components/Event/EditDeleteForm.vue'
// import { or } from "firebase/firestore";

export default {
  components: {
    EditDeleteForm,
  },
  props: {
    isModalVisible: Boolean,
    event: Object,
  },
  data() {
    return {
      isEditDeleteFormVisible: false,
      password: '',
    }
  },
  methods: {
    // 削除フォームを表示・非表示にする処理
    toggleEditDeleteForm() {
      this.isEditDeleteFormVisible = !this.isEditDeleteFormVisible
      if (this.isEditDeleteFormVisible) {
        this.organizerId = this.event.organizerId || ''
        this.password = ''
        this.errorMessage = ''
      }
    },

    // モーダルを閉じる処理
    handleCloseModal() {
      // モーダルを閉じるためのイベントを送信
      this.$emit('close-modal')

      // 削除フォームが開いている場合は非表示にする
      this.isEditDeleteFormVisible = false

      // 必要な変数をリセット
      this.organizerId = ''
      this.password = ''
      this.errorMessage = ''
    },

    handleDeleteEvent(organizerId, password) {
      // console.log(organizerId, password);
      // 受け取ったデータを親コンポーネントに伝播
      const DeleteFormOrganizerId = organizerId
      const DeleteFormPassword = password
      this.$emit('delete-event', DeleteFormOrganizerId, DeleteFormPassword)
    },
  },
}
</script>

<style scoped>
/* モーダルのスタイル調整 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(3px);
  transition: all 0.3s ease;
}

.modal-content {
  background-color: #fff;
  padding: 30px;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transform: scale(1);
  transition: transform 0.3s ease;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.9) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.close-btn:hover {
  background-color: #f5f5f5 !important;
  transform: scale(1.05);
}

.v-card-title {
  border-left: 4px solid var(--v-primary-base);
  padding-left: 12px;
}

.info-text {
  font-size: 16px;
  line-height: 1.5;
}

.info-text strong {
  color: #424242;
  font-weight: 600;
  margin-right: 4px;
}

.v-icon {
  font-size: 22px;
}

.delete-form-btn {
  border-radius: 8px;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: none;
  transition: all 0.3s ease;
  height: 48px;
}

.delete-form-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* モバイル対応 */
@media (max-width: 600px) {
  .modal-content {
    width: 95%;
    padding: 20px;
  }

  .info-text {
    font-size: 14px;
  }

  .v-card-title {
    font-size: 1.2rem !important;
  }
}
</style>
