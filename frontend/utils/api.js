const env = typeof process !== 'undefined' && process.env ? process.env : {}
const REQUEST_TIMEOUT = 15000
// const DEFAULT_API_BASE_URL = 'http://127.0.0.1:3000/api'
const DEFAULT_API_BASE_URL = '/api'
const categoryFallbacks = {
  jobs: { label: '招聘', icon: 'lucide:job-tie', desc: '全职兼职临时工' },
  houses: { label: '房源', icon: 'lucide:house-market', desc: '出租出售转让' },
  convenience: { label: '便民', icon: 'lucide:hand-heart', desc: '拼车求助打听' },
  yellowPages: { label: '服务', icon: 'lucide:service-paint', desc: '本地商家服务' },
  secondhand: { label: '二手', icon: 'lucide:secondhand-clothes', desc: '闲置转让自提' },
  news: { label: '资讯', icon: 'lucide:newspaper', desc: '本地新鲜事' }
}

function isMiniProgramRuntime() {
  return typeof wx !== 'undefined' && typeof wx.request === 'function'
}

function normalizeBaseUrl(url) {
  return String(url || '').replace(/\/+$/, '')
}

function getDefaultApiBaseUrl() {
  return DEFAULT_API_BASE_URL
}

const API_BASE_URL = normalizeBaseUrl(
  env.VITE_API_BASE_URL || env.VUE_APP_API_BASE_URL || env.UNI_APP_API_BASE_URL || getDefaultApiBaseUrl()
)
const API_ORIGIN = API_BASE_URL.startsWith('http') ? API_BASE_URL.replace(/\/api\/?$/, '') : ''
const shouldSkipHttpAsset = isMiniProgramRuntime() && API_ORIGIN.startsWith('http://')

function toQuery(params) {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  if (!entries.length) return ''
  return `?${entries.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&')}`
}

export function assetUrl(url) {
  if (!url || typeof url !== 'string') return ''
  if (url.startsWith('data:')) return url
  if (/^https?:\/\//.test(url)) return shouldSkipHttpAsset && url.startsWith('http://') ? '' : url
  if (/^\/\//.test(url)) return url
  if (!url.startsWith('/')) return url
  return shouldSkipHttpAsset ? '' : `${API_ORIGIN}${url}`
}

function normalizeCategory(item) {
  if (!item || !item.type) return item
  const fallback = categoryFallbacks[item.type] || { label: item.type, icon: 'lucide:map-pin', desc: '本地信息' }
  return {
    ...fallback,
    ...item,
    label: item.label || fallback.label,
    icon: item.icon || fallback.icon,
    desc: item.desc || fallback.desc
  }
}

function normalizeListing(item) {
  if (!item) return item
  const images = Array.isArray(item.images) ? item.images.map(assetUrl).filter(Boolean) : []
  const details = item.details && typeof item.details === 'object' && !Array.isArray(item.details) ? item.details : {}
  return {
    ...details,
    ...item,
    details,
    images,
    summary: item.summary || '暂无详细描述，请联系发布人了解更多信息。',
    address: item.address || '本地',
    price: item.price || '价格面议',
    highlights: Array.isArray(item.highlights) ? item.highlights : []
  }
}

function normalizeBanner(item) {
  if (!item) return item
  return {
    ...item,
    image: assetUrl(item.image)
  }
}

function buildUrl(path) {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

function buildError(message, detail, url) {
  const error = new Error(message)
  error.detail = detail
  error.url = url
  return error
}

function request(path, options = {}) {
  const url = buildUrl(path)
  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method: options.method || 'GET',
      data: options.data,
      timeout: options.timeout || REQUEST_TIMEOUT,
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data && res.data.data)
          return
        }
        reject(buildError((res.data && res.data.error) || `接口请求失败：${res.statusCode}`, res.data, url))
      },
      fail: (error) => {
        reject(buildError(`接口请求失败，请确认服务端已启动：${url}`, error, url))
      }
    })
  })
}

export function uploadImage(filePath) {
  const url = buildUrl('/uploads')
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url,
      filePath,
      name: 'file',
      timeout: REQUEST_TIMEOUT,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const payload = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
            const data = payload && payload.data
            resolve(data ? { ...data, url: assetUrl(data.url) } : data)
          } catch (error) {
            reject(buildError('图片上传响应解析失败', error, url))
          }
          return
        }
        reject(buildError(`图片上传失败：${res.statusCode}`, res.data, url))
      },
      fail: (error) => {
        reject(buildError(`图片上传失败，请确认服务端已启动：${url}`, error, url))
      }
    })
  })
}

export function getHomeData() {
  return request('/home').then((data) => ({
    ...data,
    banners: ((data && data.banners) || []).map(normalizeBanner),
    categories: ((data && data.categories) || []).map(normalizeCategory).filter(Boolean),
    featured: ((data && data.featured) || []).map(normalizeListing),
    news: ((data && data.news) || []).map(normalizeListing)
  }))
}

export function getCategories() {
  return request('/categories').then((items) => (items || []).map(normalizeCategory).filter(Boolean))
}

export function getListings(params = {}) {
  return request(`/listings${toQuery(params)}`).then((data) => ({
    ...data,
    items: ((data && data.items) || []).map(normalizeListing)
  }))
}

export function getListingDetail(id) {
  return request(`/listings/${id}`).then(normalizeListing)
}

export function getListingPreview(id, token) {
  return request(`/listings/${id}/preview${toQuery({ token })}`).then(normalizeListing)
}

export function createListing(data) {
  return request('/listings', {
    method: 'POST',
    data
  }).then(normalizeListing)
}

export function getMessages() {
  return request('/messages')
}

export function getProfile() {
  return request('/profile')
}

export function getProfilePublications() {
  return request('/profile/publications').then((items) => (items || []).map(normalizeListing))
}

export function getProfileFavorites() {
  return request('/profile/favorites').then((items) => (items || []).map(normalizeListing))
}

export function getProfileViews() {
  return request('/profile/views').then((items) => (items || []).map(normalizeListing))
}

export function getProfileApplications() {
  return request('/profile/applications').then((items) => (items || []).map(normalizeListing))
}

export function getProfileReports() {
  return request('/profile/reports')
}

export function toggleFavorite(id) {
  return request(`/favorites/${id}`, { method: 'POST' })
}

export function applyJob(id) {
  return request(`/applications/${id}`, { method: 'POST' })
}

export function createReport(data) {
  return request('/reports', { method: 'POST', data })
}
