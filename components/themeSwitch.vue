<script setup>
let isDark = ref(true)

let toggleDark = () => {
  const html = document.querySelector('html')

  if(unref(isDark)) {
    html.className = ''
  } else {
    html.className = 'dark'
  }

  isDark.value = !unref(isDark)
}

/**
 * 检测用户的系统是否被开启了动画减弱功能
 * @link https://developer.mozilla.org/zh-CN/docs/Web/CSS/@media/prefers-reduced-motion
 */
const isReducedMotion = () => {
  return window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true
}

const handleChange = (_, e) => {
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
  <ElSwitch 
    class="theme-switch" 
    :model-value="isDark" 
    @change="(val) => handleChange(val, $el)" 
    :active-action-icon="ElIconMoon"
    :inactive-action-icon="ElIconSunny" 
    size="default" 
  />
</template>

<style lang="scss">
.theme-switch {
  
}
</style>