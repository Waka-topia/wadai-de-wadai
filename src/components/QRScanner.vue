<template>
    <div>
      <h2>QRコードをスキャンしてください</h2>
      <video ref="video" autoplay></video>
    </div>
  </template>
  
  <script>
  export default {
    mounted() {
      const video = this.$refs.video;
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          video.srcObject = stream;
        });
    }
  };
  </script>
  
  <style>
  video {
    width: 100%;
    height: auto;
  }
  </style>
  