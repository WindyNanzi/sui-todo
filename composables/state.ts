import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519"
import { genAddressSeed, getExtendedEphemeralPublicKey, getZkLoginSignature, jwtToAddress } from "@mysten/zklogin"
import { jwtDecode, type JwtPayload } from "jwt-decode"


/** 获取jwt */
export const useJwt = () => {
  return useSessionStorage('sui-jwt-token', '')
}

/** 从jwt中获取邮箱 */
export const useClaims = () => {
  const token = unref(useJwt())
  let result = ref({ email: '' })
  if (token) {
    const base64 = token.split('.')?.[1] || ''
    result = JSON.parse(atob(base64))
  }
  return result
}

/** 加盐 */
export const useSalt = () => {
  const email = unref(useClaims()).email
  const salt = hashcode(email)
  return ref(salt)
}


/** 获得解码后的jwt对象 */
export const useDecodeJwt = () => {
  const jwt = unref(useJwt())
  const payload = jwtDecode(jwt) as JwtPayload
  return ref(payload)
}


export const useJwtData = () => {
  const data = useSessionStorage('jwt-data', '')
  const _data = JSON.parse(unref(data))
  return ref(_data)
}

/** 用户是否已经通过身份校验 */
export const useIsAuthenticated = () => {
  const token = useJwt().value
  return ref(!!token)
}

/** 获取钱包地址 */
export const useWalletAddress = () => {
  const jwt = unref(useJwt())
  const email = unref(useClaims()).email
  const address = jwtToAddress(jwt, hashcode(email))
  return ref(address)
}

/** 获得最大纪元用于生成随机数 */
export const useMaxEpoch = () => {
  const epoch = unref(useJwtData())?.maxEpoch || 100
  return ref(epoch as number)
}

export const useRandomness = () => {
  const randomness = unref(useJwtData())?.randomness || ''
  return ref(randomness as string)
}


/**
 * 用于获取地址种子,地址种子用于生成密钥对
 */
export function getAddressSeed() {
  const jwt = unref(useDecodeJwt())
  const saltX = unref(useSalt())
  return genAddressSeed(BigInt(saltX!), "sub", jwt.sub!, jwt.aud!.toString()).toString();
}

/**
 * 获取 Ed25519 密钥对, 从 sessionStorage 获取 JWT，
 * 并使用 getExtendedEphemeralPublicKey 函数生成扩展的临时公钥。然后，它使用扩展的临时公钥来生成密钥对
 */
export function getEd25519Keypair() {
  const jwtData = unref(useJwtData())
  const publicKey = new Uint8Array(Object.values(jwtData.ephemeralKeyPair.keypair.publicKey));
  const secretKey = new Uint8Array(Object.values(jwtData.ephemeralKeyPair.keypair.secretKey));
  return new Ed25519Keypair({ publicKey, secretKey })
}

/**
 * 此函数用于获取部分 zkLogin 签名。此签名用于签署交易
 * @returns 
 */
export async function getPartialZkLoginSignature() {
  const keyPair = getEd25519Keypair()
  const extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(keyPair.getPublicKey())
  const verificationPayload = {
    jwt: unref(useJwt()),
    extendedEphemeralPublicKey,
    maxEpoch: unref(useMaxEpoch()),
    jwtRandomness: unref(useRandomness()),
    salt: unref(useSalt()),
    keyClaimName: "sub"
  };
  return await verifyPartialZkLoginSignature(verificationPayload)
}


/**
 * 此函数用于生成 zkLogin 签名
 * @param userSignature 
 * @returns 
 */
export async function generateZkLoginSignature(userSignature: string) {
  const partialZkLoginSignature = await getPartialZkLoginSignature()
  const addressSeed = getAddressSeed()
  const maxEpoch = unref(useMaxEpoch())
  return getZkLoginSignature({
    inputs: {
      ...partialZkLoginSignature,
      addressSeed,
    },
    maxEpoch,
    userSignature,
  });
}

/**
 * 此函数确保 JWT 有效，并通过验证部分 zkLogin 签名对用户进行身份验证
 * @param zkpRequestPayload 
 * @returns 
 */
async function verifyPartialZkLoginSignature(zkpRequestPayload: any): Promise<PartialZkLoginSignature> {
    const { data: proofResponse, error, status } = await apiCore(APP_PROVER_URL, {
      method: 'POST',
      body: {
        ...zkpRequestPayload
      },
      headers: {
        'content-type': 'application/json'
      }
    })

    if(unref(status) === 'error') {
      throw Error(unref(error)?.message)
    }

    const partialZkLoginSignature = proofResponse as unknown as PartialZkLoginSignature
    return unref(partialZkLoginSignature)
}

export const getSaltStr = async () => {
  const arr =  new Uint8Array(16)
  const newArr = await crypto.getRandomValues(arr)
  return newArr.reduce((pre, cur) => {
    return Number(cur).toString(16) + pre
  }, '')
}

export const hashcode = (s: string) => {
  var h = 0, l = s.length, i = 0;
  if (l > 0)
    while (i < l)
      h = (h << 5) - h + s.charCodeAt(i++) | 0;

  h = Math.abs(h);
  return h.toString();
}

export type PartialZkLoginSignature = Omit<
  Parameters<typeof getZkLoginSignature>['0']['inputs'],
  'addressSeed'
>;