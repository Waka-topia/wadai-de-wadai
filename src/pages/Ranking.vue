<template>
    <div class="ranking">
        <h1>ランキング</h1>
        <p>ここではスタンプの獲得数ランキングを確認できます。</p>
        <div class="ranking-list">
        <div class="ranking-item">
            <h2>1位</h2>
            <p>0</p>
        </div>
        <div class="ranking-item">
            <h2>2位</h2>
            <p>0</p>
        </div>
        <div class="ranking-item">
            <h2>3位</h2>
            <p>0</p>
        </div>
        </div>
    </div>
    <propColor></propColor>
</template>

<script>
import propColor from "@/components/prop-color.vue";

export default {
    name: "Ranking",
    components: {
        propColor,
    },
};
</script>