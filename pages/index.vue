<script setup>
import { login } from '~/utils/service'

const loginHandle = () => login()
</script>

<template>
  <div>
    <button @click="() => loginHandle()">
      hello
    </button>
  </div>
</template>

<style>

</style>
