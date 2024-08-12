import { genAddressSeed, generateNonce, generateRandomness, getExtendedEphemeralPublicKey, getZkLoginSignature, jwtToAddress } from "@mysten/zklogin"
import { jwtDecode, type JwtPayload } from "jwt-decode"
import { apiCore } from "./api"
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519"


let APP_PROVER_URL = ''
let GOOGLE_CLIENT_ID = ''
let APP_REDIRECT_URL = ''
let APP_OPENID_PROVIDER_URL = ''

export function appInit() {
  let config = useRuntimeConfig()
  APP_PROVER_URL = config.public.APP_PROVER_URL as string
  GOOGLE_CLIENT_ID = config.public.GOOGLE_CLIENT_ID as string
  APP_REDIRECT_URL = config.public.APP_REDIRECT_URL as string
  APP_OPENID_PROVIDER_URL = config.public.APP_OPENID_PROVIDER_URL as string
}


export const SUI_CURRENT_ENV: Ref<SUI_ENV> = ref('test')
export const SUI_CURRENT_NODE_URL = useFullNodeUrl(unref(SUI_CURRENT_ENV))
export const SUI_CLIENT = useClient(unref(SUI_CURRENT_NODE_URL))



/** 
 * 获取 Balance
 */
export async function getFormattedBalance(owner: string) {
  const res = await unref(SUI_CLIENT).getBalance({ owner })
  return Number(Number(res.totalBalance) / 1000_000_000).toFixed(2);
}

/**
 * 用于获取地址种子,地址种子用于生成密钥对
 */
export function getAddressSeed() {
  const jwt = decodeJwt()
  const saltX = salt()
  return genAddressSeed(BigInt(saltX!), "sub", jwt.sub!, jwt.aud!.toString()).toString();
}

/**
 * 获取 Ed25519 密钥对, 从 sessionStorage 获取 JWT，
 * 并使用 getExtendedEphemeralPublicKey 函数生成扩展的临时公钥。然后，它使用扩展的临时公钥来生成密钥对
 */
export function getEd25519Keypair() {
  const jwtData = getJwtData()
  const publicKey = new Uint8Array(Object.values(jwtData.ephemeralKeyPair.keypair.publicKey));
  const secretKey = new Uint8Array(Object.values(jwtData.ephemeralKeyPair.keypair.secretKey));
  return new Ed25519Keypair({ publicKey, secretKey })
}

/**
 * 此函数用于获取部分 zkLogin 签名。此签名用于签署交易
 * @returns 
 */
export async function getPartialZkLoginSignature() {
  const keyPair = getEd25519Keypair();
  const extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(keyPair.getPublicKey());
  const verificationPayload = {
    jwt: jwt(),
    extendedEphemeralPublicKey,
    maxEpoch: getMaxEpoch(),
    jwtRandomness: getRandomness(),
    salt: salt(),
    keyClaimName: "sub"
  };
  return await verifyPartialZkLoginSignature(verificationPayload);
}


/**
 * 此函数用于生成 zkLogin 签名
 * @param userSignature 
 * @returns 
 */
export async function generateZkLoginSignature(userSignature: string) {
  const partialZkLoginSignature = await getPartialZkLoginSignature();
  const addressSeed = getAddressSeed();
  const maxEpoch = getMaxEpoch();
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
  try {
    const proofResponse = await apiCore(APP_PROVER_URL, {
      method: 'POST',
      params: {
        ...zkpRequestPayload
      },
      headers: {
        'content-type': 'application/json'
      }
    });
    const partialZkLoginSignature = proofResponse.data as unknown as PartialZkLoginSignature;
    return partialZkLoginSignature;
  } catch (error) {
    console.log("failed to reqeust the partial sig: ", error);
    return {} as unknown as PartialZkLoginSignature;
  }
}

export async function login() {
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

  console.log({ jwtData })

  sessionStorage.setItem("jwt_data", JSON.stringify(jwtData));

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: APP_REDIRECT_URL,
    response_type: 'id_token',
    scope: 'openid email',
    nonce: nonce,
  });

  console.log({ params })
  try {
    const { data } = await apiCore(APP_OPENID_PROVIDER_URL, {}) as { data: any };
    const authUrl = `${unref(data)?.authorization_endpoint}?${params}`;
    window.location.href = authUrl;
  } catch (error) {
    console.error('Error initiating Google login:', error);
  }
}


/**
 * 此函数用于获取最大纪元。最大纪元用于生成随机
 * @returns 
 */
export function getMaxEpoch() {
  return getJwtData().getMaxEpoch
}

/**
 * 此函数用于获取随机性
 * @returns 
 */
export function getRandomness() {
  return getJwtData().randomness
}

/**
 * 函数用于根据用户通过 OAuth 进行身份验证时返回的用户电子邮件获取钱包
 * @returns 
 */
export function walletAddress() {
  const email = claims()?.email
  return jwtToAddress(jwt()!, hashcode(email));
}

/**
 * 检查用户是否已通过身份验证
 * @returns 
 */
export function isAuthenticated() {
  const token = jwt();
  return token && token !== 'null';
}

/**
 * 此函数用于获取 JWT 数据
 * @returns 
 */
function getJwtData() {
  return JSON.parse(sessionStorage.getItem("jwt_data")!);
}

/**
 * 此函数用于解码 JWT
 * @returns 
 */
function decodeJwt(): JwtPayload {
  const jwt = sessionStorage.getItem('sui-jwt-token');
  return jwtDecode(jwt!) as JwtPayload;
}

function salt() {
  const email = claims()?.email
  return hashcode(email)
}





function claims() {
  const token = jwt();
  if (token) {
    // atob() 函数用于解码使用 Base64 编码的数据字符串
    return JSON.parse(atob(token).split('.')[1])
  }
}


/**
 * 获得hash码
 * @param s 
 * @returns 
 */
function hashcode(s: string) {
  const l = s.length
  let h = 0, i = 0
  if (l > 0) {
    while (i < l) {
      h = (h << 5) - h + s.charCodeAt(i++) | 0
    }
  }
  return h.toString()
}



function jwt() {
  return sessionStorage.getItem('sui-jwt-token')
}


export type PartialZkLoginSignature = Omit<
  Parameters<typeof getZkLoginSignature>['0']['inputs'],
  'addressSeed'
>;