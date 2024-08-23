import mitt from "mitt"

export const SUI_CURRENT_ENV: Ref<SUI_ENV> = ref('dev')
export const SUI_CURRENT_NODE_URL = computed(() => unref(useFullNodeUrl(unref(SUI_CURRENT_ENV)))) 
export const SUI_CLIENT = computed(() => unref(useClient(unref(SUI_CURRENT_NODE_URL)))) 

export const PACKAGE_ID = computed(() => {
  const env = unref(SUI_CURRENT_ENV)
  if(env === 'dev') {
    return '0x07df68b720fcb2070ced97096dc59b7f5d8b0b52ca16cb2e3fdb67bec48a841f'
  } else if(env === 'test') {
    return '0x4c4bbf49cb8924406e5b8f80c96a15ff4d8308785f8a5f2e2696fbdd5b3d2ce9'
  }
})

export const APP_PROVER_URL = computed(() => {
  const env = unref(SUI_CURRENT_ENV)
  if(env === 'dev') {
    return 'https://prover-dev.mystenlabs.com/v1'
  }else {
    return 'https://prover.mystenlabs.com/v1'
  }
})


export const emitter = mitt()
export const GOOGLE_CLIENT_ID = '557707932211-ihdomp72ajur19ts091ijet2ale3fkdm.apps.googleusercontent.com'
export const APP_REDIRECT_URL = process.env.NODE_ENV  === 'development'
  ? 'http://localhost:3003'
  : 'https://sui-todo.netlify.app'