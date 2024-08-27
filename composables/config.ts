import { EnokiFlow } from "@mysten/enoki"
import mitt from "mitt"

export const SUI_CURRENT_ENV: Ref<SUI_ENV> = ref('dev')
export const SUI_CURRENT_NODE_URL = computed(() => unref(useFullNodeUrl(unref(SUI_CURRENT_ENV)))) 
export const SUI_CLIENT = computed(() => unref(useClient(unref(SUI_CURRENT_NODE_URL)))) 

export const PACKAGE_ID = computed(() => {
  const env = unref(SUI_CURRENT_ENV)
  if(env === 'dev') {
    return '0xa685bf75db6167bce1ebc63370be807d38a73bf9209af893e7f13839487f341d'
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

export const ENOKI_API_KEY = 'enoki_public_ba879152b8d32d35c9f637e821dc89ea'
export const ENOKI_FLOW = new EnokiFlow({ apiKey: ENOKI_API_KEY });