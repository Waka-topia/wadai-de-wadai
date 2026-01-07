<template>
  <div class="event-schedule">
    <div class="nav-buttons">
      <button class="nav-btn" @click="changeDate(-1)">&#x3C;</button>
      <h3 class="title">{{ formattedSelectedDate }} の新歓イベント</h3>
      <button class="nav-btn" @click="changeDate(1)">&#x3E;</button>
    </div>

    <div class="no-events" v-if="filteredEvents.length === 0">イベントはありません</div>

    <div class="d-flex flex-column ga-2" v-else>
      <div
        class="border-md rounded-lg"
        v-for="event in filteredEvents"
        :key="event.eventId"
        @click="openEventModal(event)"
      >
        <v-row class="py-4">
          <v-col
            class="text-center justify-center align-center font-weight-bold text-body-2"
            cols="3"
          >
            <div>
              {{ formatTime(event.start) }}
            </div>
            <div>〜</div>
            <div>
              {{ formatTime(event.end) }}
            </div>
          </v-col>
          <v-divider vertical></v-divider>
          <v-col cols="9">
            <div>
              <p class="text-h6 font-weight-bold">{{ event.title }}</p>
              <p class="text-caption font-weight-bold text-grey-lighten-2 text-truncate">
                {{ event.description }}
              </p>
              <p class="text-body-2 font-weight-bold text-orange">
                <v-icon color="orange">mdi-map-marker</v-icon>{{ event.location }}
              </p>
            </div>
          </v-col>
        </v-row>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    events: {
      type: Array,
      required: true,
    },
    selectedDate: {
      type: [String, Date],
      default: null,
    },
  },
  emits: ['openModal', 'update:selectedDate'],
  data() {
    return {
      internalSelectedDate: this.selectedDate ? new Date(this.selectedDate) : new Date(),
    }
  },
  computed: {
    formattedSelectedDate() {
      return this.internalSelectedDate
        .toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
        .replace(/\//g, '-')
    },
    filteredEvents() {
      return this.events.filter((event) => {
        const eventDate = new Date(event.start)
          .toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
          .replace(/\//g, '-')
        return eventDate === this.formattedSelectedDate
      })
    },
  },
  watch: {
    selectedDate(newVal) {
      this.internalSelectedDate = new Date(newVal)
    },
  },
  methods: {
    formatTime(dateString) {
      const date = new Date(dateString)
      return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    },
    openEventModal(event) {
      this.$emit('openModal', event)
    },
    changeDate(days) {
      const newDate = new Date(this.internalSelectedDate)
      newDate.setDate(newDate.getDate() + days)
      this.internalSelectedDate = newDate
      this.$emit('update:selectedDate', newDate.toISOString().split('T')[0])
    },
  },
}
</script>

<style scoped>
.event-schedule {
  padding: 16px;
  background: #fff;
  border-radius: 12px;
}

.nav-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 10px;
}

.nav-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.nav-btn:hover {
  color: #ff9800;
}

.title {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

.no-events {
  text-align: center;
  color: #888;
  font-size: 14px;
}
</style>
