<template>
  <div v-show="isModalVisible" class="modal">
    <div class="modal-content">
      <v-btn class="close-btn" icon @click="handleCloseModal">
        <v-icon>mdi-close</v-icon>
      </v-btn>

      <div class="event-container">
        <h2 class="event-title text-h5 font-weight-bold primary--text">
          {{ event.title }}
        </h2>
        <div class="event-divider"></div>

        <div class="info-row">
          <div class="icon-wrapper">
            <v-icon color="primary">mdi-calendar</v-icon>
          </div>
          <div class="info-content">
            <span class="info-text">
              <strong>日付:</strong>
              {{ event.start ? event.start.toLocaleDateString() : '日付情報がありません' }}
            </span>
          </div>
        </div>

        <div class="info-row">
          <div class="icon-wrapper">
            <v-icon color="primary">mdi-clock</v-icon>
          </div>
          <div class="info-content">
            <span class="info-text">
              <strong>時間:</strong>
              {{
                event.start
                  ? event.start.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
                  : '時間情報がありません'
              }}
              <span class="time-separator">～</span>
              {{
                event.end
                  ? event.end.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
                  : '時間情報がありません'
              }}
            </span>
          </div>
        </div>

        <div class="info-row">
          <div class="icon-wrapper">
            <v-icon color="primary">mdi-map-marker</v-icon>
          </div>
          <div class="info-content">
            <span class="info-text"> <strong>場所:</strong> {{ event.location }} </span>
          </div>
        </div>

        <div class="info-row">
          <div class="icon-wrapper">
            <v-icon color="primary">mdi-information</v-icon>
          </div>
          <div class="info-content">
            <span class="info-text"> <strong>概要:</strong> {{ event.description }} </span>
          </div>
        </div>

        <div class="info-row">
          <div class="icon-wrapper">
            <v-icon color="primary">mdi-account</v-icon>
          </div>
          <div class="info-content">
            <span class="info-text"> <strong>団体名:</strong> {{ event.organizerName }} </span>
          </div>
        </div>

        <div class="event-divider"></div>

        <v-btn
          class="delete-form-btn white--text"
          block
          color="grey darken-1"
          depressed
          @click="toggleEditDeleteForm"
        >
          <v-icon left>mdi-delete</v-icon>
          削除フォーム
        </v-btn>

        <div class="mt-3">
          <EditDeleteForm
            v-show="isEditDeleteFormVisible"
            :organizer-id="event.organizerId"
            :password="password"
            @delete-event="handleDeleteEvent"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import EditDeleteForm from './EditDeleteForm.vue'

const props = defineProps({
  isModalVisible: Boolean,
  event: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['closeModal', 'deleteEvent'])

const isEditDeleteFormVisible = ref(false)
const password = ref('')
const organizerId = ref('')
const errorMessage = ref('')

// 削除フォームを表示・非表示にする処理
const toggleEditDeleteForm = () => {
  isEditDeleteFormVisible.value = !isEditDeleteFormVisible.value
  if (isEditDeleteFormVisible.value) {
    organizerId.value = props.event.organizerId || ''
    password.value = ''
    errorMessage.value = ''
  }
}

// モーダルを閉じる処理
const handleCloseModal = () => {
  // モーダルを閉じるためのイベントを送信
  emit('closeModal')

  // 削除フォームが開いている場合は非表示にする
  isEditDeleteFormVisible.value = false

  // 必要な変数をリセット
  organizerId.value = ''
  password.value = ''
  errorMessage.value = ''
}

const handleDeleteEvent = (formOrganizerId, formPassword) => {
  // 受け取ったデータを親コンポーネントに伝播
  emit('deleteEvent', formOrganizerId, formPassword)
}
</script>

<style scoped>
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
  padding: 24px;
  border-radius: 16px;
  max-width: 550px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transform: scale(1);
  transition: transform 0.3s ease;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.9) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.close-btn:hover {
  background-color: #f5f5f5 !important;
  transform: scale(1.05);
}

.event-container {
  padding: 0 8px;
}

.event-title {
  margin-top: 12px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  position: relative;
  padding-left: 16px;
  border-left: 4px solid var(--v-primary-base);
}

.event-divider {
  height: 1px;
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.05),
    rgba(0, 0, 0, 0.1),
    rgba(0, 0, 0, 0.05)
  );
  margin: 20px 0;
}

.info-row {
  display: flex;
  margin-bottom: 16px;
  padding: 8px 4px;
  transition: background-color 0.2s ease;
  border-radius: 8px;
}

.info-row:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.icon-wrapper {
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16px;
}

.info-content {
  flex: 1;
  display: flex;
  align-items: center;
}

.info-text {
  font-size: 16px;
  line-height: 1.5;
}

.info-text strong {
  color: #424242;
  font-weight: 600;
  margin-right: 8px;
  display: inline-block;
}

.v-icon {
  font-size: 22px;
}

.time-separator {
  margin: 0 6px;
  color: var(--v-primary-base);
}

.delete-form-btn {
  border-radius: 8px;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: none;
  transition: all 0.3s ease;
  height: 48px;
  margin-top: 8px;
}

.delete-form-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

@media (max-width: 600px) {
  .modal-content {
    width: 95%;
    padding: 20px;
  }

  .info-text {
    font-size: 14px;
  }

  .event-title {
    font-size: 1.2rem !important;
  }

  .info-row {
    margin-bottom: 12px;
  }

  .icon-wrapper {
    width: 28px;
    margin-right: 12px;
  }
}
</style>