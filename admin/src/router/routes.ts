import type { RouteRecordRaw } from 'vue-router'
import BaseLayout from '@/layouts/BaseLayout.vue'

export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    component: () => import('@/views/dashboard/index.vue'),
    meta: { title: '仪表盘', icon: 'DataLine', permissions: ['content:review'] }
  },
  {
    path: '/content',
    redirect: '/content/recruitments',
    meta: { title: '内容管理', icon: 'Document', permissions: ['content:review', 'article:manage'] }
  },
  {
    path: '/content/recruitments',
    component: () => import('@/views/content/index.vue'),
    meta: { title: '招聘管理', resource: 'recruitments', permissions: ['content:review'] }
  },
  {
    path: '/content/houses',
    component: () => import('@/views/content/index.vue'),
    meta: { title: '房源管理', resource: 'houses', permissions: ['content:review'] }
  },
  {
    path: '/content/conveniences',
    component: () => import('@/views/content/index.vue'),
    meta: { title: '便民信息', resource: 'conveniences', permissions: ['content:review'] }
  },
  {
    path: '/content/shops',
    component: () => import('@/views/content/index.vue'),
    meta: { title: '商家服务', resource: 'shops', permissions: ['content:review'] }
  },
  {
    path: '/content/used-goods',
    component: () => import('@/views/content/index.vue'),
    meta: { title: '二手闲置', resource: 'used-goods', permissions: ['content:review'] }
  },
  {
    path: '/content/articles',
    component: () => import('@/views/content/index.vue'),
    meta: { title: '本地资讯', resource: 'articles', permissions: ['article:manage'] }
  },
  {
    path: '/content/featured',
    component: () => import('@/views/content/index.vue'),
    meta: { title: '精选推荐', contentMode: 'featured', permissions: ['content:review'] }
  },
  {
    path: '/content/categories',
    component: () => import('@/views/content/index.vue'),
    meta: { title: '分类管理', contentMode: 'categories', permissions: ['content:review'] }
  },
  {
    path: '/users',
    redirect: '/users/list',
    meta: { title: '用户管理', icon: 'User', permissions: ['user:manage', 'report:handle'] }
  },
  {
    path: '/users/list',
    component: () => import('@/views/users/index.vue'),
    meta: { title: '用户列表', section: 'users', permissions: ['user:manage'] }
  },
  {
    path: '/users/certifications',
    component: () => import('@/views/users/index.vue'),
    meta: { title: '认证申请', section: 'certifications', permissions: ['user:manage'] }
  },
  {
    path: '/users/reports',
    component: () => import('@/views/users/index.vue'),
    meta: { title: '举报反馈', section: 'reports', permissions: ['report:handle'] }
  },
  {
    path: '/operation',
    redirect: '/operation/ads',
    meta: { title: '运营管理', icon: 'TrendCharts', permissions: ['ad:manage'] }
  },
  {
    path: '/operation/ads',
    component: () => import('@/views/operation/index.vue'),
    meta: { title: '广告位管理', section: 'ads', permissions: ['ad:manage'] }
  },
  {
    path: '/operation/orders',
    component: () => import('@/views/operation/index.vue'),
    meta: { title: '置顶订单', section: 'orders', permissions: ['ad:manage'] }
  },
  {
    path: '/operation/revenue',
    component: () => import('@/views/operation/index.vue'),
    meta: { title: '收入趋势', section: 'revenue', permissions: ['ad:manage'] }
  },
  {
    path: '/system',
    redirect: '/system/settings',
    meta: { title: '系统管理', icon: 'Setting', permissions: ['system:setting', 'rbac:manage'] }
  },
  {
    path: '/system/settings',
    component: () => import('@/views/system/index.vue'),
    meta: { title: '平台配置', section: 'settings', permissions: ['system:setting'] }
  },
  {
    path: '/system/sensitive-words',
    component: () => import('@/views/system/index.vue'),
    meta: { title: '敏感词', section: 'words', permissions: ['system:setting'] }
  },
  {
    path: '/system/notices',
    component: () => import('@/views/system/index.vue'),
    meta: { title: '公告通知', section: 'notices', permissions: ['system:setting'] }
  },
  {
    path: '/system/roles',
    component: () => import('@/views/system/index.vue'),
    meta: { title: '角色权限', section: 'roles', permissions: ['rbac:manage'] }
  },
  {
    path: '/system/accounts',
    component: () => import('@/views/system/index.vue'),
    meta: { title: '管理员账号', section: 'accounts', permissions: ['rbac:manage'] }
  },
  {
    path: '/system/logs',
    component: () => import('@/views/system/index.vue'),
    meta: { title: '操作日志', section: 'logs', permissions: ['system:setting'] }
  },
  {
    path: '/system/menus',
    component: () => import('@/views/system/index.vue'),
    meta: { title: '菜单管理', section: 'menus', permissions: ['menu:manage'] }
  }
]

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', guest: true }
  },
  {
    path: '/',
    component: BaseLayout,
    redirect: '/dashboard',
    children: asyncRoutes
  }
]
