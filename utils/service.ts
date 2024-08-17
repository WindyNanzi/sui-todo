import { generateNonce, generateRandomness } from "@mysten/zklogin"
import { Transaction } from '@mysten/sui/transactions'
import { apiCore } from "./api"
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519"
import mitt from 'mitt'
import type { SignatureWithBytes } from "@mysten/sui/cryptography"


export const SUI_CURRENT_ENV: Ref<SUI_ENV> = ref('test')
export const SUI_CURRENT_NODE_URL = computed(() => unref(useFullNodeUrl(unref(SUI_CURRENT_ENV)))) 
export const SUI_CLIENT = computed(() => unref(useClient(unref(SUI_CURRENT_NODE_URL)))) 
export const emitter = mitt()

/** 
 * 获取 Balance
 */
export async function getFormattedBalance(owner: string) {
  const res = await unref(SUI_CLIENT).getBalance({ owner })
  return Number(Number(res.totalBalance) / 1000_000_000).toFixed(2);
}


export async function login() {
  const config = useRuntimeConfig()
  const GOOGLE_CLIENT_ID = config.public.GOOGLE_CLIENT_ID as string
  const APP_REDIRECT_URL = config.public.APP_REDIRECT_URL as string
  const APP_OPENID_PROVIDER_URL = config.public.APP_OPENID_PROVIDER_URL as string

  const instance = ElLoading.service({
    fullscreen: true,
    text: 'Loading...',
  })
  const { epoch } = await unref(SUI_CLIENT).getLatestSuiSystemState();

  const maxEpoch = Number(epoch) + 2222;
  const ephemeralKeyPair = new Ed25519Keypair();
  const randomness = generateRandomness();
  const nonce = generateNonce(ephemeralKeyPair.getPublicKey(), maxEpoch, randomness);
  const jwtData = {
    maxEpoch,
    nonce,
    randomness,
    ephemeralKeyPair,
  };


  sessionStorage.setItem("jwt_data", JSON.stringify(jwtData));

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: APP_REDIRECT_URL,
    response_type: 'id_token',
    scope: 'openid email',
    nonce: nonce,
  });

  try {
    const { data } = await apiCore(APP_OPENID_PROVIDER_URL, {}) as { data: any };
    const authUrl = `${unref(data)?.authorization_endpoint}?${params}`;
    nextTick(() => instance.close())
    window.location.href = authUrl;
  } catch (error) {
    console.error('Error initiating Google login:', error);
  } finally {
    nextTick(() => instance.close())
  }
}

export async function getFeesByAddress(address: string) {
  const url = `https://faucet.${ unref(SUI_CURRENT_ENV) }net.sui.io:443/gas`
  return apiCore(url, {
    method: 'POST',
    mode:'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      FixedAmountRequest: {
        recipient: address
      }
    }), 
  }).then(res => res?.data)
  .catch(err => ElMessage.error(err))
}


export  function makeMoveCall(txtData: any, txb: Transaction) {
  const client = unref(SUI_CLIENT)
  const keypairs = getEd25519Keypair()
  const sender = unref(useWalletAddress())
  let tmpBytes = ''
  const instance = ElLoading.service({
    fullscreen: true,
    text: 'Loading...',
  })

  txb.setSender(sender)
  txb.moveCall(txtData)

  return txb.sign({
    client,
    signer: keypairs,
  }).then((res) => {
    const { bytes, signature } = res;
    tmpBytes = bytes
    return generateZkLoginSignature(signature)
  }).then(res => {
    return client.executeTransactionBlock({
      transactionBlock: tmpBytes,
      signature: res,
      options: {
        showBalanceChanges: true,
        showEvents: true,
      }
    })
  }).catch(err => {
    ElMessage.error(err?.message)
  }).finally(() => {
    instance.close()
  })
}
  

interface TodoItem {
  item: string,
  date: number,
  width: number,
  background: string,
}


export async function addTodoItem(params: TodoItem) {
  const txb = new Transaction()
  const config = useRuntimeConfig()
  const packageId = config.public.APP_PACKAGE_ID as string
  const { item='', date= new Date().getTime(), width=0, background ='' } = params
  
  const objs = {
    package: packageId,
    module: 'todo',
    function: 'add',
    arguments: [
      txb.pure.string(item),
      txb.pure.u64(date),
      txb.pure.u8(width),
      txb.pure.string(background),
    ]
  }

  return makeMoveCall(objs, txb)
}
