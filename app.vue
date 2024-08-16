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

const layoutName = ref('default')

onMounted(() => {
  const params = new URLSearchParams(window.location.hash.slice(1))
  const key = 'id_token'
  if (params.has(key)) {
    const jwt = params.get(key)
    sessionStorage.setItem('sui-jwt-token', jwt)
    location.hash = ''
  }

  if (!unref(useJwt())) {
    navigateTo('/login')
  }
})
</script>

<template>
  <nuxt-layout :name="layoutName">
    <nuxt-page />
  </nuxt-layout>
</template>

<style lang="scss">
html {
  height: 100%;

}
body {
  margin: 0;
  height: 100%;
}

:focus-visible {
  outline: none;
}


div, span, p {
  caret-color: transparent;
}
</style>
