import { request } from '../request'
import type { PageResult } from './content'
import type { ExportPayload } from '@/utils/download'

export interface UserItem {
  id: string
  username?: string
  nickname: string
  phone?: string
  email?: string
  status: string
  publishCount: number
  favoriteCount: number
  viewCount: number
  registeredAt?: string
  lastLoginAt?: string
  createdAt?: string
  roles?: Array<{ id: string; name: string; code: string }>
}

export interface CertificationItem {
  id: string
  applicant: string
  type: string
  phone: string
  status: string
  material?: string
  rejectReason?: string
  submittedAt?: string
}

export interface ReportItem {
  id: string
  targetId: string
  targetTitle: string
  reason: string
  reporter: string
  status: string
  result?: string
  createdAt?: string
}

export function listUsersApi(params: Record<string, unknown>) {
  return request<PageResult<UserItem>>({
    url: '/admin/users',
    params
  })
}

export function getUserApi(id: string) {
  return request<UserItem>({
    url: `/admin/users/${id}`
  })
}

export function updateUserStatusApi(id: string, status: string) {
  return request<UserItem>({
    url: `/admin/users/${id}/status`,
    method: 'PUT',
    data: { status }
  })
}

export function batchUserStatusApi(ids: string[], status: string) {
  return request<{ count: number }>({
    url: '/admin/users/batch/status',
    method: 'POST',
    data: { ids, status }
  })
}

export function exportUsersApi(params: Record<string, unknown>) {
  return request<ExportPayload>({
    url: '/admin/users/export',
    params
  })
}

export function listCertificationsApi(params: Record<string, unknown>) {
  return request<PageResult<CertificationItem>>({
    url: '/admin/certifications',
    params
  })
}

export function updateCertificationApi(id: string, data: Record<string, unknown>) {
  return request<CertificationItem>({
    url: `/admin/certifications/${id}`,
    method: 'PUT',
    data
  })
}

export function listReportsApi(params: Record<string, unknown>) {
  return request<PageResult<ReportItem>>({
    url: '/admin/reports',
    params
  })
}

export function updateReportApi(id: string, data: Record<string, unknown>) {
  return request<ReportItem>({
    url: `/admin/reports/${id}`,
    method: 'PUT',
    data
  })
}
