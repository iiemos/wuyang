export const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '待审核', value: 'pending' },
  { label: '已发布', value: 'approved' },
  { label: '已拒绝', value: 'rejected' },
  { label: '已下架', value: 'offline' },
  { label: '已删除', value: 'deleted' }
]

export const statusLabels: Record<string, string> = {
  pending: '待审核',
  approved: '已发布',
  rejected: '已拒绝',
  offline: '已下架',
  deleted: '已删除',
  handled: '已处理',
  active: '正常',
  banned: '已封禁',
  enabled: '启用',
  disabled: '禁用',
  paid: '已支付',
  refunded: '已退款',
  expired: '已过期',
  sold: '已售出',
  solved: '已解决'
}

export const statusTypes: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
  approved: 'success',
  active: 'success',
  enabled: 'success',
  paid: 'success',
  pending: 'warning',
  offline: 'danger',
  rejected: 'danger',
  banned: 'danger',
  deleted: 'danger',
  handled: 'info',
  disabled: 'info'
}

export const contentResources = [
  { key: 'recruitments', type: 'jobs', label: '招聘管理', shortLabel: '招聘' },
  { key: 'houses', type: 'houses', label: '房源管理', shortLabel: '房源' },
  { key: 'conveniences', type: 'convenience', label: '便民信息', shortLabel: '便民' },
  { key: 'used-goods', type: 'secondhand', label: '二手闲置', shortLabel: '二手' },
  { key: 'shops', type: 'yellowPages', label: '商家服务', shortLabel: '商家' },
  { key: 'articles', type: 'news', label: '资讯管理', shortLabel: '资讯' }
] as const

export const resourceByType = Object.fromEntries(contentResources.map((item) => [item.type, item.key])) as Record<string, string>
export const typeLabels = Object.fromEntries(contentResources.map((item) => [item.type, item.shortLabel])) as Record<string, string>

export function formatDate(value?: string | Date | null) {
  if (!value) return '-'
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('zh-CN', { hour12: false })
}
