<script setup>
const showSkeleton = ref(true)
</script>

<template>
  <div class="login-box">
    <div class="container">
      <ElSkeleton v-if="showSkeleton" animated>
        <template #template>
          <ElSkeletonItem class="post-image" variant="image" />
        </template>
      </ElSkeleton>
      <ElImage v-show="!showSkeleton" class="post-image" src="/plan.jpg" @load="showSkeleton = false" />

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
  // filter: blur(4px);
  border-radius: 10px;
  transform: translateY(-50px);
}
</style>
