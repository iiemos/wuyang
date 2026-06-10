import { request } from '../request'

export function getOverviewApi() {
  return request<any>({
    url: '/admin/overview'
  })
}

export function getDashboardStatsApi() {
  return request<any>({
    url: '/admin/stats/dashboard'
  })
}

export function getOperationStatsApi() {
  return request<any>({
    url: '/admin/stats/operation'
  })
}

export function getRevenueStatsApi() {
  return request<any>({
    url: '/admin/stats/revenue'
  })
}
