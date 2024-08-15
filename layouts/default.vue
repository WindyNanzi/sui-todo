<script setup>
const onlySwitch = ref(true)
onMounted(() => {
  onlySwitch.value = !unref(useIsAuthenticated());
})
</script>

<template>
  <Html class="dark">
    <TodoHeader :onlySwitch="onlySwitch"/>

    <div class="nuxt-content">
      <slot />
    </div>

  </Html>
</template>

<style lang="scss">
#__nuxt {
  display: flex;
  height: 100%;
  flex-direction: column;

  .nuxt-content {
    flex: 1;
  }
}


/** Animated Theme Toggle */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

.dark::view-transition-old(root) {
  z-index: 1;
}

.dark::view-transition-new(root) {
  z-index: 999;
}

::view-transition-old(root) {
  z-index: 999;
}

::view-transition-new(root) {
  z-index: 1;
}
</style>
