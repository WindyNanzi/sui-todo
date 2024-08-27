/** 获取jwt */
export const useJwt = () => {
  return useSessionStorage('sui-jwt-token', '')
}


/** 用户是否已经通过身份校验 */
export const useIsAuthenticated = () => {
  const token = useJwt().value
  return ref(!!token)
}

/** 获取钱包地址 */
export const useWalletAddress = () => {
  const state = ENOKI_FLOW.$zkLoginState.get()
  return state.address || ''
}
