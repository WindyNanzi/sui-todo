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
    <TodoSetting v-if="!props.onlySwitch" />
  </header>
</template>

<style>
header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 2px 40px;
  height: 64px;
}
</style>
