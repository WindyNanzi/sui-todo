<script setup>
const isDark = ref(true)

function toggleDark() {
  const html = document.querySelector('html')

  if (unref(isDark)) {
    html.className = ''
  }
  else {
    html.className = 'dark'
  }

  isDark.value = !unref(isDark)
}

/**
 * 检测用户的系统是否被开启了动画减弱功能
 * @link https://developer.mozilla.org/zh-CN/docs/Web/CSS/@media/prefers-reduced-motion
 */
function isReducedMotion() {
  return window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true
}

function handleChange(e) {
  const willDark = !unref(isDark)
  // 浏览器新特性不支持 或者 开启了动画减弱
  if (!document.startViewTransition || isReducedMotion()) {
    toggleDark()
    return
  }

  // 开始加载 ViewTransition 扩散动画
  const transition = document.startViewTransition(() => {
    toggleDark()
  })

  // 传入点击事件，从点击处开始扩散。否则，从右上角开始扩散
  const { x, y } = e?.getBoundingClientRect()

  const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
  void transition.ready.then(() => {
    const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`]
    document.documentElement.animate(
      {
        clipPath: willDark ? clipPath : [...clipPath].reverse(),
      },
      {
        duration: 500,
        easing: 'ease-in',
        pseudoElement: willDark ? '::view-transition-new(root)' : '::view-transition-old(root)',
      },
    )
  })
}
</script>

<template>
  <ElIcon class="theme-icon" @click="() => handleChange($el)">
    <Icon v-show="isDark" name="i-line-md-moon-filled-alt-loop" />
    <Icon v-show="!isDark" name="i-line-md-moon-to-sunny-outline-loop-transition" />
  </ElIcon>
</template>

<style lang="scss">
.theme-icon {
  cursor: pointer;
  font-size: 20px;
  border: 1px solid rgba(100, 100, 100 , 0.5);
  padding: 6px;
  border-radius: 50%;
}
</style>
