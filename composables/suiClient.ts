import { SuiClient } from "@mysten/sui/client"

export type SUI_ENV = 'test' | 'dev' | 'main'
type SUI_FULL_NODE_URL = `https://fullnode.${ SUI_ENV }net.sui.io:443`

export const useFullNodeUrl = (env: SUI_ENV = 'test') => {
  return ref<SUI_FULL_NODE_URL>(`https://fullnode.${env}net.sui.io:443`)
}


export const useClient = (url: SUI_FULL_NODE_URL) => computed(() => new SuiClient({ url }))