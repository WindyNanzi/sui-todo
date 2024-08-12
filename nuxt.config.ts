// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  devServer: {
    port: 3003
  },
  modules: [
    '@vueuse/nuxt',
  ],
  runtimeConfig: {
    public: {
      GOOGLE_CLIENT_ID: '557707932211-ihdomp72ajur19ts091ijet2ale3fkdm.apps.googleusercontent.com',
      APP_PROVER_URL: "https://prover-dev.mystenlabs.com/v1", // 证明者 URL 用于验证部分 zkLogin 签名。证明者 URL 由 zkLogin 提供。 
      APP_REDIRECT_URL: "http://localhost:3003", // 重定向 URL 用于在身份验证后重定向用户。它还用于在用户签署交易后重定向用户。
      APP_OPENID_PROVIDER_URL: "https://accounts.google.com/.well-known/openid-configuration", // OpenID 提供商 URL。OpenID 提供程序 URL 用于获取授权终结点。授权端点用于对用户进行身份验证。
      APP_FULLNODE_URL: "https://fullnode.testnet.sui.io:443",
      APP_PACKAGE_ID: "0x1c12dfe9c2e2438156fedd844afeb1c1bbc0aed48c60d83b98ed91d0e2055427",
    }
  }
})
