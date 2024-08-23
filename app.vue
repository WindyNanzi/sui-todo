<script setup>
useHead({
  title: 'sui todo',
  meta: [
    {
      name: 'description',
      content: 'sui todo',
    },
  ],
  link: [
    { rel: 'icon', type: 'image/png', href: '/favicon.png' },
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

/* 隐藏默认滚动条 */
::-webkit-scrollbar {
  width: 6px;
  /* 滚动条宽度 */
}

/* 滚动条轨道 */
::-webkit-scrollbar-track {
  background-color: transparent;
  /* 轨道背景透明 */
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  background-color: rgba(128, 128, 128, 0.4);
  /* 半透明的深灰色 */
  border-radius: 3px;
  /* 边框圆角 */
}
</style>
