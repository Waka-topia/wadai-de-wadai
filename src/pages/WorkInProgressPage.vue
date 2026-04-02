<template>
  <div class="work-in-progress-container">
    <v-container>
      <v-row justify="center" class="text-center">
        <v-col>
          <v-icon size="96" color="grey-lighten-1" class="mb-4">mdi-hammer-wrench</v-icon>
          <h1 class="text-h5 font-weight-bold mb-2 mx-5">このページは準備中です</h1>
          <p class="text-body-1 text-medium-emphasis xm-body-1">
            現在ページの公開に向けて準備を進めております。
            <br />
            リリースまで今しばらくお待ちください。
          </p>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup></script>

<style scoped>
.work-in-progress-container {
  background-color: #f9f8f4;
  /* margin-top: 50px; */
  min-height: 84vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
