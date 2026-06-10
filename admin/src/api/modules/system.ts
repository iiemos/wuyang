import { request } from '../request'
import type { ExportPayload } from '@/utils/download'
import type { PageResult } from './content'
import type { UserItem } from './user'

export interface RoleItem {
  id: string
  code: string
  name: string
  description?: string
  permissions?: Array<{ permissionId?: string; permission: PermissionItem }>
}

export interface PermissionItem {
  id: string
  code: string
  name: string
  description?: string
}

export interface SensitiveWordItem {
  id: string
  word: string
  hitCount: number
  status: string
}

export interface NoticeItem {
  id: string
  title: string
  content: string
  status: string
  createdAt: string
}

export interface OperationLogItem {
  id: string
  operator: string
  action: string
  target: string
  ip?: string
  createdAt: string
}

export interface AdminMenuItem {
  id: string
  parentId?: string | null
  title: string
  path: string
  component?: string | null
  icon?: string | null
  permission?: string | null
  sortOrder: number
  status: string
  children?: AdminMenuItem[]
}

export function getSettingsApi() {
  return request<Record<string, any>>({
    url: '/admin/settings'
  })
}

export function updateSettingsApi(data: Record<string, any>) {
  return request<Record<string, any>>({
    url: '/admin/settings',
    method: 'PUT',
    data
  })
}

export function listSensitiveWordsApi() {
  return request<SensitiveWordItem[]>({
    url: '/admin/sensitive-words'
  })
}

export function addSensitiveWordApi(word: string) {
  return request<SensitiveWordItem>({
    url: '/admin/sensitive-words',
    method: 'POST',
    data: { word }
  })
}

export function addSensitiveWordsApi(words: string[]) {
  return request<SensitiveWordItem[]>({
    url: '/admin/sensitive-words/batch',
    method: 'POST',
    data: { words }
  })
}

export function deleteSensitiveWordApi(id: string) {
  return request<null>({
    url: `/admin/sensitive-words/${id}`,
    method: 'DELETE'
  })
}

export function listNoticesApi() {
  return request<NoticeItem[]>({
    url: '/admin/notices'
  })
}

export function createNoticeApi(data: Pick<NoticeItem, 'title' | 'content' | 'status'>) {
  return request<NoticeItem>({
    url: '/admin/notices',
    method: 'POST',
    data
  })
}

export function updateNoticeApi(id: string, data: Partial<Pick<NoticeItem, 'title' | 'content' | 'status'>>) {
  return request<NoticeItem>({
    url: `/admin/notices/${id}`,
    method: 'PUT',
    data
  })
}

export function deleteNoticeApi(id: string) {
  return request<null>({
    url: `/admin/notices/${id}`,
    method: 'DELETE'
  })
}

export function listRolesApi() {
  return request<RoleItem[]>({
    url: '/admin/roles'
  })
}

export function createRoleApi(data: Partial<RoleItem> & { permissions?: string[] }) {
  return request<RoleItem>({
    url: '/admin/roles',
    method: 'POST',
    data
  })
}

export function updateRoleApi(id: string, data: Partial<RoleItem>) {
  return request<RoleItem>({
    url: `/admin/roles/${id}`,
    method: 'PUT',
    data
  })
}

export function deleteRoleApi(id: string) {
  return request<null>({
    url: `/admin/roles/${id}`,
    method: 'DELETE'
  })
}

export function listPermissionsApi() {
  return request<PermissionItem[]>({
    url: '/admin/permissions'
  })
}

export function updateRolePermissionsApi(id: string, permissions: string[]) {
  return request<RoleItem>({
    url: `/admin/roles/${id}/permissions`,
    method: 'PUT',
    data: { permissions }
  })
}

export function listAdminAccountsApi(params: Record<string, unknown>) {
  return request<PageResult<UserItem>>({
    url: '/admin/admin-accounts',
    params
  })
}

export function createAdminAccountApi(data: Record<string, unknown>) {
  return request<UserItem>({
    url: '/admin/admin-accounts',
    method: 'POST',
    data
  })
}

export function updateAdminAccountApi(id: string, data: Record<string, unknown>) {
  return request<UserItem>({
    url: `/admin/admin-accounts/${id}`,
    method: 'PUT',
    data
  })
}

export function deleteAdminAccountApi(id: string) {
  return request<null>({
    url: `/admin/admin-accounts/${id}`,
    method: 'DELETE'
  })
}

export function listOperationLogsApi(params: Record<string, unknown>) {
  return request<PageResult<OperationLogItem>>({
    url: '/admin/operation-logs',
    params
  })
}

export function exportOperationLogsApi(params: Record<string, unknown>) {
  return request<ExportPayload>({
    url: '/admin/operation-logs/export',
    params
  })
}

export function listAdminMenusApi(params: Record<string, unknown> = {}) {
  return request<AdminMenuItem[]>({
    url: '/admin/menus',
    params
  })
}

export function createAdminMenuApi(data: Partial<AdminMenuItem>) {
  return request<AdminMenuItem>({
    url: '/admin/menus',
    method: 'POST',
    data
  })
}

export function updateAdminMenuApi(id: string, data: Partial<AdminMenuItem>) {
  return request<AdminMenuItem>({
    url: `/admin/menus/${id}`,
    method: 'PUT',
    data
  })
}

export function deleteAdminMenuApi(id: string) {
  return request<null>({
    url: `/admin/menus/${id}`,
    method: 'DELETE'
  })
}
