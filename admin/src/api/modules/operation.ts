import { request } from '../request'

export interface AdItem {
  id: string
  positionId: string
  title: string
  image?: string
  linkType: string
  linkValue: string
  status: string
  startAt?: string
  endAt?: string
}

export interface AdPositionItem {
  id: string
  name: string
  scene: string
  pv: number
  uv: number
  ctr: string
  ads: AdItem[]
}

export interface TopOrderItem {
  id: string
  targetId: string
  targetTitle: string
  buyer: string
  amount: string
  status: string
  startedAt: string
  expiredAt: string
  createdAt: string
}

export function listAdPositionsApi() {
  return request<AdPositionItem[]>({
    url: '/admin/ad-positions'
  })
}

export function createAdPositionApi(data: Partial<AdPositionItem>) {
  return request<AdPositionItem>({
    url: '/admin/ad-positions',
    method: 'POST',
    data
  })
}

export function updateAdPositionApi(id: string, data: Partial<AdPositionItem>) {
  return request<AdPositionItem>({
    url: `/admin/ad-positions/${id}`,
    method: 'PUT',
    data
  })
}

export function deleteAdPositionApi(id: string) {
  return request<null>({
    url: `/admin/ad-positions/${id}`,
    method: 'DELETE'
  })
}

export function addAdApi(positionId: string, data: Partial<AdItem>) {
  return request<AdItem>({
    url: `/admin/ad-positions/${positionId}/ads`,
    method: 'POST',
    data
  })
}

export function updateAdApi(id: string, data: Partial<AdItem>) {
  return request<AdItem>({
    url: `/admin/ads/${id}`,
    method: 'PUT',
    data
  })
}

export function deleteAdApi(id: string) {
  return request<null>({
    url: `/admin/ads/${id}`,
    method: 'DELETE'
  })
}

export function listTopOrdersApi() {
  return request<TopOrderItem[]>({
    url: '/admin/top-orders'
  })
}
