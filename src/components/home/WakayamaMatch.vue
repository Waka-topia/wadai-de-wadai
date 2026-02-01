<template>
  <div class="mb-6">
    <!-- Wakayama Match Teaser (Premium Design) -->
    <v-card
      class="rounded-xl overflow-hidden position-relative teaser-card"
      elevation="2"
      color="pink-accent-1"
    >
      <!-- Background Gradient/Pattern Overlay -->
      <div class="teaser-bg"></div>

      <div class="d-flex align-center justify-space-between px-4 py-3 position-relative z-index-1">
        <div class="d-flex align-center">
          <div class="mr-3 glass-icon-container">
            <v-icon color="white" size="large">mdi-heart-multiple</v-icon>
          </div>
          <div>
            <div class="text-subtitle-2 font-weight-bold text-white mb-0">ワカヤママッチ</div>
            <div class="text-caption text-white opacity-90">和大生限定の友達づくりサービス</div>
          </div>
        </div>

        <v-chip
          size="x-small"
          color="white"
          variant="flat"
          class="font-weight-bold text-pink-accent-3"
        >
          COMING SOON
        </v-chip>
      </div>
    </v-card>
  </div>
</template>

<script setup>
// Component for Wakayama Match Teaser
</script>

<style scoped>
/* Premium Teaser Styles */
.teaser-card {
  background: linear-gradient(135deg, #ff4081 0%, #f50057 100%);
}

.teaser-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 20%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.2) 0%, transparent 25%);
}

.glass-icon-container {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.z-index-1 {
  z-index: 1;
}
</style>
