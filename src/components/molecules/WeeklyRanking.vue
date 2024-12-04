<template>
  <ProfileCard v-for="(user, index) in userInfo" :key="index" :name="user.name" :status="user.status"
    :image="user.image" />
</template>

<script>
import ProfileCard from '../atoms/ProfileCard.vue';

export default {
  data() {
    return {
      // firebaseからランキング情報を取得
      userInfo: [
        {
          name: '山﨑 週次',
          status: '吹奏楽部',
          image: 'https://via.placeholder.com/120',
        },
        {
          name: '谷 週吉',
          status: 'サッカー部',
          image: 'https://via.placeholder.com/120',
        },
        {
          name: '細田 週子',
          status: 'サイエンス部',
          image: 'https://via.placeholder.com/120',
        },
      ],
    };
  },
  name: 'DailyRanking',
  components: {
    ProfileCard,
  },
};
</script>
