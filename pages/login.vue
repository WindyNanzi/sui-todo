<script setup>

</script>

<template>
  <div class="login-box">
    <div class="container">
      <ElImage class="post-image" src="/plan.jpg"/>
      
      <PlatformList />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-box {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
}

.container {
  width: 700px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.post-image {
  width: 700px;
  height: 468px;
  filter: blur(4px);
  border-radius: 10px;
  transform: translateY(-50px);
}
</style>

