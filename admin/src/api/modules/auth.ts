import { clearToken, request, setToken } from '../request'

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  admin?: Record<string, unknown>
  user?: Record<string, unknown>
}

export async function loginApi(payload: LoginPayload) {
  const data = await request<LoginResult>({
    url: '/admin/auth/login',
    method: 'POST',
    data: payload
  })
  setToken(data.token)
  return data
}

export function profileApi() {
  return request<Record<string, unknown>>({
    url: '/admin/auth/profile'
  })
}

export function logoutApi() {
  clearToken()
}
