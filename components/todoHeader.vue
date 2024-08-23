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
    <NuxtLink to="https://github.com/WindyNanzi/sui-todo" target="_blank">
      <ElButton circle style="font-size: 20px; margin-right: 12px;">
        <Icon name="i-line-md-github-loop" />
      </ElButton>
    </NuxtLink>
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
