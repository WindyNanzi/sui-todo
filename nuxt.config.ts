// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  devServer: {
    port: 3003
  },
  modules: [
    '@vueuse/nuxt',
    '@element-plus/nuxt',
    '@nuxt/icon',
  ],
  elementPlus: { 
    themes: ['dark'],
  },
  runtimeConfig: {
    public: {
      
    }
  }
})
