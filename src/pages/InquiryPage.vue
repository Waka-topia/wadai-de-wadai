<template>
  <v-main>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-card-title>お問い合わせ</v-card-title>
          <v-card-text>
            <v-form>
              <v-text-field v-model="name" label="お名前" required></v-text-field>
              <v-text-field
                v-model="email"
                label="メールアドレス"
                placeholder="xxxxxxxx@wakayama-u.ac.jp"
                required
              ></v-text-field>
              <v-textarea v-model="content" label="お問い合わせ内容" required></v-textarea>
              <v-btn color="primary" @click="submitInquiry">送信</v-btn>
            </v-form>
          </v-card-text>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup></script>
