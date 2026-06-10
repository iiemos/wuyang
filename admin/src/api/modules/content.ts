import { request } from '../request'
import type { ExportPayload } from '@/utils/download'

export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface ContentQuery {
  page?: number
  pageSize?: number
  keyword?: string
  status?: string
  tag?: string
  sortBy?: string
  order?: 'asc' | 'desc'
  isTop?: string
  isRecommended?: string
}

export interface ContentItem {
  id: string
  type: string
  title: string
  tag: string
  price?: string
  address?: string
  contact: string
  phone: string
  publisher?: string
  status: string
  summary?: string
  highlights?: string[]
  details?: Record<string, unknown> | null
  isTop?: boolean
  topPriority?: number
  topExpireAt?: string
  isRecommended?: boolean
  company?: string
  ownerType?: string
  images?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface ResourceCategoryItem {
  id: string
  group: string
  name: string
  status: string
  createdAt?: string
  updatedAt?: string
}

export function listContentApi(resource: string, params: ContentQuery) {
  return request<PageResult<ContentItem>>({
    url: `/admin/${resource}`,
    params
  })
}

export function getContentDetailApi(resource: string, id: string) {
  return request<ContentItem>({
    url: `/admin/${resource}/${id}`
  })
}

export function createContentApi(resource: string, data: Partial<ContentItem>) {
  return request<ContentItem>({
    url: `/admin/${resource}`,
    method: 'POST',
    data
  })
}

export function updateContentApi(resource: string, id: string, data: Partial<ContentItem>) {
  return request<ContentItem>({
    url: `/admin/${resource}/${id}`,
    method: 'PUT',
    data
  })
}

export function deleteContentApi(resource: string, id: string) {
  return request<null>({
    url: `/admin/${resource}/${id}`,
    method: 'DELETE'
  })
}

export function updateContentStatusApi(resource: string, id: string, status: string, extra: Record<string, unknown> = {}) {
  return request<ContentItem>({
    url: `/admin/${resource}/${id}/status`,
    method: 'PUT',
    data: { status, ...extra }
  })
}

export function batchContentStatusApi(resource: string, ids: string[], status: string, extra: Record<string, unknown> = {}) {
  return request<{ count: number }>({
    url: `/admin/content-batch/${resource}/status`,
    method: 'POST',
    data: { ids, status, ...extra }
  })
}

export function batchDeleteContentApi(resource: string, ids: string[]) {
  return request<{ count: number }>({
    url: `/admin/content-batch/${resource}/delete`,
    method: 'POST',
    data: { ids }
  })
}

export function exportContentApi(resource: string, params: ContentQuery) {
  return request<ExportPayload>({
    url: `/admin/content-export/${resource}`,
    params
  })
}

export function updateContentTopApi(id: string, data: { isTop: boolean; topPriority?: number; topExpireAt?: string | null }) {
  return request<ContentItem>({
    url: `/admin/content/${id}/top`,
    method: 'PUT',
    data
  })
}

export const updateRecruitmentTopApi = updateContentTopApi

export function updateHouseRecommendApi(id: string, data: { isRecommended: boolean }) {
  return request<ContentItem>({
    url: `/admin/houses/${id}/recommend`,
    method: 'PUT',
    data
  })
}

export function updateContentRecommendApi(id: string, data: { isRecommended: boolean }) {
  return request<ContentItem>({
    url: `/admin/content/${id}/recommend`,
    method: 'PUT',
    data
  })
}

export function listFeaturedContentApi(params: ContentQuery) {
  return request<PageResult<ContentItem>>({
    url: '/admin/featured',
    params
  })
}

export function listCategoriesApi(params: { page?: number; pageSize?: number; group?: string }) {
  return request<PageResult<ResourceCategoryItem>>({
    url: '/admin/categories',
    params
  })
}

export function createCategoryApi(data: Pick<ResourceCategoryItem, 'group' | 'name' | 'status'>) {
  return request<ResourceCategoryItem>({
    url: '/admin/categories',
    method: 'POST',
    data
  })
}

export function updateCategoryApi(id: string, data: Partial<Pick<ResourceCategoryItem, 'group' | 'name' | 'status'>>) {
  return request<ResourceCategoryItem>({
    url: `/admin/categories/${id}`,
    method: 'PUT',
    data
  })
}

export function deleteCategoryApi(id: string) {
  return request<null>({
    url: `/admin/categories/${id}`,
    method: 'DELETE'
  })
}
