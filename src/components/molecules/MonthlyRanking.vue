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
          name: '山本 月郎',
          status: '吹奏楽部',
          image: 'https://via.placeholder.com/120',
        },
        {
          name: '鈴木 月',
          status: '美術部',
          image: 'https://via.placeholder.com/120',
        },
        {
          name: '中村 月子',
          status: 'パソコン部',
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
