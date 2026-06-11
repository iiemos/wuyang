import axios, { type AxiosRequestConfig } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const TOKEN_KEY = 'qingning_admin_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

const service = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000
})

service.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

service.interceptors.response.use(
  (response) => response,
  (error) => {
    // 登录态失效统一清理并回到登录页，避免停留页面反复报错
    if (error.response?.status === 401) {
      clearToken()
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
      }
    }
    const message = error.response?.data?.error || error.response?.data?.message || error.message || '请求失败'
    return Promise.reject(new Error(message))
  }
)

export async function request<T>(config: AxiosRequestConfig) {
  const response = await service.request(config)
  const payload = response.data
  return (payload && Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : payload) as T
}
