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
          name: '和歌山 日郎',
          status: 'ライムライト',
          image: 'https://via.placeholder.com/120',
        },
        {
          name: '大阪 日郎',
          status: 'ソーラーカー',
          image: 'https://via.placeholder.com/120',
        },
        {
          name: '山田 日子',
          status: 'なるかみ',
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
