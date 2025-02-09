<template>
  <div class="event-schedule">
    <div class="nav-buttons">
      <button @click="changeDate(-1)" class="nav-btn">&#x3C;</button>
      <h3 class="title">{{ formattedSelectedDate }} の新歓イベント</h3>
      <button @click="changeDate(1)" class="nav-btn">&#x3E;</button>
    </div>
    
    <div v-if="filteredEvents.length === 0" class="no-events">イベントはありません</div>

    <div v-else class="event-list">
      <div v-for="event in filteredEvents" :key="event.eventId" class="event-card" @click="openEventModal(event)">
        <div class="event-time">
          {{ formatTime(event.start) }} - {{ formatTime(event.end) }}
        </div>
        <div class="event-details">
          <h4 class="event-title">{{ event.title }}</h4>
          <p class="event-location">📍 {{ event.location }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    events: {
      type: Array,
      required: true
    },
    selectedDate: {
      type: [String, Date],
      default: null
    }
  },
  data() {
    return {
      internalSelectedDate: this.selectedDate ? new Date(this.selectedDate) : new Date()
    };
  },
  computed: {
    formattedSelectedDate() {
      return this.internalSelectedDate.toLocaleDateString("ja-JP", { 
        year: "numeric", 
        month: "2-digit", 
        day: "2-digit" 
      }).replace(/\//g, "-");
    },
    filteredEvents() {
      return this.events.filter(event => {
        const eventDate = new Date(event.start).toLocaleDateString("ja-JP", { 
          year: "numeric", 
          month: "2-digit", 
          day: "2-digit" 
        }).replace(/\//g, "-");
        return eventDate === this.formattedSelectedDate;
      });
    }
  },
  methods: {
    formatTime(dateString) {
      const date = new Date(dateString);
      return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
    },
    openEventModal(event) {
      this.$emit("open-modal", event);
    },
    changeDate(days) {
      const newDate = new Date(this.internalSelectedDate);
      newDate.setDate(newDate.getDate() + days);
      this.internalSelectedDate = newDate;
      this.$emit("update:selectedDate", newDate.toISOString().split("T")[0]);
    }
  },
  watch: {
    selectedDate(newVal) {
      this.internalSelectedDate = new Date(newVal);
    }
  }
};
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

.event-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.event-card {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  background: #f8f8f8;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

.event-card:hover {
  background: #ececec;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.event-time {
  font-size: 14px;
  font-weight: bold;
  color: #ff9800;
  margin-right: 10px;
}

.event-details {
  flex: 1;
}

.event-title {
  font-size: 16px;
  font-weight: bold;
}

.event-location {
  font-size: 14px;
  color: #666;
}
</style>
