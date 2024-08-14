<script setup>


</script>

<template>
  <Html class="dark">
    <header>
      <Favor />
      <ThemeSwitch />
    </header>

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

header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 2px 20px;
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
