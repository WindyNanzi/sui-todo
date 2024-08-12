/**
 * 请求拦截封装
 * @param {*} url 
 * @param {*} params 
 * @returns 
 */
export const apiCore = (url: string, params:any) => {
  const config = useRuntimeConfig()
  const app = useNuxtApp()

  return useFetch(url, {
    baseURL: '',
    ...params,
    onRequest({ options }) {
      let token = ''
      // 使用 pinia 持久化插件后，使用 cookie 进行的持久化，则无需客户端判断
      if (import.meta.client) {
        token = localStorage.getItem('token') || ''
      }
      options.headers = {
        // Authorization: `Bearer ${token}`,
        ...options.headers
      }
    },
    onResponse({ response }){
      // console.log(response)
    },
    // 响应出现问题的时候，目前这部分仅仅用于模拟
    onRequestError({ error }) {
      console.log('检测到错误')
      const message = error?.message || '服务器未知错误'
      if(import.meta.client) {
        // ElMessage.error(message)
      } else {
        // 需要经过一层包裹才能跳转
        app.runWithContext(() => {
          navigateTo({
            path: '/Error',
            query: {
              message,
            }
          })
        })
      }
    }
  })
}


export const GetApi = (url: string, params:any) => {
  return new Promise((resolve, reject) => {
    return apiCore(url, {
      method: 'GET',
      ...params
    }).then(res => {
      resolve(res.data.value)
    }).catch(err => {
      reject(err)
    })
  })
}