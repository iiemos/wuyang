import { request } from '../request'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const API_ORIGIN = API_BASE_URL.startsWith('http') ? API_BASE_URL.replace(/\/api\/?$/, '') : ''

export interface UploadResult {
  url: string
  filename: string
}

export function assetUrl(url?: string | null) {
  if (!url) return ''
  if (/^(https?:)?\/\//.test(url) || url.startsWith('data:')) return url
  if (!url.startsWith('/')) return url
  return `${API_ORIGIN}${url}`
}

export function uploadFileApi(file: File) {
  const data = new FormData()
  data.append('file', file)
  return request<UploadResult>({
    url: '/uploads',
    method: 'POST',
    data,
    headers: {}
  })
}
