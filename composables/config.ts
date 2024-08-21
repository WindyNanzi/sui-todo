import mitt from "mitt"

export const SUI_CURRENT_ENV: Ref<SUI_ENV> = ref('dev')
export const SUI_CURRENT_NODE_URL = computed(() => unref(useFullNodeUrl(unref(SUI_CURRENT_ENV)))) 
export const SUI_CLIENT = computed(() => unref(useClient(unref(SUI_CURRENT_NODE_URL)))) 

export const PACKAGE_ID = computed(() => {
  const env = unref(SUI_CURRENT_ENV)
  if(env === 'dev') {
    return '0xf495da22740f7262fb98688677ddcd8ddd3831d998daa9868089cd9ac5225e7e'
  } else {
    return '0xf495da22740f7262fb98688677ddcd8ddd3831d998daa9868089cd9ac5225e7e'
  }
})

export const emitter = mitt()
export const GOOGLE_CLIENT_ID = '557707932211-ihdomp72ajur19ts091ijet2ale3fkdm.apps.googleusercontent.com'
export const APP_PROVER_URL = "https://prover-dev.mystenlabs.com/v1"
export const APP_REDIRECT_URL = "http://localhost:3003"