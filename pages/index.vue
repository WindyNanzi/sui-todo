<script setup>

</script>

<template>
  <main class="main">

    <div class="input-container">
      <TodoInput />
    </div>
  </main>
</template>

<style lang="scss" scoped>
main {
  width: 100%;
  height: 100%;
}

.input-container {
  position: absolute;
  bottom: 100px;
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
