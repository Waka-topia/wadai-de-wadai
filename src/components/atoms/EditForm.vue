<template>
  <div class="pa-4 text-center">
    <v-dialog v-model="dialog" max-width="600">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn class="text-none font-weight-regular" prepend-icon="mdi-account" text="Edit Profile" variant="tonal"
          v-bind="activatorProps"></v-btn>
      </template>

      <v-card prepend-icon="mdi-account" title="User Profile">
        <v-card-text>
          <v-row>
            <v-col>
              <v-img :src="photoURL" alt="ユーザーのアイコン" class="rounded-circle" width="120" height="120"></v-img>
            </v-col>
            <v-col>
              <v-file-input label="アイコン" prepend-icon="mdi-camera" variant="filled"></v-file-input>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="12" md="4" sm="6">
              <v-text-field label="ユーザー名*" prepend-icon="mdi-rename" v-model="displayName" required></v-text-field>
            </v-col>

            <v-col cols="12" md="4" sm="6">
              <v-text-field label="Email*" prepend-icon="mdi-email-edit-outline" v-model="email"
                required></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-date-input v-model="selectedDate" label="次の新歓日程" required>
              </v-date-input>
            </v-col>

            <v-col cols="12" sm="6">
              <v-autocomplete
                :items="['Skiing', 'Ice hockey', 'Soccer', 'Basketball', 'Hockey', 'Reading', 'Writing', 'Coding', 'Basejump']"
                prepend-icon="mdi-party-popper" label="次の新歓" auto-select-first multiple></v-autocomplete>
            </v-col>
          </v-row>

          <small class="text-caption text-medium-emphasis">*indicates required field</small>
          <small class="text-caption text-medium-emphasis">ユーザーID:{{ userId }}</small><br>
          <small class="text-caption text-medium-emphasis">プロバイダデータ:{{ providerData }}</small>

        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn text="Close" variant="plain" @click="dialog = false"></v-btn>

          <v-btn color="orange" text="Save" variant="tonal" @click="dialog = false"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { VDateInput } from 'vuetify/lib/labs/components.mjs';
import { mapActions } from "vuex";

export default {
  data() {
    return {
      dialog: false,
      selectedMainCategory: "all",
      selectedSubCategory: "all",
      selectedGroup: "",
      selectedDate: "",
      filteredGroups: [],
    };
  },
  name: "Home",
  components: {
    VDateInput,
  },
  computed: {
    // VuexのGetterを使用して認証状態を取得
    isAuthenticated() {
      return this.$store.getters["auth/isAuthenticated"];
    },
    // VuexのGetterを使用して表示名を取得
    displayName() {
      return this.$store.getters["auth/displayName"];
    },
    userId() {
      return this.$store.getters["auth/userId"];
    },
    email() {
      return this.$store.getters["auth/email"];
    },
    user() {
      return this.$store.getters["auth/user"];
    },
    providerData() {
      return this.$store.getters["auth/providerData"];
    },
    photoURL() {
      return this.$store.getters["auth/photoURL"];
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
