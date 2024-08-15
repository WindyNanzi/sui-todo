<script setup>
import { login } from '~/utils/service'

const loginHandle = () => login()

const list = [
  { icon: 'Google', text: 'Google' },
]
</script>

<template>
  <div class="platform-list">
    <div v-for="(item, i) in list" :key="i" flex class="platform-item" @click="loginHandle">
      <ElImage class="platform-icon" :src="`/${item.icon}.svg`" />
      <ElText>Login with {{ item.text }}</ElText>
      <Icon name="i-line-md-external-link" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.platform-item {
  display: flex;
  align-items: center;
  min-width: 180px;
  justify-content: space-between;
  padding: 5px 20px;
  border: 1px solid rgba(100, 100,100, .5);
  border-radius: 5px;
  cursor: pointer;
}

.platform-icon {
  position: relative;
  width: 28px;
  height: 28px;
}
</style>
