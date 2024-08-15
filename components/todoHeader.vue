<script setup>
const props = defineProps({
  onlySwitch: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <header>
    <Favor v-if="!props.onlySwitch" />
    <ChangeTheme />
  </header>
</template>

<style>
header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 2px 20px;
  height: 64px;
}
</style>
