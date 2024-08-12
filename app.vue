<script setup>
useHead({
  title: 'sui todo',
  meta: [
    {
      name: 'description',
      content: 'sui todo',
    },
  ],
})

appInit()
onMounted(() => {
  console.log(isAuthenticated())
})
</script>

<template>
  <nuxt-page />
</template>
