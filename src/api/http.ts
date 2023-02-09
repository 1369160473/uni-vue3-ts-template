import axios from 'axios'

import { getFullURL } from '@/utils/http'
import { userApi } from '@/api'
import { user } from '@/store'
const store = user()
const instance = axios.create({
  // Web 侧可以通过 vite.config.js 中的 proxy 配置，指定代理
  // 小程序APP里需写完整路径，如 https://service-rbji0bev-1256505457.cd.apigw.tencentcs.com/release
  // 可使用条件编译,详见 https://uniapp.dcloud.io/tutorial/platform.html#preprocessor
  // #ifdef H5
  // baseURL: import.meta.env.VITE_APP_AXIOS_BASE_URL,
  // #endif
  // #ifndef H5
  // @ts-ignore
  // #endif
  // baseURL: 'http://69.234.230.211:9520',
  // baseURL: 'http://52.82.48.147:9531',
  baseURL: 'https://api.cloud.ugee.com.cn',
  
  adapter(config) {
    const { url, method, data, params, headers, baseURL, paramsSerializer } =
      config
	console.log('baseURLbaseURL', baseURL)
    return new Promise((resolve, reject) => {
      uni.request({
        method: method!.toUpperCase() as any,
        url: getFullURL(baseURL || '', url!, params, paramsSerializer),
        header: headers,
        data,
        dataType: 'json',
        responseType: config.responseType,
        success: (res: any) => {
          resolve(res)
        },
        fail: (err: any) => {
          reject(err)
        }
      })
    })
  }
})

/**
 * 请求拦截
 */
instance.interceptors.request.use((config) => {
  const { method, params } = config
  // 附带鉴权的token
  const headers: any = {
    miniToken: uni.getStorageSync('notetoken'),
	userId: uni.getStorageSync('noteUserInfo').id,
	'Content-type':'application/json',
  }
  // 不缓存get请求
  if (method === 'get') {
    headers['Cache-Control'] = 'no-cache'
  }
  if (method === 'post') {
    headers['Content-type'] = 'application/json;charset=UTF-8'
  }
  // delete请求参数放入body中
  if (method === 'delete') {
    headers['Content-type'] = 'application/json;'
    Object.assign(config, {
      data: params,
      params: {}
    })
  }

  return {
    ...config,
    headers
  }
})

/**
 * 响应拦截
 */
instance.interceptors.response.use((v) => {
  if (v.data?.code === 401) {
    uni.removeStorageSync('notefreshToken')
    uni.removeStorageSync('notetoken')
    uni.removeStorageSync('noteUserInfo')
	setTimeout(() => {
		uni.navigateTo({
			url:'../login/index'
		})
	}, 1000)
    return v.data
  }

  // @ts-ignore
  if ((v.status || v.statusCode) === 200) {
    return v.data
  }
  // alert(v.statusText, '网络错误')
  return Promise.reject(v)
})

export default instance
